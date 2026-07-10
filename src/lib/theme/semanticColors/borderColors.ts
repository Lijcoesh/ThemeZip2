import { createPaletteColor, mixColors, shiftLightness } from "../../color/colorUtils";
import type { PaletteColor, RgbColor } from "../../../types/color";
import { pickByScore } from "./colorPicking";

export function chooseLightBorders(
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

export function chooseDarkBorders(colors: PaletteColor[], surfaceRgb: RgbColor) {
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
