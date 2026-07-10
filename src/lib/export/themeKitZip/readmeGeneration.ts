import {
  themeExportFormatOptions,
  type ThemeExportFormatId,
} from "../exportFormats";
import type { ThemeKitFile, ThemeKitGenerationInput } from "./index";

export const THEME_KIT_ROOT = "theme-kit";

type FileTreeNode = {
  children: Map<string, FileTreeNode>;
};

export function generateReadme(
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

export function sortThemeKitFiles(files: readonly ThemeKitFile[]) {
  return [...files].sort((first, second) => first.path.localeCompare(second.path));
}
