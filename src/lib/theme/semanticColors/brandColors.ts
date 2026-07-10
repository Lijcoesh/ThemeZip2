import {
  colorDistance,
  createPaletteColor,
  rotateHue,
  shiftLightness,
} from "../../color/colorUtils";
import type { PaletteColor } from "../../../types/color";
import { brandScore, fallbackPrimaryRgb } from "./colorPicking";

export function choosePrimaryColor(colors: PaletteColor[]) {
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

export function chooseDistinctBrandColor(
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
