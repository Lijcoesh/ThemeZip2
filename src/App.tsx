import { useEffect, useState } from "react";
import { HtmlUploader } from "./components/HtmlUploader";
import { ImageUploader } from "./components/ImageUploader";
import { ThemePreview } from "./components/ThemePreview";
import {
  createPlaceholderThemeResult,
  generatePlaceholderTheme,
  generateThemeFromHtml,
  generateThemeFromImage,
  type ThemeGenerationResult,
  type ThemeColorTokenPath,
  updateThemeColorToken,
} from "./lib/theme";
import type { UploadedHtml, UploadedImage } from "./types/upload";
import "./App.css";

type GenerationStatus = "idle" | "processing" | "ready" | "error";
type UploadMode = "image" | "html";

function App() {
  const [uploadMode, setUploadMode] = useState<UploadMode>("image");
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [uploadedHtml, setUploadedHtml] = useState<UploadedHtml | null>(null);
  const [generationResult, setGenerationResult] =
    useState<ThemeGenerationResult>(() => createPlaceholderThemeResult());
  const [generationStatus, setGenerationStatus] =
    useState<GenerationStatus>("idle");
  const [generationError, setGenerationError] = useState<string | null>(null);

  const activeSource = uploadMode === "image" ? uploadedImage : uploadedHtml;

  useEffect(() => {
    let isCancelled = false;

    if (!activeSource) {
      setGenerationResult(createPlaceholderThemeResult());
      setGenerationStatus("idle");
      setGenerationError(null);
      return;
    }

    setGenerationResult({
      theme: generatePlaceholderTheme(),
      palette: null,
      source: activeSource.kind,
    });
    setGenerationStatus("processing");
    setGenerationError(null);

    const generation =
      activeSource.kind === "image"
        ? generateThemeFromImage(activeSource.file)
        : generateThemeFromHtml(activeSource.htmlText);

    generation
      .then((result) => {
        if (!isCancelled) {
          setGenerationResult(result);
          setGenerationStatus("ready");
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setGenerationResult(createPlaceholderThemeResult());
          setGenerationStatus("error");
          setGenerationError(
            activeSource.kind === "image"
              ? "ThemeZip could not extract colors from this image, so it kept the placeholder token preset."
              : "ThemeZip could not extract colors from this HTML page, so it kept the placeholder token preset.",
          );
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeSource]);

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
          <h1 id="page-title">
            Generate a React theme starter from a visual reference.
          </h1>
          <p className="hero-description">
            Upload a screenshot, logo or UI mockup — or import a page you saved
            as HTML — and preview a practical starter theme with semantic
            color tokens. Processing stays local in your browser.
          </p>
        </div>

        <section className="upload-card" aria-labelledby="upload-title">
          <div className="upload-mode-tabs" role="tablist" aria-label="Reference source type">
            <button
              className={`upload-mode-tab ${uploadMode === "image" ? "is-active" : ""}`}
              type="button"
              role="tab"
              aria-selected={uploadMode === "image"}
              onClick={() => setUploadMode("image")}
            >
              Image
            </button>
            <button
              className={`upload-mode-tab ${uploadMode === "html" ? "is-active" : ""}`}
              type="button"
              role="tab"
              aria-selected={uploadMode === "html"}
              onClick={() => setUploadMode("html")}
            >
              HTML page
            </button>
          </div>

          {uploadMode === "image" ? (
            <ImageUploader value={uploadedImage} onImageChange={setUploadedImage} />
          ) : (
            <HtmlUploader value={uploadedHtml} onHtmlChange={setUploadedHtml} />
          )}
        </section>
      </section>

      <ThemePreview
        theme={generationResult.theme}
        palette={generationResult.palette}
        status={generationStatus}
        error={generationError}
        hasActiveSource={Boolean(activeSource)}
        source={generationResult.source}
        sourceFileName={activeSource?.file.name}
        onColorTokenChange={handleColorTokenChange}
      />
    </main>
  );
}

export default App;
