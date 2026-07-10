import { formatFileSize } from "../file/formatFileSize";

export { formatFileSize } from "../file/formatFileSize";

export const ACCEPTED_HTML_TYPES = ["text/html"];
export const ACCEPTED_HTML_EXTENSIONS = [".html", ".htm"];
export const MAX_HTML_SIZE_BYTES = 5 * 1024 * 1024;

type HtmlValidationResult =
  | {
      ok: true;
      htmlText: string;
      title: string | null;
    }
  | {
      ok: false;
      message: string;
    };

export async function validateHtmlFile(file: File): Promise<HtmlValidationResult> {
  const extension = getFileExtension(file.name);
  const hasAcceptedExtension = ACCEPTED_HTML_EXTENSIONS.includes(extension);
  const hasAcceptedType = file.type
    ? ACCEPTED_HTML_TYPES.includes(file.type.toLowerCase())
    : true;

  if (!hasAcceptedExtension || !hasAcceptedType) {
    return {
      ok: false,
      message: "Upload an HTML file (.html or .htm).",
    };
  }

  if (file.size > MAX_HTML_SIZE_BYTES) {
    return {
      ok: false,
      message: `Choose an HTML file smaller than ${formatFileSize(
        MAX_HTML_SIZE_BYTES,
      )}.`,
    };
  }

  try {
    const htmlText = await file.text();

    if (!htmlText.trim()) {
      return {
        ok: false,
        message: "This HTML file is empty.",
      };
    }

    return {
      ok: true,
      htmlText,
      title: readDocumentTitle(htmlText),
    };
  } catch {
    return {
      ok: false,
      message: "The selected file could not be read as text.",
    };
  }
}

function getFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex === -1 ? "" : fileName.slice(lastDotIndex).toLowerCase();
}

function readDocumentTitle(htmlText: string) {
  const parsedDocument = new DOMParser().parseFromString(htmlText, "text/html");
  const title = parsedDocument.querySelector("title")?.textContent?.trim();
  return title && title.length > 0 ? title : null;
}
