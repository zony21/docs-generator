import type { DesignPackage, DocumentType } from "./model";

export type PageId = "common" | "tables" | DocumentType;
export type PreviewMode = "rendered" | "source";

export interface UiState {
  design: DesignPackage;
  messages: string[];
  selectedPreviewPath: string;
  currentPage: PageId;
  previewMode: PreviewMode;
  editingSummary: DocumentType | null;
  editingFields: DocumentType | null;
}

export interface UiActions {
  changed(): void;
  render(): void;
  setMessages(messages: string[]): void;
  updatePreview(): void;
  navigate(page: PageId): void;
  resetDesign(): void;
  importExcel(file: File): Promise<void>;
  exportZip(button: HTMLButtonElement): Promise<void>;
}
