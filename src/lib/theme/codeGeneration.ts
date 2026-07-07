import type { ThemeTokens } from "../../types/theme";

export type ThemeCodePreviewId = "typescript" | "css-variables" | "tailwind";

export type ThemeCodeLanguage = "typescript" | "css";

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
  tailwindCssVariables: string;
};

type CssVariable = {
  name: string;
  value: string | number;
};

type CssVariableSection = {
  title: string;
  variables: readonly CssVariable[];
};

export function generateThemeOutput(
  tokens: ThemeTokens,
): GeneratedThemeOutput {
  const typeScriptFiles = generateTypeScriptThemeFiles(tokens);

  return {
    typeScript: formatFileBundle(typeScriptFiles),
    typeScriptFiles,
    cssVariables: generateCssVariablesOutput(tokens),
    tailwindCssVariables: generateTailwindThemeOutput(tokens),
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
      files: [
        createCodeFile({
          path: "styles/theme.css",
          language: "css",
          code: output.cssVariables,
        }),
      ],
    },
    {
      id: "tailwind",
      title: "Tailwind-compatible variables",
      description:
        "Tailwind CSS v4 theme variables that map tokens to utilities.",
      files: [
        createCodeFile({
          path: "tailwind/theme.css",
          language: "css",
          code: output.tailwindCssVariables,
        }),
      ],
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
  ];
}

export function generateTypeScriptThemeOutput(tokens: ThemeTokens) {
  return formatFileBundle(generateTypeScriptThemeFiles(tokens));
}

export function generateCssVariablesOutput(tokens: ThemeTokens) {
  return formatCssOutput(":root", createCssVariableSections(tokens));
}

export function generateTailwindThemeOutput(tokens: ThemeTokens) {
  return `@import "tailwindcss";

${formatCssOutput("@theme", createTailwindVariableSections(tokens))}
`;
}

function createConstExport(name: string, value: unknown) {
  return `export const ${name} = ${JSON.stringify(value, null, 2)} as const;`;
}

function generateTokenIndexOutput() {
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

function generateThemeIndexOutput() {
  return `import { tokens } from "./tokens";

export const theme = tokens;

export type Theme = typeof theme;
`;
}

function createCodeFile(input: {
  path: string;
  language: ThemeCodeLanguage;
  code: string;
}): GeneratedThemeCodeFile {
  const filename = input.path.split("/").at(-1) ?? input.path;

  return {
    id: input.path,
    path: input.path,
    filename,
    language: input.language,
    code: input.code,
  };
}

function formatFileBundle(files: readonly GeneratedThemeCodeFile[]) {
  return files.map((file) => `// ${file.path}\n${file.code}`).join("\n\n");
}

function createCssVariableSections(
  tokens: ThemeTokens,
): readonly CssVariableSection[] {
  return [
    {
      title: "Brand colors",
      variables: [
        createVariable("color-brand-primary", tokens.colors.brand.primary),
        createVariable("color-brand-secondary", tokens.colors.brand.secondary),
        createVariable("color-brand-accent", tokens.colors.brand.accent),
      ],
    },
    {
      title: "Background colors",
      variables: [
        createVariable("color-background-page", tokens.colors.background.page),
        createVariable("color-background-surface", tokens.colors.background.surface),
        createVariable("color-background-muted", tokens.colors.background.muted),
      ],
    },
    {
      title: "Text colors",
      variables: [
        createVariable("color-text-primary", tokens.colors.text.primary),
        createVariable("color-text-secondary", tokens.colors.text.secondary),
        createVariable("color-text-muted", tokens.colors.text.muted),
        createVariable("color-text-inverse", tokens.colors.text.inverse),
      ],
    },
    {
      title: "Border colors",
      variables: [
        createVariable("color-border-default", tokens.colors.border.default),
        createVariable("color-border-strong", tokens.colors.border.strong),
      ],
    },
    {
      title: "Spacing",
      variables: createVariables("spacing", tokens.spacing),
    },
    {
      title: "Radius",
      variables: createVariables("radius", tokens.radius),
    },
    {
      title: "Shadows",
      variables: createVariables("shadow", tokens.shadows),
    },
    {
      title: "Typography",
      variables: [
        ...createVariables("font-family", tokens.typography.fontFamily),
        ...createVariables("font-size", tokens.typography.fontSize),
        ...createVariables("font-weight", tokens.typography.fontWeight),
      ],
    },
  ];
}

function createTailwindVariableSections(
  tokens: ThemeTokens,
): readonly CssVariableSection[] {
  return [
    {
      title: "Colors",
      variables: [
        createVariable("color-brand-primary", tokens.colors.brand.primary),
        createVariable("color-brand-secondary", tokens.colors.brand.secondary),
        createVariable("color-brand-accent", tokens.colors.brand.accent),
        createVariable("color-background-page", tokens.colors.background.page),
        createVariable("color-background-surface", tokens.colors.background.surface),
        createVariable("color-background-muted", tokens.colors.background.muted),
        createVariable("color-text-primary", tokens.colors.text.primary),
        createVariable("color-text-secondary", tokens.colors.text.secondary),
        createVariable("color-text-muted", tokens.colors.text.muted),
        createVariable("color-text-inverse", tokens.colors.text.inverse),
        createVariable("color-border-default", tokens.colors.border.default),
        createVariable("color-border-strong", tokens.colors.border.strong),
      ],
    },
    {
      title: "Fonts",
      variables: [
        createVariable("font-sans", tokens.typography.fontFamily.sans),
        createVariable("font-heading", tokens.typography.fontFamily.heading),
        createVariable("font-mono", tokens.typography.fontFamily.mono),
      ],
    },
    {
      title: "Text sizes",
      variables: createVariables("text", tokens.typography.fontSize),
    },
    {
      title: "Font weights",
      variables: createVariables("font-weight", tokens.typography.fontWeight),
    },
    {
      title: "Spacing",
      variables: createVariables("spacing", tokens.spacing),
    },
    {
      title: "Radius",
      variables: createVariables("radius", tokens.radius),
    },
    {
      title: "Shadows",
      variables: createVariables("shadow", tokens.shadows),
    },
  ];
}

function createVariables<T extends object>(
  prefix: string,
  tokens: T,
): readonly CssVariable[] {
  return typedEntries(tokens).map(([tokenName, value]) =>
    createVariable(`${prefix}-${toKebabCase(String(tokenName))}`, String(value)),
  );
}

function createVariable(name: string, value: string | number): CssVariable {
  return {
    name: `--${name}`,
    value,
  };
}

function formatCssOutput(
  selector: string,
  sections: readonly CssVariableSection[],
) {
  const sectionBlocks = sections
    .map((section) => {
      const variables = section.variables
        .map((variable) => `  ${variable.name}: ${variable.value};`)
        .join("\n");

      return `  /* ${section.title} */\n${variables}`;
    })
    .join("\n\n");

  return `${selector} {
${sectionBlocks}
}`;
}

function typedEntries<T extends object>(value: T) {
  return Object.entries(value) as Array<[keyof T, T[keyof T]]>;
}

function toKebabCase(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
