import { useEffect, useState } from "react";
import {
  createPlaceholderThemeResult,
  generateThemeFromImage,
  type ThemeColorTokenPath,
  type ThemeGenerationResult,
  updateThemeColorToken,
} from "../lib/theme";
import type { UploadedImage } from "../types/upload";

type GenerationStatus = "idle" | "processing" | "ready" | "error";

/**
 * Drives the image-upload -> color-extraction -> theme-generation pipeline:
 * regenerates the theme whenever the uploaded image changes (guarding against
 * a stale response landing after a newer upload), falls back to the
 * placeholder theme on failure, and revokes the uploaded image's object URL
 * on cleanup.
 */
export function useThemeGeneration() {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [generationResult, setGenerationResult] =
    useState<ThemeGenerationResult>(() => createPlaceholderThemeResult());
  const [generationStatus, setGenerationStatus] =
    useState<GenerationStatus>("idle");
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    if (!uploadedImage) {
      setGenerationResult(createPlaceholderThemeResult());
      setGenerationStatus("idle");
      setGenerationError(null);
      return;
    }

    setGenerationResult(
      createPlaceholderThemeResult({
        imageName: uploadedImage.file.name,
      }),
    );
    setGenerationStatus("processing");
    setGenerationError(null);

    generateThemeFromImage(uploadedImage.file)
      .then((result) => {
        if (!isCancelled) {
          setGenerationResult(result);
          setGenerationStatus("ready");
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setGenerationResult(
            createPlaceholderThemeResult({
              imageName: uploadedImage.file.name,
            }),
          );
          setGenerationStatus("error");
          setGenerationError(
            "ThemeZip could not extract colors from this image, so it kept the placeholder token preset.",
          );
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [uploadedImage]);

  useEffect(() => {
    return () => {
      if (uploadedImage?.previewUrl) {
        URL.revokeObjectURL(uploadedImage.previewUrl);
      }
    };
  }, [uploadedImage]);

  function handleColorTokenChange(path: ThemeColorTokenPath, value: string) {
    setGenerationResult((currentResult) => ({
      ...currentResult,
      theme: updateThemeColorToken(currentResult.theme, path, value),
    }));
  }

  return {
    uploadedImage,
    setUploadedImage,
    generationResult,
    generationStatus,
    generationError,
    handleColorTokenChange,
  };
}
