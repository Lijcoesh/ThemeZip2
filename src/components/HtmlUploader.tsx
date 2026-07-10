import {
  type ChangeEvent,
  type DragEvent,
  useId,
  useState,
} from "react";
import {
  ACCEPTED_HTML_EXTENSIONS,
  MAX_HTML_SIZE_BYTES,
  formatFileSize,
  validateHtmlFile,
} from "../lib/html/validation";
import type { UploadedHtml } from "../types/upload";

type HtmlUploaderProps = {
  value: UploadedHtml | null;
  onHtmlChange: (html: UploadedHtml | null) => void;
};

export function HtmlUploader({ value, onHtmlChange }: HtmlUploaderProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    const validation = await validateHtmlFile(file);

    if (!validation.ok) {
      setError(validation.message);
      onHtmlChange(null);
      return;
    }

    setError(null);
    onHtmlChange({
      kind: "html",
      file,
      htmlText: validation.htmlText,
      title: validation.title,
    });
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    void handleFile(event.currentTarget.files?.[0]);
    event.currentTarget.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    void handleFile(event.dataTransfer.files?.[0]);
  }

  const dropZoneClassName = [
    "drop-zone",
    isDragging ? "is-dragging" : "",
    error ? "has-error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className="upload-header">
        <h2 id="upload-title">Import a saved HTML page</h2>
        <p>
          Press Ctrl+S (or Cmd+S) on a page you like, save it as HTML, then
          drop the file here. Accepted up to{" "}
          {formatFileSize(MAX_HTML_SIZE_BYTES)}.
        </p>
      </div>

      <div
        className={dropZoneClassName}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id={inputId}
          className="file-input"
          type="file"
          accept={[...ACCEPTED_HTML_EXTENSIONS, "text/html"].join(",")}
          onChange={handleInputChange}
        />

        <p className="drop-zone-title">
          {value ? "HTML page uploaded" : "Drop an .html file here"}
        </p>
        <p className="drop-zone-text">
          {value
            ? "ThemeZip is scanning inline styles in this file locally in your browser."
            : "Choose a saved HTML page to start the local preview flow."}
        </p>

        <div className="upload-actions">
          <label className="button-like" htmlFor={inputId}>
            {value ? "Replace HTML" : "Upload HTML"}
          </label>
          {value ? (
            <button
              className="ghost-button"
              type="button"
              onClick={() => {
                setError(null);
                onHtmlChange(null);
              }}
            >
              Remove
            </button>
          ) : null}
        </div>

        {error ? (
          <p className="upload-error" role="alert">
            {error}
          </p>
        ) : null}

        {value ? (
          <div className="image-preview" aria-label="Uploaded HTML file summary">
            <div className="image-meta">
              <strong>{value.title ?? value.file.name}</strong>
              <span>
                {value.file.name}, {formatFileSize(value.file.size)}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
