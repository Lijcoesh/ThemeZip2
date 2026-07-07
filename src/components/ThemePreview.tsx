import type { CSSProperties } from "react";
import { CodePreview } from "./CodePreview";
import { ContrastWarnings } from "./ContrastWarnings";
import { TokenEditor } from "./TokenEditor";
import type { ExtractedPalette } from "../types/color";
import type { ThemeTokens } from "../types/theme";
import { getThemeContrastChecks, type ThemeColorTokenPath } from "../lib/theme";

type ThemeGenerationStatus = "idle" | "processing" | "ready" | "error";

type ThemePreviewProps = {
  theme: ThemeTokens;
  palette: ExtractedPalette | null;
  status: ThemeGenerationStatus;
  error: string | null;
  hasUploadedImage: boolean;
  onColorTokenChange: (path: ThemeColorTokenPath, value: string) => void;
};

export function ThemePreview({
  theme,
  palette,
  status,
  error,
  hasUploadedImage,
  onColorTokenChange,
}: ThemePreviewProps) {
  const previewStyles = {
    "--theme-primary": theme.colors.brand.primary,
    "--theme-secondary": theme.colors.brand.secondary,
    "--theme-accent": theme.colors.brand.accent,
    "--theme-page": theme.colors.background.page,
    "--theme-surface": theme.colors.background.surface,
    "--theme-muted": theme.colors.background.muted,
    "--theme-text-primary": theme.colors.text.primary,
    "--theme-text-secondary": theme.colors.text.secondary,
    "--theme-text-muted": theme.colors.text.muted,
    "--theme-text-inverse": theme.colors.text.inverse,
    "--theme-border": theme.colors.border.default,
    "--theme-strong-border": theme.colors.border.strong,
    "--theme-shadow": theme.shadows.md,
  } as CSSProperties;
  const statusLabel = getStatusLabel(status, hasUploadedImage);
  const statusClassName = ["preview-status", `is-${status}`].join(" ");
  const contrastChecks = getThemeContrastChecks(theme.colors);

  return (
    <section className="preview-section" aria-labelledby="preview-title">
      <div className="preview-header">
        <div>
          <h2 id="preview-title">Generated theme preview</h2>
          <p>
            Preview semantic color suggestions from the uploaded reference.
            Spacing, radius, shadows and typography stay as preset tokens for
            now.
          </p>
          {error ? (
            <p className="generation-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <span className={statusClassName}>{statusLabel}</span>
      </div>

      <div className="preview-canvas" style={previewStyles}>
        <div className="theme-page-section">
          <span className="theme-badge">React starter theme</span>
          <h3>Semantic tokens ready for component checks.</h3>
          <p>
            Preview the button, card, input, badge and alert against one shared
            token set before ThemeZip exports anything.
          </p>

          <div className="theme-controls">
            <button className="theme-button" type="button">
              Preview button
            </button>
            <span className="theme-badge">Badge</span>
          </div>

          <div className="theme-card">
            <h4>Card example</h4>
            <p>
              Cards use surface, border, radius and shadow tokens from the same
              generated theme object.
            </p>

            <label className="theme-field">
              Example input
              <input
                className="theme-input"
                type="text"
                placeholder="Preview input"
              />
            </label>
          </div>

          <CodePreview theme={theme} variant="embedded" />
        </div>

        <aside className="token-panel" aria-label="Generated semantic color tokens">
          <h3>Editable color tokens</h3>

          {palette?.colors.length ? (
            <div className="palette-summary" aria-label="Extracted palette">
              <span className="token-group-title">Extracted palette</span>
              <div className="palette-swatches">
                {palette.colors.map((color) => (
                  <span
                    className="palette-swatch"
                    style={{ backgroundColor: color.hex }}
                    title={`${color.hex} (${Math.round(
                      color.population * 100,
                    )}% of sampled pixels)`}
                    aria-label={color.hex}
                    key={color.hex}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <TokenEditor
            colors={theme.colors}
            disabled={status === "processing"}
            onColorChange={onColorTokenChange}
          />
        </aside>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <ContrastWarnings checks={contrastChecks} />
      </div>
    </section>
  );
}

function getStatusLabel(
  status: ThemeGenerationStatus,
  hasUploadedImage: boolean,
) {
  if (!hasUploadedImage) {
    return "Waiting for image";
  }

  if (status === "processing") {
    return "Extracting colors";
  }

  if (status === "ready") {
    return "Color tokens generated";
  }

  if (status === "error") {
    return "Fallback tokens";
  }

  return "Image loaded";
}
