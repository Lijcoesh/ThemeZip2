import { clamp, clampByte, hexToRgb, hslToRgb } from "./colorUtils";
import { CSS_NAMED_COLORS } from "./namedColors";
import type { RgbColor } from "../../types/color";

export type CssColorToken = {
  rgb: RgbColor;
  alpha: number;
};

const HEX_COLOR_PATTERN =
  /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})\b/gi;
const RGB_FUNCTION_PATTERN = /rgba?\(\s*[^)]*\)/gi;
const HSL_FUNCTION_PATTERN = /hsla?\(\s*[^)]*\)/gi;
const CSS_COMMENT_PATTERN = /\/\*[\s\S]*?\*\//g;

const NAMED_COLOR_PATTERN = new RegExp(
  `(?<![\\w.#-])(${Object.keys(CSS_NAMED_COLORS).join("|")})(?![\\w-])`,
  "gi",
);

/**
 * Finds every color token (hex, rgb()/rgba(), hsl()/hsla(), and CSS named
 * colors) referenced in a blob of CSS-like text. Named-color matching is
 * restricted to value-like positions so selector/class text such as
 * `.text-red-500` is not mistaken for the color "red".
 */
export function findCssColorTokens(cssText: string): CssColorToken[] {
  const cleanedText = cssText.replace(CSS_COMMENT_PATTERN, " ");
  const tokens: CssColorToken[] = [];

  for (const match of cleanedText.matchAll(HEX_COLOR_PATTERN)) {
    const parsed = parseHexToken(match[0]);
    if (parsed) {
      tokens.push(parsed);
    }
  }

  for (const match of cleanedText.matchAll(RGB_FUNCTION_PATTERN)) {
    const parsed = parseRgbFunction(match[0]);
    if (parsed) {
      tokens.push(parsed);
    }
  }

  for (const match of cleanedText.matchAll(HSL_FUNCTION_PATTERN)) {
    const parsed = parseHslFunction(match[0]);
    if (parsed) {
      tokens.push(parsed);
    }
  }

  for (const match of cleanedText.matchAll(NAMED_COLOR_PATTERN)) {
    const hex = CSS_NAMED_COLORS[match[0].toLowerCase()];
    const rgb = hex ? hexToRgb(hex) : null;
    if (rgb) {
      tokens.push({ rgb, alpha: 1 });
    }
  }

  return tokens;
}

function parseHexToken(token: string): CssColorToken | null {
  const hex = token.slice(1);

  if (hex.length === 3 || hex.length === 4) {
    const rgb = {
      r: Number.parseInt(hex[0] + hex[0], 16),
      g: Number.parseInt(hex[1] + hex[1], 16),
      b: Number.parseInt(hex[2] + hex[2], 16),
    };
    const alpha = hex.length === 4 ? Number.parseInt(hex[3] + hex[3], 16) / 255 : 1;
    return { rgb, alpha };
  }

  if (hex.length === 6 || hex.length === 8) {
    const rgb = {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16),
    };
    const alpha = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return { rgb, alpha };
  }

  return null;
}

function parseRgbFunction(text: string): CssColorToken | null {
  const inner = text.slice(text.indexOf("(") + 1, text.lastIndexOf(")"));
  const [channelsPart, slashAlphaPart] = inner.split("/");
  const parts = channelsPart.trim().split(/[\s,]+/).filter(Boolean);

  if (parts.length < 3) {
    return null;
  }

  const [redRaw, greenRaw, blueRaw, commaAlphaPart] = parts;
  const red = parseChannel(redRaw);
  const green = parseChannel(greenRaw);
  const blue = parseChannel(blueRaw);

  if (red === null || green === null || blue === null) {
    return null;
  }

  return {
    rgb: { r: red, g: green, b: blue },
    alpha: parseAlpha(slashAlphaPart ?? commaAlphaPart),
  };
}

function parseHslFunction(text: string): CssColorToken | null {
  const inner = text.slice(text.indexOf("(") + 1, text.lastIndexOf(")"));
  const [channelsPart, slashAlphaPart] = inner.split("/");
  const parts = channelsPart.trim().split(/[\s,]+/).filter(Boolean);

  if (parts.length < 3) {
    return null;
  }

  const [hueRaw, saturationRaw, lightnessRaw, commaAlphaPart] = parts;
  const hue = parseHue(hueRaw);
  const saturation = parsePercent(saturationRaw);
  const lightness = parsePercent(lightnessRaw);

  if (hue === null || saturation === null || lightness === null) {
    return null;
  }

  return {
    rgb: hslToRgb({ h: hue, s: saturation, l: lightness }),
    alpha: parseAlpha(slashAlphaPart ?? commaAlphaPart),
  };
}

function parseChannel(raw: string): number | null {
  const trimmed = raw.trim();

  if (trimmed.endsWith("%")) {
    const percent = Number.parseFloat(trimmed);
    return Number.isFinite(percent) ? clampByte((percent / 100) * 255) : null;
  }

  const value = Number.parseFloat(trimmed);
  return Number.isFinite(value) ? clampByte(value) : null;
}

function parsePercent(raw: string): number | null {
  const trimmed = raw.trim();

  if (!trimmed.endsWith("%")) {
    return null;
  }

  const percent = Number.parseFloat(trimmed);
  return Number.isFinite(percent) ? clamp(percent / 100, 0, 1) : null;
}

function parseHue(raw: string): number | null {
  const match = /^(-?[\d.]+)(deg|grad|rad|turn)?$/i.exec(raw.trim());

  if (!match) {
    return null;
  }

  const value = Number.parseFloat(match[1]);

  if (!Number.isFinite(value)) {
    return null;
  }

  switch (match[2]?.toLowerCase()) {
    case "grad":
      return value * 0.9;
    case "rad":
      return value * (180 / Math.PI);
    case "turn":
      return value * 360;
    default:
      return value;
  }
}

function parseAlpha(raw?: string): number {
  if (!raw) {
    return 1;
  }

  const trimmed = raw.trim();

  if (trimmed.endsWith("%")) {
    const percent = Number.parseFloat(trimmed);
    return Number.isFinite(percent) ? clamp(percent / 100, 0, 1) : 1;
  }

  const value = Number.parseFloat(trimmed);
  return Number.isFinite(value) ? clamp(value, 0, 1) : 1;
}
