export type ThemeExportFormatId =
  | "react"
  | "css"
  | "tailwind"
  | "examples"
  | "report";

export type ThemeExportFormatOption = {
  id: ThemeExportFormatId;
  label: string;
  description: string;
  fileHint: string;
};

export const themeExportFormatOptions = [
  {
    id: "react",
    label: "React / TypeScript theme",
    description: "Typed token files plus a lightweight ThemeProvider.",
    fileHint: "theme/*.ts, theme/ThemeProvider.tsx",
  },
  {
    id: "css",
    label: "CSS variables",
    description: "Plain CSS custom properties and starter globals.",
    fileHint: "styles/theme.css, styles/globals.css",
  },
  {
    id: "tailwind",
    label: "Tailwind-compatible output",
    description: "Tailwind v4 theme variables mapped from the same tokens.",
    fileHint: "tailwind/theme.css",
  },
  {
    id: "examples",
    label: "Example React components",
    description: "Button, card, form and preview page examples.",
    fileHint: "examples/*.tsx",
  },
  {
    id: "report",
    label: "Design report",
    description: "Palette, token assignments, contrast checks and warnings.",
    fileHint: "design-report.json",
  },
] as const satisfies readonly ThemeExportFormatOption[];

export const defaultThemeExportFormatIds = [
  "react",
  "css",
  "examples",
  "report",
] as const satisfies readonly ThemeExportFormatId[];

export const fullThemeExportFormatIds = [
  "react",
  "css",
  "tailwind",
  "examples",
  "report",
] as const satisfies readonly ThemeExportFormatId[];

export function isThemeExportFormatSelected(
  selectedFormats: readonly ThemeExportFormatId[],
  formatId: ThemeExportFormatId,
) {
  return selectedFormats.includes(formatId);
}

export function areThemeExportFormatsEqual(
  selectedFormats: readonly ThemeExportFormatId[],
  comparisonFormats: readonly ThemeExportFormatId[],
) {
  return (
    selectedFormats.length === comparisonFormats.length &&
    comparisonFormats.every((formatId) => selectedFormats.includes(formatId))
  );
}

export function getThemeKitDownloadLabel(
  selectedFormats: readonly ThemeExportFormatId[],
) {
  if (areThemeExportFormatsEqual(selectedFormats, fullThemeExportFormatIds)) {
    return "Download full theme kit";
  }

  if (selectedFormats.length === 1) {
    const selectedFormat = selectedFormats[0];

    if (selectedFormat === "react") {
      return "Download React theme ZIP";
    }

    if (selectedFormat === "css") {
      return "Download CSS variables ZIP";
    }

    if (selectedFormat === "tailwind") {
      return "Download Tailwind theme ZIP";
    }

    if (selectedFormat === "examples") {
      return "Download examples ZIP";
    }

    return "Download design report ZIP";
  }

  return `Download theme kit ZIP (${selectedFormats.length} formats)`;
}

