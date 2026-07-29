import type { DesignPackage } from "./model";

export interface UiState {
  design: DesignPackage;
  messages: string[];
  selectedPreviewPath: string;
}

export interface UiActions {
  changed(): void;
  render(): void;
  setMessages(messages: string[]): void;
  updatePreview(): void;
  resetDesign(): void;
  exportZip(button: HTMLButtonElement): Promise<void>;
}
