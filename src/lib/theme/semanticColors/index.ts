import { rgbToHex } from "../../color/colorUtils";
import type { ExtractedPalette } from "../../../types/color";
import type { ThemeColors } from "../../../types/theme";
import { placeholderTheme } from "../placeholderTheme";
import { chooseDarkBackgrounds, chooseLightBackgrounds } from "./backgroundColors";
import { chooseDarkBorders, chooseLightBorders } from "./borderColors";
import { chooseDistinctBrandColor, choosePrimaryColor } from "./brandColors";
import { chooseReadableTextColor, isLikelyDarkTheme } from "./colorPicking";
import { chooseTextForDarkTheme, chooseTextForLightTheme } from "./textColors";

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
