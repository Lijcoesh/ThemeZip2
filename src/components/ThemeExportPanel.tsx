import { useEffect, useMemo, useState } from "react";
import type { ExtractedPalette } from "../types/color";
import type { ThemeTokens } from "../types/theme";
import type { ThemeContrastCheck } from "../lib/theme";
import {
  areThemeExportFormatsEqual,
  defaultThemeExportFormatIds,
  fullThemeExportFormatIds,
  getThemeKitDownloadLabel,
  themeExportFormatOptions,
  type ThemeExportFormatId,
} from "../lib/export/exportFormats";
import {
  createThemeKitZipFilename,
  downloadBlob,
  generateThemeKitZip,
} from "../lib/export/themeKitZip";

type ExportStatus = "idle" | "generating" | "downloaded" | "error";

type ThemeExportPanelProps = {
  theme: ThemeTokens;
  palette: ExtractedPalette | null;
  contrastChecks: readonly ThemeContrastCheck[];
  source: "placeholder" | "image";
  sourceImageName?: string;
  disabled?: boolean;
};

export function ThemeExportPanel({
  theme,
  palette,
  contrastChecks,
  source,
  sourceImageName,
  disabled = false,
}: ThemeExportPanelProps) {
  const [selectedFormats, setSelectedFormats] = useState<
    ThemeExportFormatId[]
  >([...defaultThemeExportFormatIds]);
  const [exportStatus, setExportStatus] = useState<ExportStatus>("idle");
  const [exportError, setExportError] = useState<string | null>(null);
  const isFullKitSelected = useMemo(
    () => areThemeExportFormatsEqual(selectedFormats, fullThemeExportFormatIds),
    [selectedFormats],
  );
  const areExportControlsDisabled = exportStatus === "generating";
  const downloadDisabledReason = disabled
    ? "Upload an image before downloading the generated theme kit."
    : null;
  const downloadLabel = getThemeKitDownloadLabel(selectedFormats);

  useEffect(() => {
    setExportStatus("idle");
    setExportError(null);
  }, [theme, palette, source, sourceImageName]);

  function handleFormatToggle(formatId: ThemeExportFormatId) {
    setExportStatus("idle");
    setExportError(null);
    setSelectedFormats((currentFormats) => {
      const isSelected = currentFormats.includes(formatId);

      if (isSelected && currentFormats.length === 1) {
        return currentFormats;
      }

      if (isSelected) {
        return currentFormats.filter((currentFormat) => currentFormat !== formatId);
      }

      return [...currentFormats, formatId];
    });
  }

  function handleFullKitSelect() {
    setExportStatus("idle");
    setExportError(null);
    setSelectedFormats([...fullThemeExportFormatIds]);
  }

  async function handleDownloadClick() {
    setExportStatus("generating");
    setExportError(null);

    try {
      const zipBlob = await generateThemeKitZip({
        theme,
        palette,
        contrastChecks,
        selectedFormats,
        source,
        sourceImageName,
      });

      downloadBlob(zipBlob, createThemeKitZipFilename(sourceImageName));
      setExportStatus("downloaded");
    } catch {
      setExportStatus("error");
      setExportError(
        "ThemeZip could not create the ZIP in this browser session. Try again after checking the selected outputs.",
      );
    }
  }

  return (
    <section className="export-panel" aria-labelledby="export-panel-title">
      <div className="export-panel-header">
        <div>
          <span className="export-kicker">Theme kit export</span>
          <h3 id="export-panel-title">Choose export formats</h3>
          <p>
            Select the files you want ThemeZip to include in your ZIP. The same
            semantic tokens power every selected output.
          </p>
        </div>

        <button
          className={`export-preset-button ${isFullKitSelected ? "is-active" : ""}`}
          type="button"
          aria-pressed={isFullKitSelected}
          disabled={areExportControlsDisabled}
          onClick={handleFullKitSelect}
        >
          Full kit
        </button>
      </div>

      <div className="export-options">
        {themeExportFormatOptions.map((option) => {
          const isSelected = selectedFormats.includes(option.id);
          const isLastSelected = isSelected && selectedFormats.length === 1;

          return (
            <label
              className={[
                "export-option",
                isSelected ? "is-selected" : "",
                isLastSelected || areExportControlsDisabled ? "is-locked" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-disabled={isLastSelected || areExportControlsDisabled}
              key={option.id}
            >
              <input
                type="checkbox"
                checked={isSelected}
                disabled={isLastSelected || areExportControlsDisabled}
                onChange={() => handleFormatToggle(option.id)}
              />
              <span>
                <strong>{option.label}</strong>
                <small>{option.description}</small>
                <code>{option.fileHint}</code>
              </span>
            </label>
          );
        })}
      </div>

      <div className="export-actions">
        <div className="export-summary">
          <strong>{formatSelectedCount(selectedFormats.length)}</strong>
          <span>At least one format stays selected for every ZIP.</span>
        </div>

        <span
          className="download-button-wrap"
        >
          <button
            className="download-button"
            type="button"
            disabled={disabled || areExportControlsDisabled}
            onClick={handleDownloadClick}
          >
            {exportStatus === "generating" ? "Creating ZIP..." : downloadLabel}
          </button>
          {downloadDisabledReason ? (
            <span className="download-tooltip" role="tooltip">
              {downloadDisabledReason}
            </span>
          ) : null}
        </span>
      </div>

      {exportStatus === "downloaded" ? (
        <p className="export-success" role="status">
          ZIP generated locally and download started.
        </p>
      ) : null}

      {exportError ? (
        <p className="export-error" role="alert">
          {exportError}
        </p>
      ) : null}
    </section>
  );
}

function formatSelectedCount(selectedCount: number) {
  return `${selectedCount} output ${selectedCount === 1 ? "format" : "formats"} selected`;
}
