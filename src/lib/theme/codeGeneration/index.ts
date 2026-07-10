import type { ThemeTokens } from "../../../types/theme";
import {
  createCssVariableSections,
  createTailwindVariableSections,
  formatCssOutput,
} from "./cssVariableSections";
import { createCodeFile, formatFileBundle } from "./fileUtils";
import {
  generateButtonExampleOutput,
  generateCardExampleOutput,
  generateFormExampleOutput,
  generatePreviewPageOutput,
} from "./templates.examples";
import {
  createConstExport,
  generateCssVariablesModuleOutput,
  generateThemeIndexOutput,
  generateThemeProviderOutput,
  generateTokenIndexOutput,
} from "./templates.typescript";

export type ThemeCodePreviewId = "typescript" | "css-variables" | "tailwind";

export type ThemeCodeLanguage = "typescript" | "tsx" | "css";

export type GeneratedThemeCodeFile = {
  id: string;
  path: string;
  filename: string;
  language: ThemeCodeLanguage;
  code: string;
};

export type GeneratedThemeCodePreview = {
  id: ThemeCodePreviewId;
  title: string;
  description: string;
  files: readonly GeneratedThemeCodeFile[];
};

export type GeneratedThemeOutput = {
  typeScript: string;
  typeScriptFiles: readonly GeneratedThemeCodeFile[];
  cssVariables: string;
  cssFiles: readonly GeneratedThemeCodeFile[];
  tailwindCssVariables: string;
  tailwindFiles: readonly GeneratedThemeCodeFile[];
  exampleFiles: readonly GeneratedThemeCodeFile[];
};

export function generateThemeOutput(
  tokens: ThemeTokens,
): GeneratedThemeOutput {
  const typeScriptFiles = generateTypeScriptThemeFiles(tokens);

  return {
    typeScript: formatFileBundle(typeScriptFiles),
    typeScriptFiles,
    cssVariables: generateCssVariablesOutput(tokens),
    cssFiles: generateCssVariableFiles(tokens),
    tailwindCssVariables: generateTailwindThemeOutput(tokens),
    tailwindFiles: generateTailwindThemeFiles(tokens),
    exampleFiles: generateReactExampleFiles(tokens),
  };
}

export function generateThemeCodePreviews(
  tokens: ThemeTokens,
): readonly GeneratedThemeCodePreview[] {
  const output = generateThemeOutput(tokens);

  return [
    {
      id: "typescript",
      title: "TypeScript theme tokens",
      description:
        "React-friendly token files generated from the current theme.",
      files: output.typeScriptFiles,
    },
    {
      id: "css-variables",
      title: "CSS variables",
      description:
        "Plain CSS custom properties for framework-agnostic styling.",
      files: output.cssFiles,
    },
    {
      id: "tailwind",
      title: "Tailwind-compatible variables",
      description:
        "Tailwind CSS v4 theme variables that map tokens to utilities.",
      files: output.tailwindFiles,
    },
  ];
}

export function generateTypeScriptThemeFiles(
  tokens: ThemeTokens,
): readonly GeneratedThemeCodeFile[] {
  return [
    createCodeFile({
      path: "theme/colors.ts",
      language: "typescript",
      code: createConstExport("colors", tokens.colors),
    }),
    createCodeFile({
      path: "theme/spacing.ts",
      language: "typescript",
      code: createConstExport("spacing", tokens.spacing),
    }),
    createCodeFile({
      path: "theme/radius.ts",
      language: "typescript",
      code: createConstExport("radius", tokens.radius),
    }),
    createCodeFile({
      path: "theme/shadows.ts",
      language: "typescript",
      code: createConstExport("shadows", tokens.shadows),
    }),
    createCodeFile({
      path: "theme/typography.ts",
      language: "typescript",
      code: createConstExport("typography", tokens.typography),
    }),
    createCodeFile({
      path: "theme/tokens.ts",
      language: "typescript",
      code: generateTokenIndexOutput(),
    }),
    createCodeFile({
      path: "theme/theme.ts",
      language: "typescript",
      code: generateThemeIndexOutput(),
    }),
    createCodeFile({
      path: "theme/cssVariables.ts",
      language: "typescript",
      code: generateCssVariablesModuleOutput(tokens),
    }),
    createCodeFile({
      path: "theme/ThemeProvider.tsx",
      language: "tsx",
      code: generateThemeProviderOutput(),
    }),
  ];
}

export function generateTypeScriptThemeOutput(tokens: ThemeTokens) {
  return formatFileBundle(generateTypeScriptThemeFiles(tokens));
}

export function generateCssVariableFiles(
  tokens: ThemeTokens,
): readonly GeneratedThemeCodeFile[] {
  return [
    createCodeFile({
      path: "styles/theme.css",
      language: "css",
      code: generateCssVariablesOutput(tokens),
    }),
    createCodeFile({
      path: "styles/globals.css",
      language: "css",
      code: generateGlobalsCssOutput(),
    }),
  ];
}

export function generateCssVariablesOutput(tokens: ThemeTokens) {
  return formatCssOutput(":root", createCssVariableSections(tokens));
}

export function generateGlobalsCssOutput() {
  return `@import "./theme.css";

* {
  box-sizing: border-box;
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  background: var(--color-background-page);
  color: var(--color-text-primary);
  font-family: var(--font-family-sans);
}

button,
input,
textarea,
select {
  font: inherit;
}

a {
  color: var(--color-brand-primary);
}
`;
}

export function generateTailwindThemeFiles(
  tokens: ThemeTokens,
): readonly GeneratedThemeCodeFile[] {
  return [
    createCodeFile({
      path: "tailwind/theme.css",
      language: "css",
      code: generateTailwindThemeOutput(tokens),
    }),
  ];
}

export function generateTailwindThemeOutput(tokens: ThemeTokens) {
  return `@import "tailwindcss";

${formatCssOutput("@theme", createTailwindVariableSections(tokens))}
`;
}

export function generateReactExampleFiles(
  tokens: ThemeTokens,
): readonly GeneratedThemeCodeFile[] {
  return [
    createCodeFile({
      path: "examples/ButtonExample.tsx",
      language: "tsx",
      code: generateButtonExampleOutput(tokens),
    }),
    createCodeFile({
      path: "examples/CardExample.tsx",
      language: "tsx",
      code: generateCardExampleOutput(tokens),
    }),
    createCodeFile({
      path: "examples/FormExample.tsx",
      language: "tsx",
      code: generateFormExampleOutput(tokens),
    }),
    createCodeFile({
      path: "examples/PreviewPage.tsx",
      language: "tsx",
      code: generatePreviewPageOutput(tokens),
    }),
  ];
}
