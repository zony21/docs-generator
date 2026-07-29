import { generateDesignPackage, type GeneratedTextFile } from "./markdownGenerator";
import type { UiActions, UiState } from "./uiContext";
import { button, element, sectionHeader } from "./uiPrimitives";

function previewTextFiles(state: UiState): GeneratedTextFile[] {
  const result = generateDesignPackage(state.design, new Date().toISOString(), { validate: false });
  return result.files.filter((file): file is GeneratedTextFile => file.kind === "text");
}

export function updatePreview(state: UiState): void {
  const select = document.querySelector<HTMLSelectElement>("#preview-file-select");
  const pre = document.querySelector<HTMLPreElement>("#markdown-preview");
  const path = document.querySelector<HTMLElement>(".preview-path");
  if (!select || !pre) return;
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
    pre.textContent = files.find((file) => file.path === state.selectedPreviewPath)?.content ?? "生成対象がありません。";
    if (path) path.textContent = state.selectedPreviewPath;
  } catch (error) {
    pre.textContent = error instanceof Error ? error.message : "プレビューを生成できませんでした。";
  }
}

export function renderPreviewSection(state: UiState, actions: UiActions): HTMLElement {
  const section = element("section", "panel preview-panel");
  section.append(sectionHeader("4", "Markdownプレビュー", "ZIPへ出力するMarkdownソースをファイル単位で確認できます。"));
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
  const pre = element("pre", "markdown-preview") as HTMLPreElement;
  pre.id = "markdown-preview";
  pre.tabIndex = 0;
  section.append(toolbar, pre);
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
