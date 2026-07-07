import JSZip from "jszip";
import type { ExtractedPalette } from "../../types/color";
import type { ThemeTokens } from "../../types/theme";
import { hexToRgb, rgbToHsl } from "../color/colorUtils";
import { generateThemeOutput } from "../theme/codeGeneration";
import type { ThemeContrastCheck } from "../theme/contrastChecks";
import { isHexColorValue } from "../theme/editableColorTokens";
import {
  isThemeExportFormatSelected,
  themeExportFormatOptions,
  type ThemeExportFormatId,
} from "./exportFormats";

const THEME_KIT_ROOT = "theme-kit";

export type ThemeKitFile = {
  path: string;
  content: string;
};

export type ThemeKitGenerationInput = {
  theme: ThemeTokens;
  palette: ExtractedPalette | null;
  contrastChecks: readonly ThemeContrastCheck[];
  selectedFormats: readonly ThemeExportFormatId[];
  source: "placeholder" | "image";
  sourceImageName?: string;
  generatedAt?: string;
};

type ThemeKitDesignReport = {
  generatedAt: string;
  generatedBy: "ThemeZip MVP";
  source: {
    type: "placeholder" | "image";
    imageName: string | null;
    sourcePixelCount: number | null;
    sampledPixelCount: number | null;
  };
  selectedFormats: readonly ThemeExportFormatId[];
  styleCategory: string;
  extractedPalette: {
    dominant: string | null;
    colors: Array<{
      hex: string;
      rgb: { r: number; g: number; b: number };
      hsl: { h: number; s: number; l: number };
      luminance: number;
      population: number;
    }>;
  };
  semanticTokens: ThemeTokens;
  contrastChecks: Array<{
    id: string;
    label: string;
    status: string;
    ratio: number | null;
    targetRatio: number;
    pairs: Array<{
      foreground: string;
      foregroundValue: string;
      background: string;
      backgroundValue: string;
      ratio: number | null;
    }>;
  }>;
  warnings: string[];
};

type FileTreeNode = {
  children: Map<string, FileTreeNode>;
};

export function createThemeKitFiles(
  input: ThemeKitGenerationInput,
): readonly ThemeKitFile[] {
  if (input.selectedFormats.length === 0) {
    throw new Error("Select at least one export format before generating a ZIP.");
  }

  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const themeOutput = generateThemeOutput(input.theme);
  const files: ThemeKitFile[] = [];

  if (isThemeExportFormatSelected(input.selectedFormats, "react")) {
    files.push(...toThemeKitFiles(themeOutput.typeScriptFiles));
  }

  if (isThemeExportFormatSelected(input.selectedFormats, "css")) {
    files.push(...toThemeKitFiles(themeOutput.cssFiles));
  }

  if (isThemeExportFormatSelected(input.selectedFormats, "tailwind")) {
    files.push(...toThemeKitFiles(themeOutput.tailwindFiles));
  }

  if (isThemeExportFormatSelected(input.selectedFormats, "examples")) {
    files.push(...toThemeKitFiles(themeOutput.exampleFiles));
  }

  if (isThemeExportFormatSelected(input.selectedFormats, "report")) {
    files.push({
      path: "design-report.json",
      content: generateDesignReport(input, generatedAt),
    });
  }

  files.push({
    path: "README.md",
    content: generateReadme({
      ...input,
      generatedAt,
      files: [...files, { path: "README.md", content: "" }],
    }),
  });

  return sortThemeKitFiles(files);
}

export async function generateThemeKitZip(
  input: ThemeKitGenerationInput,
): Promise<Blob> {
  const zip = new JSZip();
  const files = createThemeKitFiles(input);

  for (const file of files) {
    zip.file(`${THEME_KIT_ROOT}/${file.path}`, file.content);
  }

  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6,
    },
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

export function createThemeKitZipFilename(sourceImageName?: string) {
  const normalizedSourceName = sourceImageName
    ?.replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (normalizedSourceName) {
    return `themezip-${normalizedSourceName}-theme-kit.zip`;
  }

  return "themezip-theme-kit.zip";
}

function toThemeKitFiles(
  files: readonly { path: string; code: string }[],
): ThemeKitFile[] {
  return files.map((file) => ({
    path: file.path,
    content: file.code,
  }));
}

function generateReadme(
  input: ThemeKitGenerationInput & {
    generatedAt: string;
    files: readonly ThemeKitFile[];
  },
) {
  const selectedOptionLabels = themeExportFormatOptions
    .filter((option) => input.selectedFormats.includes(option.id))
    .map((option) => `- ${option.label}`);
  const sourceLine =
    input.source === "image" && input.sourceImageName
      ? `Generated from local image reference: ${input.sourceImageName}`
      : "Generated from the ThemeZip fallback token preset.";
  const sections = [
    `# ThemeZip Theme Kit

${sourceLine}

Generated at: ${input.generatedAt}

## Included Outputs

${selectedOptionLabels.join("\n")}

## Files

\`\`\`txt
${createFileTree(input.files)}
\`\`\`

## Quick Start

Copy the \`${THEME_KIT_ROOT}\` folder into your React project. The generated
tokens are suggestions, so review and adjust values before shipping them.`,
    generateReactReadmeSection(input.selectedFormats),
    generateCssReadmeSection(input.selectedFormats),
    generateTailwindReadmeSection(input.selectedFormats),
    generateExamplesReadmeSection(input.selectedFormats),
    generateReportReadmeSection(input.selectedFormats),
    `## Customize

Edit the generated token files or CSS variables directly. All outputs are built
from the same semantic roles: brand, background, text, border, spacing, radius,
shadows and typography.

## Usage Note

ThemeZip creates an original starter theme from visual inspiration. Make sure
you have the rights to use any uploaded reference, and avoid treating the output
as an exact clone of a third-party brand or product.`,
  ].filter(Boolean);

  return `${sections.join("\n\n")}\n`;
}

function generateReactReadmeSection(
  selectedFormats: readonly ThemeExportFormatId[],
) {
  if (!selectedFormats.includes("react")) {
    return "";
  }

  return `## React / TypeScript Theme

Import the generated theme object:

\`\`\`ts
import { theme } from "./theme-kit/theme/theme";
\`\`\`

Use the provider when you want React context access:

\`\`\`tsx
import { ThemeProvider } from "./theme-kit/theme/ThemeProvider";

export function App() {
  return <ThemeProvider>{/* your app */}</ThemeProvider>;
}
\`\`\``;
}

function generateCssReadmeSection(
  selectedFormats: readonly ThemeExportFormatId[],
) {
  if (!selectedFormats.includes("css")) {
    return "";
  }

  return `## CSS Variables

Import the generated globals file from your app entry:

\`\`\`ts
import "./theme-kit/styles/globals.css";
\`\`\`

Or import only \`styles/theme.css\` when you want the variables without global
body styles.`;
}

function generateTailwindReadmeSection(
  selectedFormats: readonly ThemeExportFormatId[],
) {
  if (!selectedFormats.includes("tailwind")) {
    return "";
  }

  return `## Tailwind-Compatible Output

Copy or import \`tailwind/theme.css\` into your Tailwind CSS entry file. It
contains a Tailwind v4 \`@theme\` block that maps the generated tokens to
utility-friendly variables.`;
}

function generateExamplesReadmeSection(
  selectedFormats: readonly ThemeExportFormatId[],
) {
  if (!selectedFormats.includes("examples")) {
    return "";
  }

  return `## Example Components

The \`examples\` folder contains small React components using the generated
token values directly. Start with \`PreviewPage.tsx\` to see the button, card and
form examples together.`;
}

function generateReportReadmeSection(
  selectedFormats: readonly ThemeExportFormatId[],
) {
  if (!selectedFormats.includes("report")) {
    return "";
  }

  return `## Design Report

\`design-report.json\` includes the extracted palette, semantic token
assignments, contrast checks, inferred style category and warnings. Use it for
debugging or for documenting how the starter theme was generated.`;
}

function generateDesignReport(
  input: ThemeKitGenerationInput,
  generatedAt: string,
) {
  const report: ThemeKitDesignReport = {
    generatedAt,
    generatedBy: "ThemeZip MVP",
    source: {
      type: input.source,
      imageName: input.sourceImageName ?? null,
      sourcePixelCount: input.palette?.sourcePixelCount ?? null,
      sampledPixelCount: input.palette?.sampledPixelCount ?? null,
    },
    selectedFormats: input.selectedFormats,
    styleCategory: inferStyleCategory(input.theme),
    extractedPalette: {
      dominant: input.palette?.dominant?.hex ?? null,
      colors:
        input.palette?.colors.map((color) => ({
          hex: color.hex,
          rgb: color.rgb,
          hsl: color.hsl,
          luminance: roundNumber(color.luminance),
          population: roundNumber(color.population),
        })) ?? [],
    },
    semanticTokens: input.theme,
    contrastChecks: input.contrastChecks.map((check) => ({
      id: check.id,
      label: check.label,
      status: check.status,
      ratio: check.ratio === null ? null : roundNumber(check.ratio),
      targetRatio: check.targetRatio,
      pairs: check.pairs.map((pair) => ({
        foreground: formatTokenPath(pair.foreground.path),
        foregroundValue: pair.foreground.value,
        background: formatTokenPath(pair.background.path),
        backgroundValue: pair.background.value,
        ratio: pair.ratio === null ? null : roundNumber(pair.ratio),
      })),
    })),
    warnings: createDesignReportWarnings(input),
  };

  return `${JSON.stringify(report, null, 2)}\n`;
}

function createDesignReportWarnings(input: ThemeKitGenerationInput) {
  const warnings: string[] = [];
  const invalidColorTokens = getInvalidColorTokenPaths(input.theme);

  if (input.source === "placeholder" || !input.palette) {
    warnings.push(
      "No extracted image palette was available, so fallback starter tokens were used.",
    );
  }

  for (const check of input.contrastChecks) {
    if (check.status !== "good") {
      warnings.push(`${check.label}: ${check.status} contrast result.`);
    }
  }

  if (invalidColorTokens.length > 0) {
    warnings.push(
      `Review invalid color token values: ${invalidColorTokens.join(", ")}.`,
    );
  }

  return warnings;
}

function getInvalidColorTokenPaths(theme: ThemeTokens) {
  const colorEntries = [
    ["colors.brand.primary", theme.colors.brand.primary],
    ["colors.brand.secondary", theme.colors.brand.secondary],
    ["colors.brand.accent", theme.colors.brand.accent],
    ["colors.background.page", theme.colors.background.page],
    ["colors.background.surface", theme.colors.background.surface],
    ["colors.background.muted", theme.colors.background.muted],
    ["colors.text.primary", theme.colors.text.primary],
    ["colors.text.secondary", theme.colors.text.secondary],
    ["colors.text.muted", theme.colors.text.muted],
    ["colors.text.inverse", theme.colors.text.inverse],
    ["colors.border.default", theme.colors.border.default],
    ["colors.border.strong", theme.colors.border.strong],
  ] as const;

  return colorEntries
    .filter(([, value]) => !isHexColorValue(value))
    .map(([path]) => path);
}

function inferStyleCategory(theme: ThemeTokens) {
  const primaryRgb = hexToRgb(theme.colors.brand.primary);
  const pageRgb = hexToRgb(theme.colors.background.page);

  if (!primaryRgb || !pageRgb) {
    return "Modern sans";
  }

  const primaryHsl = rgbToHsl(primaryRgb);
  const pageHsl = rgbToHsl(pageRgb);
  const mediumRadius = parsePixelValue(theme.radius.md);

  if (mediumRadius >= 14) {
    return "Playful rounded";
  }

  if (primaryHsl.s < 0.18 && pageHsl.l > 0.92) {
    return "Minimal neutral";
  }

  if (primaryHsl.h >= 190 && primaryHsl.h <= 250) {
    return "Corporate sans";
  }

  if (pageHsl.l < 0.22 || primaryHsl.s < 0.12) {
    return "Luxury/editorial";
  }

  return "Modern sans";
}

function createFileTree(files: readonly ThemeKitFile[]) {
  const rootNode = createTreeNode();

  for (const file of sortThemeKitFiles(files)) {
    const pathParts = file.path.split("/");
    let currentNode = rootNode;

    for (const part of pathParts) {
      const existingNode = currentNode.children.get(part) ?? createTreeNode();

      currentNode.children.set(part, existingNode);
      currentNode = existingNode;
    }
  }

  return [`${THEME_KIT_ROOT}/`, ...renderTreeNode(rootNode, "  ")].join("\n");
}

function createTreeNode(): FileTreeNode {
  return {
    children: new Map(),
  };
}

function renderTreeNode(node: FileTreeNode, indentation: string): string[] {
  const lines: string[] = [];
  const entries = Array.from(node.children.entries()).sort(
    ([firstName, firstNode], [secondName, secondNode]) => {
      const firstIsDirectory = firstNode.children.size > 0;
      const secondIsDirectory = secondNode.children.size > 0;

      if (firstIsDirectory !== secondIsDirectory) {
        return firstIsDirectory ? -1 : 1;
      }

      return firstName.localeCompare(secondName);
    },
  );

  for (const [name, childNode] of entries) {
    const isDirectory = childNode.children.size > 0;

    lines.push(`${indentation}${name}${isDirectory ? "/" : ""}`);

    if (isDirectory) {
      lines.push(...renderTreeNode(childNode, `${indentation}  `));
    }
  }

  return lines;
}

function sortThemeKitFiles(files: readonly ThemeKitFile[]) {
  return [...files].sort((first, second) => first.path.localeCompare(second.path));
}

function parsePixelValue(value: string) {
  const parsedValue = Number.parseFloat(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function formatTokenPath(path: ThemeContrastCheck["pairs"][number]["foreground"]["path"]) {
  return `colors.${path.group}.${String(path.token)}`;
}

function roundNumber(value: number) {
  return Number(value.toFixed(4));
}
