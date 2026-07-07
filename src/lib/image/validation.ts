import type { ImageDimensions } from "../../types/upload";

export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const ACCEPTED_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

type ImageValidationResult =
  | {
      ok: true;
      dimensions: ImageDimensions;
    }
  | {
      ok: false;
      message: string;
    };

export async function validateImageFile(
  file: File,
): Promise<ImageValidationResult> {
  const extension = getFileExtension(file.name);
  const hasAcceptedExtension = ACCEPTED_IMAGE_EXTENSIONS.includes(extension);
  const hasAcceptedType = file.type
    ? ACCEPTED_IMAGE_TYPES.includes(file.type.toLowerCase())
    : true;

  if (!hasAcceptedExtension || !hasAcceptedType) {
    return {
      ok: false,
      message: "Upload a PNG, JPG, JPEG or WebP image.",
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      ok: false,
      message: `Choose an image smaller than ${formatFileSize(
        MAX_IMAGE_SIZE_BYTES,
      )}.`,
    };
  }

  try {
    const dimensions = await readImageDimensions(file);
    return {
      ok: true,
      dimensions,
    };
  } catch {
    return {
      ok: false,
      message: "The selected file could not be loaded as an image.",
    };
  }
}

export function formatFileSize(bytes: number) {
  const megabytes = bytes / 1024 / 1024;
  return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
}

function getFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex === -1 ? "" : fileName.slice(lastDotIndex).toLowerCase();
}

function readImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const previewUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(previewUrl);
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      reject(new Error("Invalid image"));
    };

    image.src = previewUrl;
  });
}
