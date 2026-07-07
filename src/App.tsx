import { useEffect, useState } from "react";
import { ImageUploader } from "./components/ImageUploader";
import { ThemePreview } from "./components/ThemePreview";
import {
  createPlaceholderThemeResult,
  generateThemeFromImage,
  type ThemeGenerationResult,
  type ThemeColorTokenPath,
  updateThemeColorToken,
} from "./lib/theme";
import type { UploadedImage } from "./types/upload";
import "./App.css";

type GenerationStatus = "idle" | "processing" | "ready" | "error";

function App() {
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

  return (
    <main className="app-shell">
      <section className="hero-section" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">ThemeZip MVP</p>
          <h1 id="page-title">
            Generate a React theme starter from a visual reference.
          </h1>
          <p className="hero-description">
            Upload a screenshot, logo or UI mockup and preview a practical
            starter theme with semantic color tokens. Image processing stays
            local in your browser for this MVP phase.
          </p>
        </div>

        <ImageUploader value={uploadedImage} onImageChange={setUploadedImage} />
      </section>

      <ThemePreview
        theme={generationResult.theme}
        palette={generationResult.palette}
        status={generationStatus}
        error={generationError}
        hasUploadedImage={Boolean(uploadedImage)}
        source={generationResult.source}
        sourceImageName={uploadedImage?.file.name}
        onColorTokenChange={handleColorTokenChange}
      />
    </main>
  );
}

export default App;
