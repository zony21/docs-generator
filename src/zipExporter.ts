import JSZip from "jszip";
import type { GenerationResult } from "./markdownGenerator";

export async function createZipBlob(result: GenerationResult): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder(result.rootDirectory);
  if (!root) {
    throw new Error("ZIPルートフォルダを作成できませんでした。");
  }

  for (const file of result.files) {
    root.file(file.path, file.content);
  }

  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
