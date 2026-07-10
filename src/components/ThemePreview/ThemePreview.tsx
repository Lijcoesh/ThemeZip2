import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import type { SxProps, Theme } from "@mui/material/styles";
import { ContrastWarnings } from "../ContrastWarnings";
import { ThemeExportPanel } from "../ThemeExportPanel";
import { TokenEditor } from "../TokenEditor";
import { ThemeShowcaseCard } from "./ThemeShowcaseCard";
import type { ExtractedPalette } from "../../types/color";
import type { ThemeTokens } from "../../types/theme";
import { getThemeContrastChecks, type ThemeColorTokenPath } from "../../lib/theme";
import { chromeColors } from "../../theme/muiTheme";

type ThemeGenerationStatus = "idle" | "processing" | "ready" | "error";

type ThemePreviewProps = {
  theme: ThemeTokens;
  palette: ExtractedPalette | null;
  status: ThemeGenerationStatus;
  error: string | null;
  hasUploadedImage: boolean;
  source: "placeholder" | "image";
  sourceImageName?: string;
  onColorTokenChange: (path: ThemeColorTokenPath, value: string) => void;
};

/**
 * `.preview-status` base (background primary-soft / color primary) plus the
 * `.is-ready` / `.is-processing` / `.is-error` variants — all STATIC chrome
 * colors, unrelated to the dynamic `theme` prop.
 */
const statusPillColors: Record<
  ThemeGenerationStatus,
  { background: string; color: string }
> = {
  idle: { background: chromeColors.primarySoft, color: chromeColors.primary },
  processing: { background: "#eff6ff", color: "#1d4ed8" },
  ready: { background: "#e5f4ef", color: "#0d7a67" },
  error: { background: chromeColors.dangerSoft, color: chromeColors.danger },
};

function statusPillSx(status: ThemeGenerationStatus): SxProps<Theme> {
  const colors = statusPillColors[status];
  return {
    height: "auto",
    background: colors.background,
    color: colors.color,
    fontSize: "0.875rem",
    "& .MuiChip-label": {
      padding: "8px 12px",
    },
  };
}

export function ThemePreview({
  theme,
  palette,
  status,
  error,
  hasUploadedImage,
  source,
  sourceImageName,
  onColorTokenChange,
}: ThemePreviewProps) {
  const statusLabel = getStatusLabel(status, hasUploadedImage);
  const contrastChecks = getThemeContrastChecks(theme.colors);

  return (
    <Paper
      component="section"
      elevation={0}
      aria-labelledby="preview-title"
      sx={{
        border: `1px solid ${chromeColors.border}`,
        boxShadow: chromeColors.shadowMd,
        padding: "24px",
        "@media (max-width: 520px)": {
          padding: "16px",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: "24px",
          alignItems: "start",
          marginBottom: "22px",
          "@media (max-width: 920px)": {
            flexDirection: "column",
          },
        }}
      >
        <Box>
          <Box
            component="h2"
            id="preview-title"
            sx={{
              margin: 0,
              color: chromeColors.ink,
              fontSize: "1.35rem",
              fontWeight: 700,
            }}
          >
            Generated theme preview
          </Box>
          <Box
            component="p"
            sx={{
              margin: "8px 0 0",
              color: chromeColors.muted,
              lineHeight: 1.6,
            }}
          >
            Preview semantic color suggestions from the uploaded reference.
            Spacing, radius, shadows and typography stay as preset tokens for
            now.
          </Box>
          <Box
            component="p"
            role="note"
            sx={{
              // `.preview-header p` (margin: 8px 0 0; color: muted;
              // line-height: 1.6) has higher specificity (class+type) than
              // `.preview-note` (class only) and wins the conflicting
              // `margin` declaration outright — the note's own `margin: 12px
              // 0 0` never actually applies. Reproduced 1:1 here.
              margin: "8px 0 0",
              padding: "12px 14px",
              borderLeft: "4px solid #d97706",
              borderRadius: "8px",
              background: "rgba(217, 119, 6, 0.08)",
              color: chromeColors.muted,
              fontSize: "0.95rem",
              lineHeight: 1.6,
            }}
          >
            Important: this works best with images that have a limited color
            palette. The more colors and visual noise in the source, the more
            likely the generated theme will be less accurate. Screenshots of
            busy sites with lots of photos or mixed imagery usually produce
            weaker results.
          </Box>
          {error ? (
            <Box
              component="p"
              role="alert"
              sx={{
                // Same specificity clash as `.preview-note` above:
                // `.preview-header p` overrides `.generation-error`'s own
                // `margin` (10px 0 0) AND `color` (danger) since both
                // properties are declared in the higher-specificity rule.
                // The error text renders in muted gray with an 8px top
                // margin today, not red with 10px — preserved as-is.
                margin: "8px 0 0",
                color: chromeColors.muted,
                fontWeight: 700,
                lineHeight: 1.6,
              }}
            >
              {error}
            </Box>
          ) : null}
        </Box>
        <Chip label={statusLabel} sx={statusPillSx(status)} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.15fr) minmax(260px, 0.85fr)",
          gap: "20px",
          padding: "20px",
          border: `1px solid ${theme.colors.border.default}`,
          borderRadius: "8px",
          background: theme.colors.background.page,
          color: theme.colors.text.primary,
          "@media (max-width: 920px)": {
            gridTemplateColumns: "1fr",
          },
          "@media (max-width: 520px)": {
            padding: "16px",
          },
        }}
      >
        <ThemeShowcaseCard theme={theme} />

        <Box
          component="aside"
          aria-label="Generated semantic color tokens"
          sx={{
            display: "grid",
            gap: "16px",
            alignContent: "start",
            padding: "16px",
            // `.token-panel` inherits the `--theme-border` / `--theme-surface`
            // custom properties cascading down from `.preview-canvas`'s
            // inline style, so its border/background are the dynamic theme
            // tokens too, not static chrome — despite reading like a plain
            // chrome container at a glance.
            border: `1px solid ${theme.colors.border.default}`,
            borderRadius: "8px",
            background: theme.colors.background.surface,
          }}
        >
          <Box
            component="h3"
            sx={{
              margin: 0,
              // No color declared on `.token-panel h3`; it inherits
              // `.preview-canvas`'s `color: var(--theme-text-primary)`.
              color: theme.colors.text.primary,
              fontSize: "1rem",
              fontWeight: 700,
            }}
          >
            Editable color tokens
          </Box>

          {palette?.colors.length ? (
            <Box aria-label="Extracted palette" sx={{ display: "grid", gap: "10px" }}>
              <Box
                component="span"
                sx={{
                  color: theme.colors.text.muted,
                  fontSize: "0.76rem",
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Extracted palette
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {palette.colors.map((color) => (
                  <Box
                    component="span"
                    sx={{
                      width: "28px",
                      height: "28px",
                      border: `1px solid ${theme.colors.border.default}`,
                      borderRadius: "8px",
                      backgroundColor: color.hex,
                    }}
                    title={`${color.hex} (${Math.round(
                      color.population * 100,
                    )}% of sampled pixels)`}
                    aria-label={color.hex}
                    key={color.hex}
                  />
                ))}
              </Box>
            </Box>
          ) : null}

          <TokenEditor
            colors={theme.colors}
            disabled={status === "processing"}
            onColorChange={onColorTokenChange}
          />
        </Box>
      </Box>
      <Box sx={{ marginTop: "1rem" }}>
        <ContrastWarnings checks={contrastChecks} />
      </Box>

      <ThemeExportPanel
        theme={theme}
        palette={palette}
        contrastChecks={contrastChecks}
        source={source}
        sourceImageName={sourceImageName}
        disabled={!hasUploadedImage || status === "processing"}
      />
    </Paper>
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
