import {
  type ChangeEvent,
  type CSSProperties,
  type DragEvent,
  useId,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {
  chromeColors,
  filledButtonSx,
  ghostButtonSx,
  type SxObject,
} from "../../theme/muiTheme";
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  MAX_IMAGE_SIZE_BYTES,
  formatFileSize,
  validateImageFile,
} from "../../lib/image/validation";
import type { UploadedImage } from "../../types/upload";

type ImageUploaderProps = {
  value: UploadedImage | null;
  onImageChange: (image: UploadedImage | null) => void;
};

// Equivalent of the old `.file-input` visually-hidden clip trick.
const hiddenFileInputStyle: CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  clipPath: "inset(50%)",
};

const dropZoneBaseSx: SxObject = {
  display: "flex",
  flex: 1,
  flexDirection: "column",
  justifyContent: "center",
  minHeight: 300,
  padding: "28px",
  border: `1px dashed ${chromeColors.borderStrong}`,
  borderRadius: "8px",
  background: chromeColors.page,
  textAlign: "center",
  transition:
    "border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease",
  "@media (max-width: 520px)": {
    padding: "16px",
  },
};

const dropZoneDraggingSx: SxObject = {
  borderColor: chromeColors.primary,
  backgroundColor: chromeColors.primarySoft,
  boxShadow: "0 0 0 4px rgba(13, 122, 103, 0.12)",
};

const dropZoneErrorSx: SxObject = {
  borderColor: chromeColors.danger,
  backgroundColor: chromeColors.dangerSoft,
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

  return (
    <Paper
      component="section"
      aria-labelledby="upload-title"
      sx={{
        border: `1px solid ${chromeColors.border}`,
        boxShadow: chromeColors.shadowMd,
        display: "flex",
        flexDirection: "column",
        minHeight: 520,
        padding: "20px",
        "@media (max-width: 920px)": {
          minHeight: "auto",
        },
      }}
    >
      <Box sx={{ marginBottom: "18px" }}>
        <Typography
          component="h2"
          id="upload-title"
          sx={{
            margin: 0,
            color: chromeColors.ink,
            fontSize: "1.35rem",
            fontWeight: 700,
          }}
        >
          Upload reference image
        </Typography>
        <Typography
          component="p"
          sx={{
            margin: "8px 0 0",
            color: chromeColors.muted,
            lineHeight: 1.6,
          }}
        >
          PNG, JPG, JPEG and WebP are accepted up to{" "}
          {formatFileSize(MAX_IMAGE_SIZE_BYTES)}.
        </Typography>
      </Box>

      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={[
          dropZoneBaseSx,
          isDragging && dropZoneDraggingSx,
          Boolean(error) && dropZoneErrorSx,
        ]}
      >
        <input
          id={inputId}
          type="file"
          accept={ACCEPTED_IMAGE_EXTENSIONS.join(",")}
          onChange={handleInputChange}
          style={hiddenFileInputStyle}
        />

        <Typography
          component="p"
          sx={{
            margin: 0,
            color: chromeColors.ink,
            fontSize: "1.2rem",
            fontWeight: 800,
          }}
        >
          {value ? "Reference uploaded" : "Drop an image here"}
        </Typography>
        <Typography
          component="p"
          sx={{
            maxWidth: "320px",
            margin: "10px auto 0",
            color: chromeColors.muted,
            lineHeight: 1.6,
          }}
        >
          {value
            ? "ThemeZip is extracting palette suggestions locally in your browser."
            : "Choose a screenshot, logo or UI mockup to start the local preview flow."}
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px",
            marginTop: "22px",
          }}
        >
          <Button component="label" htmlFor={inputId} sx={filledButtonSx}>
            {value ? "Replace image" : "Upload image"}
          </Button>
          {value ? (
            <Button
              type="button"
              sx={ghostButtonSx}
              onClick={() => {
                setError(null);
                onImageChange(null);
              }}
            >
              Remove
            </Button>
          ) : null}
        </Box>

        {error ? (
          <Typography
            component="p"
            role="alert"
            sx={{
              margin: "16px 0 0",
              color: chromeColors.danger,
              fontWeight: 700,
              lineHeight: 1.5,
            }}
          >
            {error}
          </Typography>
        ) : null}

        {value ? (
          <Paper
            aria-label="Uploaded image preview"
            sx={{
              marginTop: "20px",
              overflow: "hidden",
              border: `1px solid ${chromeColors.border}`,
            }}
          >
            <img
              src={value.previewUrl}
              alt="Uploaded visual reference preview"
              style={{
                display: "block",
                width: "100%",
                maxHeight: 260,
                objectFit: "cover",
              }}
            />
            <Box
              sx={{
                display: "grid",
                gap: "4px",
                padding: "14px",
                color: chromeColors.muted,
                fontSize: "0.925rem",
              }}
            >
              <Typography
                component="strong"
                sx={{
                  color: chromeColors.ink,
                  fontWeight: 700,
                  fontSize: "inherit",
                  lineHeight: "inherit",
                  overflowWrap: "anywhere",
                }}
              >
                {value.file.name}
              </Typography>
              <Typography
                component="span"
                sx={{
                  color: "inherit",
                  fontWeight: "inherit",
                  fontSize: "inherit",
                  lineHeight: "inherit",
                }}
              >
                {value.dimensions.width} by {value.dimensions.height}px,{" "}
                {formatFileSize(value.file.size)}
              </Typography>
            </Box>
          </Paper>
        ) : null}
      </Box>
    </Paper>
  );
}
