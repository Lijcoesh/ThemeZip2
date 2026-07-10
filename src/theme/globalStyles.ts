import type { CSSInterpolation } from "@mui/material/styles";
import { chromeColors, fontFamily } from "./muiTheme";

/**
 * Truly page-level rules with no MUI-idiomatic equivalent (selection color,
 * reduced-motion override) plus the handful of html/body baseline rules
 * CssBaseline doesn't cover. Everything else formerly in index.css is now
 * expressed through the MUI theme (see muiTheme.ts) or CssBaseline.
 */
export const globalStyles: CSSInterpolation = {
  html: {
    colorScheme: "light",
    minWidth: 320,
    backgroundColor: chromeColors.page,
    fontFamily,
    fontSynthesis: "none",
    textRendering: "optimizeLegibility",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  },
  body: {
    minWidth: 320,
    minHeight: "100dvh",
  },
  img: {
    maxWidth: "100%",
  },
  "::selection": {
    backgroundColor: chromeColors.primarySoft,
    color: chromeColors.ink,
  },
  "@media (prefers-reduced-motion: reduce)": {
    "*, *::before, *::after": {
      scrollBehavior: "auto !important",
      transitionDuration: "0.01ms !important",
      animationDuration: "0.01ms !important",
      animationIterationCount: "1 !important",
    },
  },
};
