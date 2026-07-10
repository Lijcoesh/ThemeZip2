import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  generateThemeCodePreviews,
  type GeneratedThemeCodeFile,
  type ThemeCodePreviewId,
} from "../../lib/theme";
import type { ThemeTokens } from "../../types/theme";
import { chromeColors, monoFontFamily } from "../../theme/muiTheme";
import { CodeFileTree } from "./CodeFileTree";

type CodePreviewVariant = "default" | "embedded";

type CodePreviewProps = {
  theme: ThemeTokens;
  variant?: CodePreviewVariant;
};

// Dark IDE-style panel palette local to this component. Nothing else in the
// app uses this dark aesthetic, so these stay local hex literals rather than
// joining the shared chromeColors chrome tokens.
const panelBackground = "#101816";
const metaInk = "#dbe7e2";
const metaDescriptionInk = "#aebfba";
const metaLanguageInk = "#a7f3d0";
const codeBlockInk = "#dbe7e2";
const metaBorder = "rgba(255, 255, 255, 0.1)";
const languageChipBorder = "rgba(255, 255, 255, 0.14)";

const narrowLayoutQuery = "@media (max-width:920px)";

export function CodePreview({ theme, variant = "default" }: CodePreviewProps) {
  const embedded = variant === "embedded";
  const previews = useMemo(() => generateThemeCodePreviews(theme), [theme]);
  const [selectedPreviewId, setSelectedPreviewId] =
    useState<ThemeCodePreviewId>("typescript");
  const [selectedFileIds, setSelectedFileIds] = useState<
    Partial<Record<ThemeCodePreviewId, string>>
  >({});
  const selectedPreview =
    previews.find((preview) => preview.id === selectedPreviewId) ?? previews[0];
  const selectedFileId =
    selectedFileIds[selectedPreview.id] ?? selectedPreview.files[0].id;
  const selectedFile =
    selectedPreview.files.find((file) => file.id === selectedFileId) ??
    selectedPreview.files[0];

  function handleFileSelect(file: GeneratedThemeCodeFile) {
    setSelectedFileIds((currentFileIds) => ({
      ...currentFileIds,
      [selectedPreview.id]: file.id,
    }));
  }

  return (
    <Box
      component="section"
      aria-labelledby="code-preview-title"
      sx={{
        display: "grid",
        gap: embedded ? "12px" : "16px",
        padding: embedded ? "14px" : "16px",
        border: `1px solid ${embedded ? theme.colors.border.default : chromeColors.border}`,
        borderRadius: "8px",
        background: embedded ? theme.colors.background.surface : chromeColors.surface,
        color: embedded ? theme.colors.text.primary : chromeColors.ink,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
        <Box>
          <Typography
            component="span"
            sx={{
              display: "block",
              color: embedded ? theme.colors.brand.primary : chromeColors.primary,
              fontSize: "0.76rem",
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Generated output
          </Typography>
          <Typography
            component="h3"
            id="code-preview-title"
            sx={{
              margin: "4px 0 0",
              color: embedded ? theme.colors.text.primary : chromeColors.ink,
              fontSize: "1.05rem",
            }}
          >
            Code previews
          </Typography>
          <Typography
            component="p"
            sx={{
              maxWidth: "660px",
              margin: "6px 0 0",
              color: embedded ? theme.colors.text.secondary : chromeColors.muted,
              lineHeight: 1.5,
              fontSize: embedded ? "0.9rem" : undefined,
            }}
          >
            {embedded
              ? "Open a generated file and check how the current theme tokens export."
              : "These client-side outputs are generated from the current token set and refresh as soon as color tokens change."}
          </Typography>
        </Box>
      </Box>

      <Tabs
        aria-label="Generated code formats"
        value={selectedPreview.id}
        onChange={(_event, newValue: ThemeCodePreviewId) =>
          setSelectedPreviewId(newValue)
        }
        slotProps={{ indicator: { style: { display: "none" } } }}
        sx={{
          minHeight: 0,
          overflow: "visible",
          "& .MuiTabs-scroller": {
            overflow: "visible !important",
          },
          "& .MuiTabs-list": {
            flexWrap: "wrap",
            gap: "8px",
          },
        }}
      >
        {previews.map((preview) => (
          <Tab
            key={preview.id}
            value={preview.id}
            label={preview.title}
            id={`code-preview-tab-${preview.id}`}
            aria-controls={`code-preview-panel-${preview.id}`}
            sx={tabSx(embedded, theme)}
          />
        ))}
      </Tabs>

      <Box
        component="article"
        id={`code-preview-panel-${selectedPreview.id}`}
        role="tabpanel"
        aria-labelledby={`code-preview-tab-${selectedPreview.id}`}
        sx={{
          overflow: "hidden",
          border: `1px solid ${embedded ? theme.colors.border.default : chromeColors.border}`,
          borderRadius: "8px",
          background: panelBackground,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: embedded
              ? "minmax(136px, 168px) minmax(0, 1fr)"
              : "minmax(170px, 220px) minmax(0, 1fr)",
            minHeight: embedded ? "268px" : "360px",
            // In the original CSS, `.code-preview-section.is-embedded
            // .code-preview-browser` (two classes) always outranks this
            // responsive `.code-preview-browser` override (one class) —
            // since this component is only ever rendered with
            // variant="embedded" in the app, that collapse never actually
            // fires there. Only apply it for the (unused-in-practice)
            // default variant, to match real behavior exactly.
            ...(!embedded && {
              [narrowLayoutQuery]: {
                gridTemplateColumns: "1fr",
              },
            }),
          }}
        >
          <CodeFileTree
            files={selectedPreview.files}
            selectedFileId={selectedFile.id}
            onFileSelect={handleFileSelect}
            embedded={embedded}
            ariaLabel={`${selectedPreview.title} files`}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateRows: "auto minmax(0, 1fr)",
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
                padding: embedded ? "12px" : "14px 16px",
                borderBottom: `1px solid ${metaBorder}`,
                color: metaInk,
              }}
            >
              <Box>
                <Typography
                  component="strong"
                  sx={{
                    display: "block",
                    color: "#ffffff",
                    fontFamily: monoFontFamily,
                    fontSize: embedded ? "0.8rem" : "0.9rem",
                  }}
                >
                  {selectedFile.path}
                </Typography>
                <Typography
                  component="p"
                  sx={{
                    display: embedded ? "none" : "block",
                    margin: "4px 0 0",
                    color: metaDescriptionInk,
                    fontSize: "0.86rem",
                    lineHeight: 1.5,
                  }}
                >
                  {selectedPreview.description}
                </Typography>
              </Box>
              <Typography
                component="span"
                sx={{
                  border: `1px solid ${languageChipBorder}`,
                  borderRadius: "999px",
                  color: metaLanguageInk,
                  fontSize: "0.72rem",
                  fontWeight: 900,
                  padding: "5px 8px",
                  textTransform: "uppercase",
                }}
              >
                {selectedFile.language}
              </Typography>
            </Box>

            <Box
              component="pre"
              tabIndex={0}
              sx={{
                maxHeight: embedded ? "260px" : "420px",
                margin: 0,
                overflow: "auto",
                padding: embedded ? "12px" : "16px",
                color: codeBlockInk,
                fontFamily: monoFontFamily,
                fontSize: embedded ? "0.72rem" : "0.8rem",
                lineHeight: embedded ? 1.6 : 1.65,
                whiteSpace: "pre",
                "&:focus-visible": {
                  outline: `3px solid ${chromeColors.focusRing}`,
                  outlineOffset: "3px",
                },
              }}
            >
              <code>{selectedFile.code}</code>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function tabSx(embedded: boolean, theme: ThemeTokens): SxProps<Theme> {
  const borderColor = embedded ? theme.colors.border.default : chromeColors.border;
  const background = embedded ? theme.colors.background.page : chromeColors.page;
  const color = embedded ? theme.colors.text.secondary : chromeColors.muted;
  const activeSx = {
    borderColor: embedded ? theme.colors.brand.primary : chromeColors.primary,
    background: embedded ? theme.colors.background.muted : chromeColors.primarySoft,
    color: embedded ? theme.colors.brand.primary : chromeColors.primary,
  };

  return {
    minHeight: embedded ? 34 : 38,
    border: `1px solid ${borderColor}`,
    background,
    color,
    fontSize: embedded ? "0.78rem" : "0.86rem",
    padding: embedded ? "0 10px" : "0 12px",
    transition:
      "background-color 180ms ease, border-color 180ms ease, color 180ms ease",
    "&:hover": activeSx,
    "&.Mui-selected": activeSx,
  };
}
