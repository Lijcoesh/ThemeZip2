import type { ThemeTokens } from "../../types/theme";

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

function generateCssVariablesModuleOutput(tokens: ThemeTokens) {
  return `export const cssVariables = ${formatTemplateLiteral(
    generateCssVariablesOutput(tokens),
  )};
`;
}

function generateThemeProviderOutput() {
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

function generateButtonExampleOutput(tokens: ThemeTokens) {
  return `export function ButtonExample() {
  return (
    <button
      type="button"
      style={{
        minHeight: ${literal(tokens.spacing.xl)},
        border: ${literal(`1px solid ${tokens.colors.brand.primary}`)},
        borderRadius: ${literal(tokens.radius.md)},
        background: ${literal(tokens.colors.brand.primary)},
        color: ${literal(tokens.colors.text.inverse)},
        boxShadow: ${literal(tokens.shadows.sm)},
        cursor: "pointer",
        fontWeight: ${literal(tokens.typography.fontWeight.semibold)},
        padding: ${literal(`0 ${tokens.spacing.lg}`)},
      }}
    >
      Preview button
    </button>
  );
}
`;
}

function generateCardExampleOutput(tokens: ThemeTokens) {
  return `export function CardExample() {
  return (
    <article
      style={{
        maxWidth: "420px",
        border: ${literal(`1px solid ${tokens.colors.border.default}`)},
        borderRadius: ${literal(tokens.radius.lg)},
        background: ${literal(tokens.colors.background.surface)},
        color: ${literal(tokens.colors.text.primary)},
        boxShadow: ${literal(tokens.shadows.md)},
        padding: ${literal(tokens.spacing.lg)},
      }}
    >
      <span
        style={{
          display: "inline-flex",
          borderRadius: ${literal(tokens.radius.full)},
          background: ${literal(tokens.colors.background.muted)},
          color: ${literal(tokens.colors.brand.primary)},
          fontSize: ${literal(tokens.typography.fontSize.sm)},
          fontWeight: ${literal(tokens.typography.fontWeight.bold)},
          padding: ${literal(`${tokens.spacing.xs} ${tokens.spacing.sm}`)},
        }}
      >
        ThemeZip card
      </span>
      <h2 style={{ margin: "${tokens.spacing.md} 0 ${tokens.spacing.xs}" }}>
        Generated theme starter
      </h2>
      <p style={{ margin: 0, color: ${literal(tokens.colors.text.secondary)} }}>
        Use this component to sanity-check surface, border, radius and shadow
        tokens in your React project.
      </p>
    </article>
  );
}
`;
}

function generateFormExampleOutput(tokens: ThemeTokens) {
  return `export function FormExample() {
  return (
    <form
      style={{
        display: "grid",
        gap: ${literal(tokens.spacing.md)},
        maxWidth: "420px",
        color: ${literal(tokens.colors.text.primary)},
      }}
    >
      <label style={{ display: "grid", gap: ${literal(tokens.spacing.sm)} }}>
        Project name
        <input
          type="text"
          placeholder="Client dashboard"
          style={{
            minHeight: ${literal(tokens.spacing["2xl"])},
            border: ${literal(`1px solid ${tokens.colors.border.default}`)},
            borderRadius: ${literal(tokens.radius.md)},
            background: ${literal(tokens.colors.background.surface)},
            color: ${literal(tokens.colors.text.primary)},
            padding: ${literal(`0 ${tokens.spacing.md}`)},
          }}
        />
      </label>
      <button
        type="button"
        style={{
          minHeight: ${literal(tokens.spacing["2xl"])},
          border: 0,
          borderRadius: ${literal(tokens.radius.md)},
          background: ${literal(tokens.colors.brand.secondary)},
          color: ${literal(tokens.colors.text.inverse)},
          fontWeight: ${literal(tokens.typography.fontWeight.semibold)},
          padding: ${literal(`0 ${tokens.spacing.lg}`)},
        }}
      >
        Save theme
      </button>
    </form>
  );
}
`;
}

function generatePreviewPageOutput(tokens: ThemeTokens) {
  return `import { ButtonExample } from "./ButtonExample";
import { CardExample } from "./CardExample";
import { FormExample } from "./FormExample";

export function PreviewPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: ${literal(tokens.colors.background.page)},
        color: ${literal(tokens.colors.text.primary)},
        fontFamily: ${literal(tokens.typography.fontFamily.sans)},
        padding: ${literal(tokens.spacing.xl)},
      }}
    >
      <section style={{ display: "grid", gap: ${literal(tokens.spacing.lg)} }}>
        <div>
          <p
            style={{
              margin: 0,
              color: ${literal(tokens.colors.brand.primary)},
              fontWeight: ${literal(tokens.typography.fontWeight.bold)},
            }}
          >
            ThemeZip preview
          </p>
          <h1 style={{ margin: "${tokens.spacing.sm} 0", maxWidth: "680px" }}>
            React theme starter generated from your visual reference.
          </h1>
          <p
            style={{
              maxWidth: "620px",
              color: ${literal(tokens.colors.text.secondary)},
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Copy these examples into your app to check the generated semantic
            tokens against real component states.
          </p>
        </div>
        <ButtonExample />
        <CardExample />
        <FormExample />
      </section>
    </main>
  );
}
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

function formatTemplateLiteral(value: string) {
  return `\`${value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${")}\``;
}

function literal(value: string | number) {
  return JSON.stringify(value);
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
