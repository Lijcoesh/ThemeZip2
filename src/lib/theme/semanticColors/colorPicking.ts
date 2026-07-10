import { colorDistance, contrastRatio } from "../../color/colorUtils";
import type { ExtractedPalette, PaletteColor, RgbColor } from "../../../types/color";

export const WHITE: RgbColor = { r: 255, g: 255, b: 255 };
export const NEAR_WHITE: RgbColor = { r: 248, g: 250, b: 252 };
export const NEAR_BLACK: RgbColor = { r: 15, g: 23, b: 42 };

export function pickByScore(
  colors: PaletteColor[],
  getScore: (color: PaletteColor) => number,
) {
  return colors
    .map((color) => ({
      color,
      score: getScore(color),
    }))
    .filter((entry) => entry.score >= 0)
    .sort((first, second) => second.score - first.score)[0]?.color;
}

export function pickReadableRgb(
  colors: PaletteColor[],
  background: RgbColor,
  minimumContrast: number,
  direction: "dark" | "light",
  exclude: RgbColor[] = [],
) {
  return colors
    .filter((color) => {
      const isCorrectDirection =
        direction === "dark" ? color.luminance <= 0.32 : color.luminance >= 0.72;
      const isDistinct = exclude.every(
        (excludedColor) => colorDistance(excludedColor, color.rgb) >= 30,
      );

      return (
        isCorrectDirection &&
        isDistinct &&
        contrastRatio(color.rgb, background) >= minimumContrast
      );
    })
    .sort((first, second) => {
      const contrastDelta =
        contrastRatio(second.rgb, background) - contrastRatio(first.rgb, background);
      return contrastDelta || second.population - first.population;
    })[0]?.rgb;
}

export function chooseReadableTextColor(background: RgbColor) {
  return contrastRatio(background, WHITE) >= contrastRatio(background, NEAR_BLACK)
    ? WHITE
    : NEAR_BLACK;
}

export function brandScore(color: PaletteColor) {
  const lightnessPenalty = Math.abs(color.hsl.l - 0.52);
  return color.hsl.s * 2.5 + color.population * 2 - lightnessPenalty;
}

export function isLikelyDarkTheme(palette: ExtractedPalette) {
  const totalPopulation = palette.colors.reduce(
    (sum, color) => sum + color.population,
    0,
  );
  const averageLuminance =
    totalPopulation === 0
      ? 0.5
      : palette.colors.reduce(
          (sum, color) => sum + color.luminance * color.population,
          0,
        ) / totalPopulation;
  const dominantLuminance = palette.dominant?.luminance ?? averageLuminance;
  const hasLargeLightArea = palette.colors.some(
    (color) => color.luminance >= 0.82 && color.population >= 0.25,
  );

  return dominantLuminance < 0.28 || (averageLuminance < 0.38 && !hasLargeLightArea);
}

export function fallbackPrimaryRgb() {
  return {
    r: 13,
    g: 122,
    b: 103,
  };
}
