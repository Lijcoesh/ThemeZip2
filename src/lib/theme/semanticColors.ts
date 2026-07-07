import {
  colorDistance,
  contrastRatio,
  createPaletteColor,
  mixColors,
  rgbToHex,
  rotateHue,
  shiftLightness,
} from "../color/colorUtils";
import type { ExtractedPalette, PaletteColor, RgbColor } from "../../types/color";
import type { ThemeColors } from "../../types/theme";
import { placeholderTheme } from "./placeholderTheme";

const WHITE: RgbColor = { r: 255, g: 255, b: 255 };
const NEAR_WHITE: RgbColor = { r: 248, g: 250, b: 252 };
const NEAR_BLACK: RgbColor = { r: 15, g: 23, b: 42 };

export function generateSemanticColors(palette: ExtractedPalette): ThemeColors {
  const colors = palette.colors;

  if (colors.length === 0) {
    return placeholderTheme.colors;
  }

  const primary = choosePrimaryColor(colors);
  const secondary = chooseDistinctBrandColor(colors, [primary], 70, 0.08);
  const accent = chooseDistinctBrandColor(colors, [primary, secondary], 130, -0.06);
  const darkTheme = isLikelyDarkTheme(palette);
  const backgrounds = darkTheme
    ? chooseDarkBackgrounds(colors)
    : chooseLightBackgrounds(colors);
  const text = darkTheme
    ? chooseTextForDarkTheme(colors, backgrounds.page.rgb)
    : chooseTextForLightTheme(colors, backgrounds.page.rgb);
  const border = darkTheme
    ? chooseDarkBorders(colors, backgrounds.surface.rgb)
    : chooseLightBorders(colors, backgrounds.surface.rgb, text.primaryRgb);

  return {
    brand: {
      primary: primary.hex,
      secondary: secondary.hex,
      accent: accent.hex,
    },
    background: {
      page: backgrounds.page.hex,
      surface: backgrounds.surface.hex,
      muted: backgrounds.muted.hex,
    },
    text: {
      primary: rgbToHex(text.primaryRgb),
      secondary: rgbToHex(text.secondaryRgb),
      muted: rgbToHex(text.mutedRgb),
      inverse: rgbToHex(chooseReadableTextColor(primary.rgb)),
    },
    border: {
      default: border.default.hex,
      strong: border.strong.hex,
    },
  };
}

function choosePrimaryColor(colors: PaletteColor[]) {
  const colorful = colors
    .filter(
      (color) => color.hsl.s >= 0.18 && color.hsl.l >= 0.16 && color.hsl.l <= 0.82,
    )
    .sort((first, second) => brandScore(second) - brandScore(first));
  const usableNeutral = colors
    .filter((color) => color.hsl.l >= 0.22 && color.hsl.l <= 0.72)
    .sort((first, second) => brandScore(second) - brandScore(first));

  return colorful[0] ?? usableNeutral[0] ?? createPaletteColor(fallbackPrimaryRgb(), 0);
}

function chooseDistinctBrandColor(
  colors: PaletteColor[],
  existing: PaletteColor[],
  hueFallbackDegrees: number,
  lightnessShift: number,
) {
  const distinct = colors
    .filter(
      (color) =>
        color.hsl.s >= 0.16 &&
        existing.every((usedColor) => colorDistance(usedColor.rgb, color.rgb) >= 45),
    )
    .sort((first, second) => brandScore(second) - brandScore(first));

  if (distinct[0]) {
    return distinct[0];
  }

  const base = existing[0] ?? createPaletteColor(fallbackPrimaryRgb(), 1);
  const rotated = rotateHue(base.rgb, hueFallbackDegrees);
  const shifted = shiftLightness(rotated, lightnessShift);

  return createPaletteColor(shifted, 0);
}

function chooseLightBackgrounds(colors: PaletteColor[]) {
  const page =
    pickByScore(colors, (color) =>
      color.luminance >= 0.78
        ? color.population * 3 + (1 - color.hsl.s) + color.luminance
        : -1,
    ) ?? createPaletteColor(NEAR_WHITE, 0);
  const surface =
    pickByScore(colors, (color) =>
      color.luminance >= 0.86
        ? color.population * 2 + color.luminance + (1 - color.hsl.s)
        : -1,
    ) ?? createPaletteColor(WHITE, 0);
  const primary = choosePrimaryColor(colors);
  const muted =
    pickByScore(colors, (color) =>
      color.luminance >= 0.68 && color.luminance < surface.luminance
        ? color.population * 2 + (1 - color.hsl.s)
        : -1,
    ) ?? createPaletteColor(mixColors(page.rgb, primary.rgb, 0.08), 0);

  return { page, surface, muted };
}

function chooseDarkBackgrounds(colors: PaletteColor[]) {
  const page =
    pickByScore(colors, (color) =>
      color.luminance <= 0.18
        ? color.population * 3 + (1 - color.hsl.s) + (1 - color.luminance)
        : -1,
    ) ?? createPaletteColor(NEAR_BLACK, 0);
  const surface =
    pickByScore(colors, (color) =>
      color.luminance > page.luminance && color.luminance <= 0.34
        ? color.population * 2 + (1 - color.hsl.s)
        : -1,
    ) ?? createPaletteColor(shiftLightness(page.rgb, 0.08), 0);
  const muted =
    pickByScore(colors, (color) =>
      color.luminance > page.luminance && color.luminance <= 0.45
        ? color.population + (1 - color.hsl.s)
        : -1,
    ) ?? createPaletteColor(shiftLightness(page.rgb, 0.14), 0);

  return { page, surface, muted };
}

function chooseTextForLightTheme(colors: PaletteColor[], pageRgb: RgbColor) {
  const primaryRgb = pickReadableRgb(colors, pageRgb, 7, "dark") ?? NEAR_BLACK;
  const secondaryRgb =
    pickReadableRgb(colors, pageRgb, 4.5, "dark", [primaryRgb]) ??
    mixColors(primaryRgb, pageRgb, 0.28);
  const mutedRgb =
    pickReadableRgb(colors, pageRgb, 3, "dark", [primaryRgb, secondaryRgb]) ??
    mixColors(primaryRgb, pageRgb, 0.45);

  return {
    primaryRgb,
    secondaryRgb,
    mutedRgb,
  };
}

function chooseTextForDarkTheme(colors: PaletteColor[], pageRgb: RgbColor) {
  const primaryRgb = pickReadableRgb(colors, pageRgb, 7, "light") ?? NEAR_WHITE;
  const secondaryRgb =
    pickReadableRgb(colors, pageRgb, 4.5, "light", [primaryRgb]) ??
    mixColors(primaryRgb, pageRgb, 0.24);
  const mutedRgb =
    pickReadableRgb(colors, pageRgb, 3, "light", [primaryRgb, secondaryRgb]) ??
    mixColors(primaryRgb, pageRgb, 0.42);

  return {
    primaryRgb,
    secondaryRgb,
    mutedRgb,
  };
}

function chooseLightBorders(
  colors: PaletteColor[],
  surfaceRgb: RgbColor,
  textRgb: RgbColor,
) {
  const defaultBorder =
    pickByScore(colors, (color) =>
      color.luminance >= 0.62 && color.luminance <= 0.9 && color.hsl.s <= 0.32
        ? color.population * 2 + (1 - color.hsl.s)
        : -1,
    ) ?? createPaletteColor(mixColors(surfaceRgb, textRgb, 0.13), 0);
  const strongBorder =
    pickByScore(colors, (color) =>
      color.luminance >= 0.42 && color.luminance < defaultBorder.luminance
        ? color.population + (1 - color.hsl.s)
        : -1,
    ) ?? createPaletteColor(mixColors(surfaceRgb, textRgb, 0.24), 0);

  return {
    default: defaultBorder,
    strong: strongBorder,
  };
}

function chooseDarkBorders(colors: PaletteColor[], surfaceRgb: RgbColor) {
  const defaultBorder =
    pickByScore(colors, (color) =>
      color.luminance >= 0.2 && color.luminance <= 0.48 && color.hsl.s <= 0.38
        ? color.population + (1 - color.hsl.s)
        : -1,
    ) ?? createPaletteColor(shiftLightness(surfaceRgb, 0.12), 0);
  const strongBorder =
    pickByScore(colors, (color) =>
      color.luminance > defaultBorder.luminance && color.luminance <= 0.58
        ? color.population + (1 - color.hsl.s)
        : -1,
    ) ?? createPaletteColor(shiftLightness(surfaceRgb, 0.22), 0);

  return {
    default: defaultBorder,
    strong: strongBorder,
  };
}

function pickReadableRgb(
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

function chooseReadableTextColor(background: RgbColor) {
  return contrastRatio(background, WHITE) >= contrastRatio(background, NEAR_BLACK)
    ? WHITE
    : NEAR_BLACK;
}

function pickByScore(
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

function brandScore(color: PaletteColor) {
  const lightnessPenalty = Math.abs(color.hsl.l - 0.52);
  return color.hsl.s * 2.5 + color.population * 2 - lightnessPenalty;
}

function isLikelyDarkTheme(palette: ExtractedPalette) {
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

function fallbackPrimaryRgb() {
  return {
    r: 13,
    g: 122,
    b: 103,
  };
}
