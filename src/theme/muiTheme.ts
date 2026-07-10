import { createTheme, type Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";

/**
 * Plain sx object type (no array/function union) so sx presets can be safely
 * composed inside a `sx={[preset, condition && extra]}` array without
 * TypeScript rejecting nested-array overloads. Use this (not `SxProps<Theme>`)
 * for any sx value — local to a component or shared here — that might get
 * passed inside such an array.
 */
export type SxObject = SystemStyleObject<Theme>;

/**
 * Static chrome design tokens — the app's OWN look (formerly the CSS custom
 * properties in index.css). Distinct from the user-editable, per-render
 * `ThemeTokens` in `src/types/theme.ts`, which stays business data bound via
 * `sx`/`style` rather than pushed into this MUI theme.
 */
export const chromeColors = {
  page: "#f5f8f6",
  surface: "#ffffff",
  ink: "#14211d",
  muted: "#596861",
  border: "#d8e2de",
  borderStrong: "#9fb4ad",
  primary: "#0d7a67",
  primaryStrong: "#095f50",
  primarySoft: "#e5f4ef",
  danger: "#b42318",
  dangerSoft: "#fff1ef",
  shadowMd: "0 18px 55px rgba(20, 33, 29, 0.08)",
  focusRing: "rgba(13, 122, 103, 0.28)",
} as const;

export const fontFamily =
  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const monoFontFamily =
  '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace';

const focusVisibleRing = {
  outline: `3px solid ${chromeColors.focusRing}`,
  outlineOffset: "3px",
};

export const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: chromeColors.primary,
      dark: chromeColors.primaryStrong,
      light: chromeColors.primarySoft,
      contrastText: "#ffffff",
    },
    error: {
      main: chromeColors.danger,
      light: chromeColors.dangerSoft,
    },
    background: {
      default: chromeColors.page,
      paper: chromeColors.surface,
    },
    text: {
      primary: chromeColors.ink,
      secondary: chromeColors.muted,
    },
    divider: chromeColors.border,
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily,
    // Neutralize MUI's default body1 letter-spacing/line-height so
    // CssBaseline's `body { ...theme.typography.body1 }` spread doesn't
    // introduce spacing the original UA-default CSS never had.
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: "normal",
      letterSpacing: "normal",
    },
    body2: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: "normal",
      letterSpacing: "normal",
    },
    button: {
      textTransform: "none",
      fontWeight: 800,
      fontSize: "1rem",
    },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 44,
          fontWeight: 800,
          transition:
            "background-color 180ms ease, border-color 180ms ease, color 180ms ease, transform 180ms ease",
          "&:active": {
            transform: "translateY(1px)",
          },
          "&:focus-visible": focusVisibleRing,
        },
      },
    },
    MuiCheckbox: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          padding: 0,
          width: 18,
          height: 18,
          color: chromeColors.borderStrong,
          "&.Mui-checked": {
            color: chromeColors.primary,
          },
          "&:focus-visible": focusVisibleRing,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 800,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: chromeColors.border,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: chromeColors.border,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: chromeColors.border,
            borderWidth: "1px",
          },
          "&.Mui-focused": focusVisibleRing,
          // The original design's only "disabled" treatment is a uniform
          // `opacity: 0.72` on the enclosing <fieldset>. Cancel MUI's own
          // default disabled recoloring here so that opacity stays the sole
          // dimming mechanism (no double-dimmed/grayed-out compounding).
          "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
            borderColor: chromeColors.border,
          },
        },
        input: {
          padding: 0,
          "&.Mui-disabled": {
            WebkitTextFillColor: "unset",
            color: "unset",
            opacity: 1,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 0,
        },
      },
    },
    MuiTab: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          minHeight: 38,
          textTransform: "none",
          fontWeight: 900,
          fontSize: "0.86rem",
          padding: "0 12px",
          borderRadius: 8,
          "&:focus-visible": focusVisibleRing,
        },
      },
    },
  },
});

/**
 * Reusable sx presets for the two shared button looks (`.button-like` /
 * `.theme-button` / `.download-button` vs. `.ghost-button` /
 * `.export-preset-button` in the old CSS). Root-level sizing/radius/focus is
 * already handled by the MuiButton theme override above — these only carry
 * the color-specific parts.
 */
export const filledButtonSx: SxObject = {
  border: `1px solid ${chromeColors.primary}`,
  backgroundColor: chromeColors.primary,
  color: "#ffffff",
  padding: "0 18px",
  "&:hover": {
    backgroundColor: chromeColors.primaryStrong,
    borderColor: chromeColors.primaryStrong,
  },
  "&.Mui-disabled": {
    borderColor: chromeColors.borderStrong,
    backgroundColor: chromeColors.borderStrong,
    color: "#ffffff",
    opacity: 0.72,
  },
};

export const ghostButtonSx: SxObject = {
  border: `1px solid ${chromeColors.border}`,
  backgroundColor: chromeColors.surface,
  color: chromeColors.ink,
  padding: "0 16px",
  "&:hover": {
    borderColor: chromeColors.borderStrong,
    backgroundColor: chromeColors.page,
  },
};

/**
 * Extra sx to layer on top of `ghostButtonSx` (via `sx={[ghostButtonSx, isActive && ghostButtonActiveSx]}`)
 * for the "is-active" pressed-preset look (e.g. the Full kit toggle).
 */
export const ghostButtonActiveSx: SxObject = {
  borderColor: chromeColors.borderStrong,
  backgroundColor: chromeColors.page,
};
