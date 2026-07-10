import { getSampleDimensions, loadImageForCanvas } from "./imageLoading";
import { bucketImageColors } from "./pixelBucketing";
import { choosePaletteColors } from "./paletteSelection";
import type { ExtractedPalette } from "../../../types/color";

type PaletteExtractionOptions = {
  maxDimension?: number;
  colorCount?: number;
  bucketSize?: number;
  minAlpha?: number;
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
    const { candidates, sampledPixelCount } = bucketImageColors(
      imageData.data,
      resolvedOptions.bucketSize,
      resolvedOptions.minAlpha,
    );
    const dominant = candidates[0] ?? null;

    return {
      colors: choosePaletteColors(candidates, resolvedOptions.colorCount),
      dominant,
      sourcePixelCount: width * height,
      sampledPixelCount,
    };
  } finally {
    loadedImage.dispose();
  }
}
