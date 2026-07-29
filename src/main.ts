import "./style-base.css";
import "./style-components.css";
import { getDocumentDefinition } from "./documentDefinitions";
import { revokeImagePreview } from "./imageAssets";
import { generateDesignPackage, packageRootName, validateDesignPackage } from "./markdownGenerator";
import { createDefaultDesignPackage, DOCUMENT_TYPES, type DocumentType } from "./model";
import { clearDraft, loadDraft, saveDraft } from "./storage";
import type { PageId, UiActions, UiState } from "./uiContext";
import { renderCommonSection, renderDocumentSelection, renderHero } from "./uiCommonSections";
import { renderDocumentPage } from "./uiDocumentSections";
import { renderPageStepper, renderPageTabs } from "./uiNavigation";
import { element } from "./uiPrimitives";
import { renderActionBar, renderPreviewSection, updatePreview } from "./uiPreviewSections";
import { renderTableCatalogSection } from "./uiTableCatalog";
import { createZipBlob, downloadBlob } from "./zipExporter";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("#app element was not found.");
const appRoot = app;
const state: UiState = {
  design: loadDraft() ?? createDefaultDesignPackage(),
  messages: [],
  selectedPreviewPath: "README.md",
  currentPage: "common",
  previewMode: "rendered",
  editingSummary: null,
  editingFields: null,
};
let saveTimer: number | undefined;
let previewTimer: number | undefined;

function renderMessages(): void {
  const region = document.querySelector<HTMLDivElement>("#message-region");
  if (!region) return;
  region.replaceChildren();
  region.hidden = state.messages.length === 0;
  if (state.messages.length === 0) return;
  const list = element("ul");
  for (const message of state.messages) list.append(element("li", "", message));
  region.append(list);
}

function setMessages(messages: string[]): void {
  state.messages = messages;
  renderMessages();
}

function changed(): void {
  window.clearTimeout(saveTimer);
  const status = document.querySelector<HTMLElement>("#save-status");
  if (status) status.textContent = "保存中…";
  saveTimer = window.setTimeout(() => {
    try {
      saveDraft(state.design);
      if (status) status.textContent = "自動保存済み";
    } catch {
      if (status) status.textContent = "保存できませんでした";
    }
  }, 400);
  window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(() => updatePreview(state), 120);
}

function navigate(page: PageId): void {
  state.currentPage = page;
  state.editingSummary = null;
  state.editingFields = null;
  if (page === "common" || page === "tables") {
    state.selectedPreviewPath = "README.md";
  } else {
    state.selectedPreviewPath = getDocumentDefinition(page).outputPath;
  }
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function revokeAllImages(): void {
  for (const type of ["S-Layout", "R-Layout"] as const) {
    for (const image of state.design.documents[type].images) revokeImagePreview(image);
  }
}

function resetDesign(): void {
  if (!window.confirm("入力内容と自動保存データをすべて削除しますか？")) return;
  revokeAllImages();
  state.design = createDefaultDesignPackage();
  state.selectedPreviewPath = "README.md";
  state.currentPage = "common";
  state.previewMode = "rendered";
  state.editingSummary = null;
  state.editingFields = null;
  clearDraft();
  setMessages([]);
  render();
}

async function exportZip(exportButton: HTMLButtonElement): Promise<void> {
  const errors = validateDesignPackage(state.design);
  if (errors.length > 0) {
    setMessages(errors);
    document.querySelector("#message-region")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  exportButton.disabled = true;
  exportButton.textContent = "ZIP作成中…";
  try {
    const result = generateDesignPackage(state.design);
    downloadBlob(await createZipBlob(result), `${packageRootName(state.design)}.zip`);
    setMessages([]);
  } catch (error) {
    setMessages([error instanceof Error ? error.message : "ZIPを出力できませんでした."]);
  } finally {
    exportButton.disabled = false;
    exportButton.textContent = "ZIPを出力";
  }
}

const actions: UiActions = {
  changed,
  render,
  setMessages,
  updatePreview: () => updatePreview(state),
  navigate,
  resetDesign,
  exportZip,
};

function renderCurrentPage(main: HTMLElement): void {
  if (state.currentPage === "common") {
    const stack = element("div", "settings-page-stack");
    stack.append(
      renderCommonSection(state, actions),
      renderDocumentSelection(state, actions),
      renderPageStepper(state, actions),
    );
    main.append(stack);
    return;
  }

  if (state.currentPage === "tables") {
    const stack = element("div", "settings-page-stack");
    stack.append(renderTableCatalogSection(state, actions), renderPageStepper(state, actions));
    main.append(stack);
    return;
  }

  if (!DOCUMENT_TYPES.includes(state.currentPage as DocumentType)) {
    state.currentPage = "common";
    renderCurrentPage(main);
    return;
  }

  const type = state.currentPage as DocumentType;
  if (!state.design.selectedDocuments.includes(type)) {
    state.currentPage = "common";
    renderCurrentPage(main);
    return;
  }
  const workspace = element("div", "editor-preview-layout");
  workspace.append(renderDocumentPage(type, state, actions), renderPreviewSection(state, actions));
  main.append(workspace);
}

function render(): void {
  appRoot.replaceChildren();
  const shell = element("div", "app-shell");
  shell.append(renderHero());
  const main = element("main", "main-content");
  const messageRegion = element("div", "message-region") as HTMLDivElement;
  messageRegion.id = "message-region";
  messageRegion.hidden = true;
  main.append(messageRegion, renderPageTabs(state, actions));
  renderCurrentPage(main);
  shell.append(main, renderActionBar(actions));
  appRoot.append(shell);
  renderMessages();
  updatePreview(state);
}

window.addEventListener("beforeunload", (event) => {
  const hasImages = (["S-Layout", "R-Layout"] as const).some(
    (type) => state.design.documents[type].images.some((image) => image.file),
  );
  if (hasImages) event.preventDefault();
});

render();
