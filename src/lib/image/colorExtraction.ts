import { choosePaletteColors, createPaletteColor } from "../color/colorUtils";
import type { ExtractedPalette } from "../../types/color";

type PaletteExtractionOptions = {
  maxDimension?: number;
  colorCount?: number;
  bucketSize?: number;
  minAlpha?: number;
};

type LoadedCanvasImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  dispose: () => void;
};

type ColorBucket = {
  rTotal: number;
  gTotal: number;
  bTotal: number;
  count: number;
};

const DEFAULT_OPTIONS = {
  maxDimension: 112,
  colorCount: 8,
  bucketSize: 24,
  minAlpha: 128,
} satisfies Required<PaletteExtractionOptions>;

export async function extractColorPalette(
  file: File,
  options: PaletteExtractionOptions = {},
): Promise<ExtractedPalette> {
  const resolvedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  const loadedImage = await loadImageForCanvas(file);

  try {
    const { width, height } = getSampleDimensions(
      loadedImage.width,
      loadedImage.height,
      resolvedOptions.maxDimension,
    );
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      throw new Error("Canvas is not available for image color extraction.");
    }

    context.drawImage(loadedImage.source, 0, 0, width, height);

    const imageData = context.getImageData(0, 0, width, height);
    const { candidates, matchedSampleCount } = bucketImageColors(
      imageData.data,
      resolvedOptions.bucketSize,
      resolvedOptions.minAlpha,
    );
    const dominant = candidates[0] ?? null;

    return {
      colors: choosePaletteColors(candidates, resolvedOptions.colorCount),
      dominant,
      totalSampleCount: width * height,
      matchedSampleCount,
    };
  } finally {
    loadedImage.dispose();
  }
}

function bucketImageColors(
  pixelData: Uint8ClampedArray,
  bucketSize: number,
  minAlpha: number,
) {
  const buckets = new Map<string, ColorBucket>();
  let matchedSampleCount = 0;

  for (let index = 0; index < pixelData.length; index += 4) {
    const alpha = pixelData[index + 3];

    if (alpha < minAlpha) {
      continue;
    }

    const alphaRatio = alpha / 255;
    const red = compositeChannel(pixelData[index], alphaRatio);
    const green = compositeChannel(pixelData[index + 1], alphaRatio);
    const blue = compositeChannel(pixelData[index + 2], alphaRatio);
    const bucketKey = [
      Math.floor(red / bucketSize),
      Math.floor(green / bucketSize),
      Math.floor(blue / bucketSize),
    ].join("-");
    const bucket = buckets.get(bucketKey) ?? {
      rTotal: 0,
      gTotal: 0,
      bTotal: 0,
      count: 0,
    };

    bucket.rTotal += red;
    bucket.gTotal += green;
    bucket.bTotal += blue;
    bucket.count += 1;
    matchedSampleCount += 1;
    buckets.set(bucketKey, bucket);
  }

  const candidates = Array.from(buckets.values())
    .map((bucket) =>
      createPaletteColor(
        {
          r: bucket.rTotal / bucket.count,
          g: bucket.gTotal / bucket.count,
          b: bucket.bTotal / bucket.count,
        },
        matchedSampleCount === 0 ? 0 : bucket.count / matchedSampleCount,
      ),
    )
    .sort((first, second) => second.population - first.population);

  return {
    candidates,
    matchedSampleCount,
  };
}

function compositeChannel(channel: number, alphaRatio: number) {
  return Math.round(channel * alphaRatio + 255 * (1 - alphaRatio));
}

function getSampleDimensions(width: number, height: number, maxDimension: number) {
  const scale = Math.min(1, maxDimension / Math.max(width, height));

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function loadImageForCanvas(file: File): Promise<LoadedCanvasImage> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);

      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        dispose: () => bitmap.close(),
      };
    } catch {
      return loadHtmlImage(file);
    }
  }

  return loadHtmlImage(file);
}

function loadHtmlImage(file: File): Promise<LoadedCanvasImage> {
  return new Promise((resolve, reject) => {
    const previewUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve({
        source: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        dispose: () => URL.revokeObjectURL(previewUrl),
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      reject(new Error("The image could not be loaded for color extraction."));
    };

    image.src = previewUrl;
  });
}
