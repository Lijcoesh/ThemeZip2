export type ImageDimensions = {
  width: number;
  height: number;
};

export type UploadedImage = {
  file: File;
  previewUrl: string;
  dimensions: ImageDimensions;
};
