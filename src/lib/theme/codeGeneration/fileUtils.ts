import type { GeneratedThemeCodeFile, ThemeCodeLanguage } from "./index";

export function createCodeFile(input: {
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

export function formatFileBundle(files: readonly GeneratedThemeCodeFile[]) {
  return files.map((file) => `// ${file.path}\n${file.code}`).join("\n\n");
}

export function formatTemplateLiteral(value: string) {
  return `\`${value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${")}\``;
}

export function literal(value: string | number) {
  return JSON.stringify(value);
}
