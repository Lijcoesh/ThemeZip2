import type { HslColor, PaletteColor, RgbColor } from "../../types/color";

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function clampByte(value: number) {
  return Math.round(clamp(value, 0, 255));
}

export function rgbToHex(rgb: RgbColor) {
  return `#${[rgb.r, rgb.g, rgb.b]
    .map((channel) => clampByte(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function hexToRgb(hex: string): RgbColor | null {
  const normalized = hex.replace("#", "").trim();

  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    return null;
  }

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

export function rgbToHsl(rgb: RgbColor): HslColor {
  const r = clampByte(rgb.r) / 255;
  const g = clampByte(rgb.g) / 255;
  const b = clampByte(rgb.b) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2;

  if (delta === 0) {
    return { h: 0, s: 0, l: lightness };
  }

  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue = 0;

  if (max === r) {
    hue = (g - b) / delta + (g < b ? 6 : 0);
  } else if (max === g) {
    hue = (b - r) / delta + 2;
  } else {
    hue = (r - g) / delta + 4;
  }

  return {
    h: Math.round(hue * 60),
    s: saturation,
    l: lightness,
  };
}

export function hslToRgb(hsl: HslColor): RgbColor {
  const hue = (((hsl.h % 360) + 360) % 360) / 360;
  const saturation = clamp(hsl.s, 0, 1);
  const lightness = clamp(hsl.l, 0, 1);

  if (saturation === 0) {
    const value = clampByte(lightness * 255);
    return { r: value, g: value, b: value };
  }

  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;

  return {
    r: clampByte(hueToRgb(p, q, hue + 1 / 3) * 255),
    g: clampByte(hueToRgb(p, q, hue) * 255),
    b: clampByte(hueToRgb(p, q, hue - 1 / 3) * 255),
  };
}

export function relativeLuminance(rgb: RgbColor) {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((channel) => {
    const normalized = clampByte(channel) / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(first: RgbColor, second: RgbColor) {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

export function colorDistance(first: RgbColor, second: RgbColor) {
  return Math.sqrt(
    (first.r - second.r) ** 2 +
      (first.g - second.g) ** 2 +
      (first.b - second.b) ** 2,
  );
}

export function mixColors(first: RgbColor, second: RgbColor, amount: number) {
  const safeAmount = clamp(amount, 0, 1);

  return {
    r: clampByte(first.r + (second.r - first.r) * safeAmount),
    g: clampByte(first.g + (second.g - first.g) * safeAmount),
    b: clampByte(first.b + (second.b - first.b) * safeAmount),
  };
}

export function shiftLightness(rgb: RgbColor, amount: number) {
  const hsl = rgbToHsl(rgb);
  return hslToRgb({
    ...hsl,
    l: clamp(hsl.l + amount, 0, 1),
  });
}

export function rotateHue(rgb: RgbColor, degrees: number) {
  const hsl = rgbToHsl(rgb);
  return hslToRgb({
    ...hsl,
    h: hsl.h + degrees,
  });
}

export function createPaletteColor(
  rgb: RgbColor,
  population: number,
): PaletteColor {
  return {
    hex: rgbToHex(rgb),
    rgb,
    hsl: rgbToHsl(rgb),
    luminance: relativeLuminance(rgb),
    population,
  };
}

/**
 * Picks a small, visually distinct set of palette colors from a larger list
 * of population-ranked candidates. Shared by every extraction pipeline
 * (image pixel sampling, HTML color-declaration sampling) so they surface
 * consistent, non-duplicate palettes.
 */
export function choosePaletteColors(
  candidates: PaletteColor[],
  colorCount: number,
): PaletteColor[] {
  const chosen: PaletteColor[] = [];
  const addDistinctColor = (color: PaletteColor | undefined) => {
    if (!color || chosen.length >= colorCount) {
      return;
    }

    const isDuplicate = chosen.some(
      (chosenColor) => colorDistance(chosenColor.rgb, color.rgb) < 30,
    );

    if (!isDuplicate) {
      chosen.push(color);
    }
  };

  addDistinctColor(candidates[0]);

  candidates
    .filter((color) => color.hsl.s >= 0.2 && color.population >= 0.001)
    .sort((first, second) => colorfulnessScore(second) - colorfulnessScore(first))
    .slice(0, 4)
    .forEach(addDistinctColor);

  addDistinctColor(
    candidates
      .filter((color) => color.luminance >= 0.78)
      .sort((first, second) => second.population - first.population)[0],
  );
  addDistinctColor(
    candidates
      .filter((color) => color.luminance <= 0.28)
      .sort((first, second) => second.population - first.population)[0],
  );

  candidates.forEach(addDistinctColor);

  return chosen
    .slice(0, colorCount)
    .sort((first, second) => second.population - first.population);
}

function colorfulnessScore(color: PaletteColor) {
  return color.hsl.s * 2 + color.population * 3 + middleLightnessScore(color);
}

function middleLightnessScore(color: PaletteColor) {
  return 1 - Math.abs(color.hsl.l - 0.52);
}

function hueToRgb(p: number, q: number, rawT: number) {
  let t = rawT;

  if (t < 0) {
    t += 1;
  }

  if (t > 1) {
    t -= 1;
  }

  if (t < 1 / 6) {
    return p + (q - p) * 6 * t;
  }

  if (t < 1 / 2) {
    return q;
  }

  if (t < 2 / 3) {
    return p + (q - p) * (2 / 3 - t) * 6;
  }

  return p;
}
