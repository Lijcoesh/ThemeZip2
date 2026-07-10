import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { ExtractedPalette } from "../../types/color";
import type { ThemeTokens } from "../../types/theme";
import type { ThemeContrastCheck } from "../../lib/theme";
import {
  areThemeExportFormatsEqual,
  defaultThemeExportFormatIds,
  fullThemeExportFormatIds,
  getThemeKitDownloadLabel,
  themeExportFormatOptions,
  type ThemeExportFormatId,
} from "../../lib/export/exportFormats";
import {
  createThemeKitZipFilename,
  downloadBlob,
  generateThemeKitZip,
} from "../../lib/export/themeKitZip";
import {
  chromeColors,
  filledButtonSx,
  ghostButtonActiveSx,
  ghostButtonSx,
} from "../../theme/muiTheme";
import { ExportFormatOptions } from "./ExportFormatOptions";

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
    <Paper
      component="section"
      aria-labelledby="export-panel-title"
      sx={{
        display: "grid",
        gap: "18px",
        marginTop: "20px",
        padding: "18px",
        border: `1px solid ${chromeColors.border}`,
        borderRadius: "8px",
        background: chromeColors.surface,
        color: chromeColors.ink,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            component="span"
            sx={{
              color: chromeColors.primary,
              fontSize: "0.76rem",
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Theme kit export
          </Typography>
          <Typography
            component="h3"
            id="export-panel-title"
            sx={{
              margin: "4px 0 0",
              color: chromeColors.ink,
              fontSize: "1.08rem",
              fontWeight: 700,
            }}
          >
            Choose export formats
          </Typography>
          <Typography
            component="p"
            sx={{
              maxWidth: "660px",
              margin: "6px 0 0",
              color: chromeColors.muted,
              lineHeight: 1.55,
            }}
          >
            Select the files you want ThemeZip to include in your ZIP. The same
            semantic tokens power every selected output.
          </Typography>
        </Box>

        <Button
          type="button"
          aria-pressed={isFullKitSelected}
          onClick={handleFullKitSelect}
          sx={[ghostButtonSx, isFullKitSelected && ghostButtonActiveSx]}
        >
          Full kit
        </Button>
      </Box>

      <ExportFormatOptions
        options={themeExportFormatOptions}
        selectedFormats={selectedFormats}
        onToggle={handleFormatToggle}
      />

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gap: "4px",
            color: chromeColors.muted,
            fontSize: "0.9rem",
          }}
        >
          <Typography
            component="strong"
            sx={{ color: chromeColors.ink, fontSize: "0.9rem", fontWeight: 700 }}
          >
            {formatSelectedCount(selectedFormats.length)}
          </Typography>
          <Typography component="span" sx={{ color: "inherit", fontSize: "0.9rem" }}>
            At least one format stays selected for every ZIP.
          </Typography>
        </Box>

        <Button
          type="button"
          disabled={disabled || exportStatus === "generating"}
          onClick={handleDownloadClick}
          sx={filledButtonSx}
        >
          {exportStatus === "generating" ? "Creating ZIP..." : downloadLabel}
        </Button>
      </Box>

      {disabled ? (
        <Typography
          component="p"
          role="status"
          sx={{ margin: 0, color: chromeColors.ink, fontWeight: 800 }}
        >
          Upload an image and let ThemeZip finish generating tokens before
          downloading.
        </Typography>
      ) : null}

      {exportStatus === "downloaded" ? (
        <Typography
          component="p"
          role="status"
          sx={{ margin: 0, color: chromeColors.primary, fontWeight: 800 }}
        >
          ZIP generated locally and download started.
        </Typography>
      ) : null}

      {exportError ? (
        <Typography
          component="p"
          role="alert"
          sx={{ margin: 0, color: chromeColors.danger, fontWeight: 800 }}
        >
          {exportError}
        </Typography>
      ) : null}
    </Paper>
  );
}

function formatSelectedCount(selectedCount: number) {
  return `${selectedCount} output ${selectedCount === 1 ? "format" : "formats"} selected`;
}
