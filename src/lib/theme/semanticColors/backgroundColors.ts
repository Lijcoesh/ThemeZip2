import { createPaletteColor, mixColors, shiftLightness } from "../../color/colorUtils";
import type { PaletteColor } from "../../../types/color";
import { choosePrimaryColor } from "./brandColors";
import { NEAR_BLACK, NEAR_WHITE, WHITE, pickByScore } from "./colorPicking";

export function chooseLightBackgrounds(colors: PaletteColor[]) {
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

export function chooseDarkBackgrounds(colors: PaletteColor[]) {
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
