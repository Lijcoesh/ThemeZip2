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
  sourcePixelCount: number;
  sampledPixelCount: number;
};
