export type LoadedCanvasImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  dispose: () => void;
};

export function getSampleDimensions(width: number, height: number, maxDimension: number) {
  const scale = Math.min(1, maxDimension / Math.max(width, height));

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export async function loadImageForCanvas(file: File): Promise<LoadedCanvasImage> {
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

export function loadHtmlImage(file: File): Promise<LoadedCanvasImage> {
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
