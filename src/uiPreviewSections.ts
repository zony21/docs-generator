import { generateDesignPackage, type GeneratedTextFile } from "./markdownGenerator";
import { renderMarkdown } from "./markdownRenderer";
import type { UiActions, UiState } from "./uiContext";
import { button, element, sectionHeader } from "./uiPrimitives";

function previewTextFiles(state: UiState): GeneratedTextFile[] {
  const result = generateDesignPackage(state.design, new Date().toISOString(), { validate: false });
  return result.files.filter((file): file is GeneratedTextFile => file.kind === "text");
}

function resolvePreviewImage(state: UiState, path: string): string | undefined {
  const normalized = path.replace(/^\.\//, "");
  for (const type of ["S-Layout", "R-Layout"] as const) {
    for (const image of state.design.documents[type].images) {
      if (`${type}/${image.outputFileName}` === normalized) return image.previewUrl;
    }
  }
  return undefined;
}

function applyPreviewMode(state: UiState): void {
  const rendered = document.querySelector<HTMLElement>("#markdown-rendered-preview");
  const source = document.querySelector<HTMLElement>("#markdown-source-preview");
  if (rendered) rendered.hidden = state.previewMode !== "rendered";
  if (source) source.hidden = state.previewMode !== "source";
  document.querySelectorAll<HTMLButtonElement>("[data-preview-mode]").forEach((modeButton) => {
    const active = modeButton.dataset.previewMode === state.previewMode;
    modeButton.classList.toggle("preview-mode-button--active", active);
    modeButton.setAttribute("aria-pressed", String(active));
  });
}

export function updatePreview(state: UiState): void {
  const select = document.querySelector<HTMLSelectElement>("#preview-file-select");
  const source = document.querySelector<HTMLPreElement>("#markdown-source-preview");
  const rendered = document.querySelector<HTMLElement>("#markdown-rendered-preview");
  const path = document.querySelector<HTMLElement>(".preview-path");
  if (!select || !source || !rendered) return;
  try {
    const files = previewTextFiles(state);
    if (!files.some((file) => file.path === state.selectedPreviewPath)) {
      state.selectedPreviewPath = files[0]?.path ?? "README.md";
    }
    const previous = [...select.options].map((option) => option.value).join("\n");
    const next = files.map((file) => file.path).join("\n");
    if (previous !== next) {
      select.replaceChildren();
      for (const file of files) {
        const option = element("option") as HTMLOptionElement;
        option.value = file.path;
        option.textContent = file.path;
        select.append(option);
      }
    }
    select.value = state.selectedPreviewPath;
    const content = files.find((file) => file.path === state.selectedPreviewPath)?.content ?? "生成対象がありません。";
    source.textContent = content;
    rendered.innerHTML = renderMarkdown(content, (imagePath) => resolvePreviewImage(state, imagePath));
    if (path) path.textContent = state.selectedPreviewPath;
    applyPreviewMode(state);
  } catch (error) {
    const message = error instanceof Error ? error.message : "プレビューを生成できませんでした。";
    source.textContent = message;
    rendered.textContent = message;
  }
}

export function renderPreviewSection(state: UiState, actions: UiActions): HTMLElement {
  const section = element("section", "panel preview-panel");
  section.append(sectionHeader("4", "Markdownプレビュー", "完成イメージとMarkdownコードを切り替えて確認できます。"));
  const toolbar = element("div", "preview-toolbar");
  const label = element("label", "field field--inline");
  label.append(element("span", "field__label", "プレビューファイル"));
  const select = element("select") as HTMLSelectElement;
  select.id = "preview-file-select";
  select.addEventListener("change", () => {
    state.selectedPreviewPath = select.value;
    actions.updatePreview();
  });
  label.append(select);
  toolbar.append(label, element("span", "preview-path", state.selectedPreviewPath));

  const modeSwitch = element("div", "preview-mode-switch");
  const renderedButton = button("表示プレビュー", "preview-mode-button", () => {
    state.previewMode = "rendered";
    actions.updatePreview();
  });
  renderedButton.dataset.previewMode = "rendered";
  const sourceButton = button("Markdownコード", "preview-mode-button", () => {
    state.previewMode = "source";
    actions.updatePreview();
  });
  sourceButton.dataset.previewMode = "source";
  modeSwitch.append(renderedButton, sourceButton);

  const rendered = element("article", "rendered-preview markdown-body");
  rendered.id = "markdown-rendered-preview";
  rendered.tabIndex = 0;
  const source = element("pre", "markdown-preview") as HTMLPreElement;
  source.id = "markdown-source-preview";
  source.tabIndex = 0;
  section.append(toolbar, modeSwitch, rendered, source);
  return section;
}

export function renderActionBar(actions: UiActions): HTMLElement {
  const footer = element("footer", "action-bar");
  const inner = element("div", "action-bar__inner");
  const status = element("div", "save-status");
  const statusText = element("span", "", "自動保存済み");
  statusText.id = "save-status";
  status.append(element("span", "status-dot status-dot--muted"), statusText);
  const controls = element("div", "action-bar__actions");
  const clearButton = button("入力クリア", "button button--ghost", actions.resetDesign);
  const exportButton = button("ZIPを出力", "button button--primary", () => { void actions.exportZip(exportButton); });
  controls.append(clearButton, exportButton);
  inner.append(status, controls);
  footer.append(inner);
  return footer;
}
