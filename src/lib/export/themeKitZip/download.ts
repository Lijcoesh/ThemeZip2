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
