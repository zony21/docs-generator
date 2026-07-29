import { createId, type DocumentType, type LayoutImage } from "./model";

const SUPPORTED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGES_PER_DOCUMENT = 10;

export function isLayoutDocument(type: DocumentType): type is "S-Layout" | "R-Layout" {
  return type === "S-Layout" || type === "R-Layout";
}

function splitFileName(fileName: string): { base: string; extension: string } {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === fileName.length - 1) {
    return { base: fileName, extension: "" };
  }
  return {
    base: fileName.slice(0, lastDot),
    extension: fileName.slice(lastDot + 1).toLowerCase(),
  };
}

export function normalizeImageFileName(
  originalFileName: string,
  existingNames: readonly string[] = [],
): string {
  const trimmed = originalFileName.trim();
  const { base: originalBase, extension } = splitFileName(trimmed);
  const sanitizedBase = originalBase
    .replace(/\.\./g, "")
    .replace(/^[\\/]+/, "")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim() || "image";
  const allowedExtension = ["png", "jpg", "jpeg", "webp"].includes(extension)
    ? extension
    : "";
  const buildName = (suffix = "") =>
    `${sanitizedBase}${suffix}${allowedExtension ? `.${allowedExtension}` : ""}`;

  const existing = new Set(existingNames.map((name) => name.toLowerCase()));
  let candidate = buildName();
  let index = 2;
  while (existing.has(candidate.toLowerCase())) {
    candidate = buildName(`-${index}`);
    index += 1;
  }
  return candidate;
}

export function validateImageFile(file: File): string[] {
  const errors: string[] = [];
  if (!SUPPORTED_MIME_TYPES.has(file.type)) {
    errors.push(`${file.name}: PNG、JPEG、WebPのみ添付できます。`);
  }
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`${file.name}: 画像サイズは10MB以下にしてください。`);
  }
  return errors;
}

export function createLayoutImages(
  files: readonly File[],
  existingImages: readonly LayoutImage[],
): { images: LayoutImage[]; errors: string[] } {
  const errors: string[] = [];
  const images: LayoutImage[] = [];
  if (existingImages.length + files.length > MAX_IMAGES_PER_DOCUMENT) {
    errors.push(`画像は1設計書につき最大${MAX_IMAGES_PER_DOCUMENT}枚です。`);
    return { images, errors };
  }

  const usedNames = existingImages.map((image) => image.outputFileName);
  for (const file of files) {
    const validationErrors = validateImageFile(file);
    if (validationErrors.length > 0) {
      errors.push(...validationErrors);
      continue;
    }
    const outputFileName = normalizeImageFileName(file.name, usedNames);
    usedNames.push(outputFileName);
    const fallbackTitle = outputFileName.replace(/\.[^.]+$/, "");
    images.push({
      id: createId(),
      originalFileName: file.name,
      outputFileName,
      mimeType: file.type as LayoutImage["mimeType"],
      size: file.size,
      title: fallbackTitle,
      alt: fallbackTitle,
      notes: "",
      order: existingImages.length + images.length + 1,
      file,
      previewUrl: URL.createObjectURL(file),
    });
  }
  return { images, errors };
}

export function revokeImagePreview(image: LayoutImage): void {
  if (image.previewUrl) {
    URL.revokeObjectURL(image.previewUrl);
  }
}

export function imageAssetPath(type: "S-Layout" | "R-Layout", image: LayoutImage): string {
  return `sheets/${type}/${image.outputFileName}`;
}

export function markdownImagePath(type: "S-Layout" | "R-Layout", image: LayoutImage): string {
  return `./${type}/${image.outputFileName}`;
}
