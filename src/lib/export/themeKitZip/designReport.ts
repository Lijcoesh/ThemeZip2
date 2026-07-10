import type { ThemeTokens } from "../../../types/theme";
import { hexToRgb, rgbToHsl } from "../../color/colorUtils";
import type { ThemeContrastCheck } from "../../theme/contrastChecks";
import { isHexColorValue } from "../../theme/editableColorTokens";
import type { ThemeExportFormatId } from "../exportFormats";
import type { ThemeKitGenerationInput } from "./index";

export type ThemeKitDesignReport = {
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

export function generateDesignReport(
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
