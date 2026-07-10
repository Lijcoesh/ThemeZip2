import type { ThemeTokens } from "../../../types/theme";
import { formatTemplateLiteral } from "./fileUtils";
import { generateCssVariablesOutput } from "./index";

export function createConstExport(name: string, value: unknown) {
  return `export const ${name} = ${JSON.stringify(value, null, 2)} as const;`;
}

export function generateTokenIndexOutput() {
  return `import { colors } from "./colors";
import { radius } from "./radius";
import { shadows } from "./shadows";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const tokens = {
  colors,
  spacing,
  radius,
  shadows,
  typography,
} as const;

export type ThemeTokens = typeof tokens;
`;
}

export function generateThemeIndexOutput() {
  return `import { tokens } from "./tokens";

export const theme = tokens;

export type Theme = typeof theme;
`;
}

export function generateCssVariablesModuleOutput(tokens: ThemeTokens) {
  return `export const cssVariables = ${formatTemplateLiteral(
    generateCssVariablesOutput(tokens),
  )};
`;
}

export function generateThemeProviderOutput() {
  return `import { createContext, useContext, type ReactNode } from "react";
import { theme, type Theme } from "./theme";

type ThemeProviderProps = {
  children: ReactNode;
  value?: Theme;
};

const ThemeContext = createContext<Theme>(theme);

export function ThemeProvider({ children, value = theme }: ThemeProviderProps) {
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
`;
}
