import type { ThemeTokens } from "../../types/theme";
import type { ExtractedPalette } from "../../types/color";
import { extractColorPalette } from "../image/colorExtraction";
import { extractColorPaletteFromHtml } from "../html/htmlColorExtraction";
import { placeholderTheme } from "./placeholderTheme";
import { generateSemanticColors } from "./semanticColors";

export type ThemeSource = "placeholder" | "image" | "html";

export type ThemeGenerationResult = {
  theme: ThemeTokens;
  palette: ExtractedPalette | null;
  source: ThemeSource;
};

export function generatePlaceholderTheme(): ThemeTokens {
  return placeholderTheme;
}

export function createPlaceholderThemeResult(): ThemeGenerationResult {
  return {
    theme: generatePlaceholderTheme(),
    palette: null,
    source: "placeholder",
  };
}

export async function generateThemeFromImage(
  file: File,
): Promise<ThemeGenerationResult> {
  const palette = await extractColorPalette(file);
  return generateThemeFromPalette(palette, "image");
}

export async function generateThemeFromHtml(
  htmlText: string,
): Promise<ThemeGenerationResult> {
  const palette = extractColorPaletteFromHtml(htmlText);
  return generateThemeFromPalette(palette, "html");
}

export function generateThemeFromPalette(
  palette: ExtractedPalette,
  source: Exclude<ThemeSource, "placeholder"> = "image",
): ThemeGenerationResult {
  return {
    theme: {
      colors: generateSemanticColors(palette),
      spacing: { ...placeholderTheme.spacing },
      radius: { ...placeholderTheme.radius },
      shadows: { ...placeholderTheme.shadows },
      typography: {
        fontFamily: { ...placeholderTheme.typography.fontFamily },
        fontSize: { ...placeholderTheme.typography.fontSize },
        fontWeight: { ...placeholderTheme.typography.fontWeight },
      },
    },
    palette,
    source,
  };
}
