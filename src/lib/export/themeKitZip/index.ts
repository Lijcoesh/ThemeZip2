import JSZip from "jszip";
import type { ExtractedPalette } from "../../../types/color";
import type { ThemeTokens } from "../../../types/theme";
import { generateThemeOutput } from "../../theme/codeGeneration";
import type { ThemeContrastCheck } from "../../theme/contrastChecks";
import {
  isThemeExportFormatSelected,
  type ThemeExportFormatId,
} from "../exportFormats";
import { generateDesignReport } from "./designReport";
import {
  generateReadme,
  sortThemeKitFiles,
  THEME_KIT_ROOT,
} from "./readmeGeneration";

export { downloadBlob, createThemeKitZipFilename } from "./download";

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

function toThemeKitFiles(
  files: readonly { path: string; code: string }[],
): ThemeKitFile[] {
  return files.map((file) => ({
    path: file.path,
    content: file.code,
  }));
}
