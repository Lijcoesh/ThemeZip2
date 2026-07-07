import type { ThemeTokens } from "../../types/theme";

export const placeholderTheme: ThemeTokens = {
  colors: {
    brand: {
      primary: "#0d7a67",
      secondary: "#235fd8",
      accent: "#d65f2f",
    },
    background: {
      page: "#f5f8f6",
      surface: "#ffffff",
      muted: "#e5f4ef",
    },
    text: {
      primary: "#14211d",
      secondary: "#465953",
      muted: "#66746f",
      inverse: "#ffffff",
    },
    border: {
      default: "#d8e2de",
      strong: "#9fb4ad",
    },
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
  },
  radius: {
    none: "0px",
    sm: "6px",
    md: "8px",
    lg: "12px",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px rgba(20, 33, 29, 0.08)",
    md: "0 14px 34px rgba(20, 33, 29, 0.12)",
    lg: "0 24px 60px rgba(20, 33, 29, 0.16)",
  },
  typography: {
    fontFamily: {
      sans: "Inter, system-ui, sans-serif",
      heading: "Inter, system-ui, sans-serif",
      mono: "Menlo, Monaco, Consolas, monospace",
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
};
