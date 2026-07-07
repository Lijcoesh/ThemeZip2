import type { ThemeTokens } from "../../types/theme";
import type { ExtractedPalette } from "../../types/color";
import { extractColorPalette } from "../image/colorExtraction";
import { placeholderTheme } from "./placeholderTheme";
import { generateSemanticColors } from "./semanticColors";

export type ThemeGenerationInput = {
  imageName?: string;
};

export type ThemeGenerationResult = {
  theme: ThemeTokens;
  palette: ExtractedPalette | null;
  source: "placeholder" | "image";
};

export function generatePlaceholderTheme(
  _input?: ThemeGenerationInput,
): ThemeTokens {
  return placeholderTheme;
}

export function createPlaceholderThemeResult(
  input?: ThemeGenerationInput,
): ThemeGenerationResult {
  return {
    theme: generatePlaceholderTheme(input),
    palette: null,
    source: "placeholder",
  };
}

export async function generateThemeFromImage(
  file: File,
): Promise<ThemeGenerationResult> {
  const palette = await extractColorPalette(file);
  return generateThemeFromPalette(palette);
}

export function generateThemeFromPalette(
  palette: ExtractedPalette,
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
    source: "image",
  };
}
