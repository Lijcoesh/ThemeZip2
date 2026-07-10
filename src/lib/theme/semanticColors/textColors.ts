import { mixColors } from "../../color/colorUtils";
import type { PaletteColor, RgbColor } from "../../../types/color";
import { NEAR_BLACK, NEAR_WHITE, pickReadableRgb } from "./colorPicking";

export function chooseTextForLightTheme(colors: PaletteColor[], pageRgb: RgbColor) {
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

export function chooseTextForDarkTheme(colors: PaletteColor[], pageRgb: RgbColor) {
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
