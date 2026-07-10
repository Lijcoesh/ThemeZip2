export type RgbColor = {
  r: number;
  g: number;
  b: number;
};

export type HslColor = {
  h: number;
  s: number;
  l: number;
};

export type PaletteColor = {
  hex: string;
  rgb: RgbColor;
  hsl: HslColor;
  luminance: number;
  population: number;
};

export type ExtractedPalette = {
  colors: PaletteColor[];
  dominant: PaletteColor | null;
  /** Total color samples considered before filtering (e.g. pixels scanned, or color declarations found). */
  totalSampleCount: number;
  /** Samples that passed filtering and contributed to the palette buckets. */
  matchedSampleCount: number;
};
