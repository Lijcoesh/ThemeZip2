export type ThemeColors = {
  brand: {
    primary: string;
    secondary: string;
    accent: string;
  };
  background: {
    page: string;
    surface: string;
    muted: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  border: {
    default: string;
    strong: string;
  };
};

export type ThemeSpacing = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
};

export type ThemeRadius = {
  none: string;
  sm: string;
  md: string;
  lg: string;
  full: string;
};

export type ThemeShadows = {
  sm: string;
  md: string;
  lg: string;
};

export type ThemeTypography = {
  fontFamily: {
    sans: string;
    heading: string;
    mono: string;
  };
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
};

export type ThemeTokens = {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  shadows: ThemeShadows;
  typography: ThemeTypography;
};
