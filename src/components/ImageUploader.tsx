import {
  type ChangeEvent,
  type DragEvent,
  useId,
  useState,
} from "react";
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  MAX_IMAGE_SIZE_BYTES,
  formatFileSize,
  validateImageFile,
} from "../lib/image/validation";
import type { UploadedImage } from "../types/upload";

type ImageUploaderProps = {
  value: UploadedImage | null;
  onImageChange: (image: UploadedImage | null) => void;
};

export function ImageUploader({ value, onImageChange }: ImageUploaderProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    const validation = await validateImageFile(file);

    if (!validation.ok) {
      setError(validation.message);
      onImageChange(null);
      return;
    }

    setError(null);
    onImageChange({
      file,
      previewUrl: URL.createObjectURL(file),
      dimensions: validation.dimensions,
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
    <section className="upload-card" aria-labelledby="upload-title">
      <div className="upload-header">
        <h2 id="upload-title">Upload reference image</h2>
        <p>
          PNG, JPG, JPEG and WebP are accepted up to{" "}
          {formatFileSize(MAX_IMAGE_SIZE_BYTES)}.
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
          accept={ACCEPTED_IMAGE_EXTENSIONS.join(",")}
          onChange={handleInputChange}
        />

        <p className="drop-zone-title">
          {value ? "Reference uploaded" : "Drop an image here"}
        </p>
        <p className="drop-zone-text">
          {value
            ? "ThemeZip is extracting palette suggestions locally in your browser."
            : "Choose a screenshot, logo or UI mockup to start the local preview flow."}
        </p>

        <div className="upload-actions">
          <label className="button-like" htmlFor={inputId}>
            {value ? "Replace image" : "Upload image"}
          </label>
          {value ? (
            <button
              className="ghost-button"
              type="button"
              onClick={() => {
                setError(null);
                onImageChange(null);
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
          <div className="image-preview" aria-label="Uploaded image preview">
            <img src={value.previewUrl} alt="Uploaded visual reference preview" />
            <div className="image-meta">
              <strong>{value.file.name}</strong>
              <span>
                {value.dimensions.width} by {value.dimensions.height}px,{" "}
                {formatFileSize(value.file.size)}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
