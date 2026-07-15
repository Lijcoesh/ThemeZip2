import Box from "@mui/material/Box";
import { Analytics } from "@vercel/analytics/react";
import ImageUploader from "./components/ImageUploader";
import ThemePreview from "./components/ThemePreview";
import { useThemeGeneration } from "./hooks/useThemeGeneration";
import { chromeColors } from "./theme/muiTheme";

function App() {
  const {
    uploadedImage,
    setUploadedImage,
    generationResult,
    generationStatus,
    generationError,
    handleColorTokenChange,
  } = useThemeGeneration();

  return (
    <Box
      component="main"
      sx={{
        width: "min(1180px, calc(100% - 32px))",
        margin: "0 auto",
        padding: "48px 0",
        "@media (max-width: 920px)": {
          width: "min(100% - 24px, 680px)",
          padding: "28px 0",
        },
      }}
    >
      <Box
        component="section"
        aria-labelledby="page-title"
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 460px)",
          gap: "32px",
          alignItems: "stretch",
          marginBottom: "32px",
          "@media (max-width: 920px)": {
            gridTemplateColumns: "1fr",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: 520,
            "@media (max-width: 920px)": {
              minHeight: "auto",
            },
          }}
        >
          <Box
            component="h1"
            id="page-title"
            sx={{
              maxWidth: "760px",
              margin: 0,
              color: chromeColors.ink,
              fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
              lineHeight: 0.98,
              "@media (max-width: 520px)": {
                fontSize: "2.6rem",
              },
            }}
          >
            Generate a React theme starter from a visual reference.
          </Box>
          <Box
            component="p"
            sx={{
              maxWidth: "660px",
              margin: "24px 0 0",
              color: chromeColors.muted,
              fontSize: "1.125rem",
              lineHeight: 1.7,
            }}
          >
            Upload a screenshot, logo or UI mockup and preview a practical
            starter theme with semantic color tokens. Image processing stays
            local in your browser.
          </Box>
        </Box>

        <ImageUploader value={uploadedImage} onImageChange={setUploadedImage} />
      </Box>

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

      <Box
        component="section"
        aria-labelledby="how-it-works-title"
        sx={{ marginTop: "56px" }}
      >
        <Box
          component="h2"
          id="how-it-works-title"
          sx={{
            color: chromeColors.ink,
            fontSize: "1.75rem",
            margin: "0 0 24px",
          }}
        >
          How ThemeZip works
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
            "@media (max-width: 920px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          <Box>
            <Box component="h3" sx={{ color: chromeColors.ink, fontSize: "1.125rem", margin: "0 0 8px" }}>
              1. Upload a visual reference
            </Box>
            <Box component="p" sx={{ color: chromeColors.muted, margin: 0, lineHeight: 1.6 }}>
              Drop in a screenshot, logo, or UI mockup. Everything is processed locally in your browser, so no image
              ever leaves your device.
            </Box>
          </Box>
          <Box>
            <Box component="h3" sx={{ color: chromeColors.ink, fontSize: "1.125rem", margin: "0 0 8px" }}>
              2. Extract semantic color tokens
            </Box>
            <Box component="p" sx={{ color: chromeColors.muted, margin: 0, lineHeight: 1.6 }}>
              ThemeZip analyzes the image's palette and maps the colors into semantic tokens like background,
              surface, primary, and accent, ready to preview and edit.
            </Box>
          </Box>
          <Box>
            <Box component="h3" sx={{ color: chromeColors.ink, fontSize: "1.125rem", margin: "0 0 8px" }}>
              3. Export a React theme starter
            </Box>
            <Box component="p" sx={{ color: chromeColors.muted, margin: 0, lineHeight: 1.6 }}>
              Preview components live, fine-tune tokens, then export CSS variables or a React/TypeScript theme
              starter folder for your project.
            </Box>
          </Box>
        </Box>
      </Box>

      <Analytics />
    </Box>
  );
}

export default App;
