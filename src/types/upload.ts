export type ImageDimensions = {
  width: number;
  height: number;
};

export type UploadedImage = {
  kind: "image";
  file: File;
  previewUrl: string;
  dimensions: ImageDimensions;
};

export type UploadedHtml = {
  kind: "html";
  file: File;
  htmlText: string;
  title: string | null;
};

export type UploadedSource = UploadedImage | UploadedHtml;
