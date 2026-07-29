import { DOCUMENT_DEFINITIONS, sortDocumentTypes } from "./documentDefinitions";
import { BASIC_DOCUMENTS, DOCUMENT_TYPES, type DocumentType } from "./model";
import type { UiActions, UiState } from "./uiContext";
import { button, element, field, sectionHeader } from "./uiPrimitives";

export function renderHero(): HTMLElement {
  const header = element("header", "hero");
  const inner = element("div", "hero__inner");
  const titleArea = element("div");
  titleArea.append(
    element("p", "hero__eyebrow", "MARKDOWN DESIGN PACKAGE"),
    element("h1", "", "Docs Generator"),
    element("p", "hero__description", "一機能分の設計情報を入力し、README・設計書・レイアウト画像を一つのZIPへ出力します。入力内容はブラウザ内だけで扱います。"),
  );
  const status = element("div", "hero__status");
  status.append(
    element("span", "status-dot"),
    element("span", "", "バックエンドなし"),
    element("small", "", " / Local Storage自動保存"),
  );
  inner.append(titleArea, status);
  header.append(inner);
  return header;
}

export function renderCommonSection(state: UiState, actions: UiActions): HTMLElement {
  const section = element("section", "panel");
  section.append(sectionHeader("1", "機能共通情報", "一度入力した内容を、選択したすべての設計書へ反映します。"));
  const grid = element("div", "form-grid");
  const common = state.design.common;
  grid.append(
    field("システム名", common.systemName, (value) => { common.systemName = value; }, actions.changed, { required: true }),
    field("モジュール名", common.moduleName, (value) => { common.moduleName = value; }, actions.changed),
    field("モジュールID", common.moduleId, (value) => { common.moduleId = value; }, actions.changed),
    field("機能ID", common.functionId, (value) => { common.functionId = value; }, actions.changed, { required: true, placeholder: "例: KY01" }),
    field("機能名", common.functionName, (value) => { common.functionName = value; }, actions.changed, { required: true, placeholder: "例: 契約一覧" }),
    field("文書番号", common.documentNumber, (value) => { common.documentNumber = value; }, actions.changed),
    field("作成日", common.date, (value) => { common.date = value; }, actions.changed, { type: "date", required: true }),
    field("Rev", common.revision, (value) => { common.revision = value; }, actions.changed, { required: true }),
    field("作成者", common.author, (value) => { common.author = value; }, actions.changed, { required: true }),
  );
  const wide = element("div", "form-grid form-grid--wide");
  wide.append(
    field("機能概要", common.summary, (value) => { common.summary = value; }, actions.changed, { rows: 4, required: true, placeholder: "この機能が何を行うかを記入" }),
    field("パッケージ備考", common.notes, (value) => { common.notes = value; }, actions.changed, { rows: 4 }),
  );
  section.append(grid, wide);
  return section;
}

function selectDocuments(types: readonly DocumentType[], state: UiState, actions: UiActions): void {
  state.design.selectedDocuments = sortDocumentTypes(types);
  if (
    DOCUMENT_TYPES.includes(state.currentPage as DocumentType)
    && !state.design.selectedDocuments.includes(state.currentPage as DocumentType)
  ) {
    state.currentPage = "common";
    state.selectedPreviewPath = "README.md";
  }
  actions.render();
  actions.changed();
}

export function renderDocumentSelection(state: UiState, actions: UiActions): HTMLElement {
  const section = element("section", "panel");
  section.append(sectionHeader("2", "作成する設計書", "基本6設計書は初期選択済みです。必要な追加設計書だけ選択してください。"));
  const controls = element("div", "button-row");
  controls.append(
    button("基本のみ", "button button--secondary", () => selectDocuments(BASIC_DOCUMENTS, state, actions)),
    button("全選択", "button button--secondary", () => selectDocuments(DOCUMENT_TYPES, state, actions)),
    button("全解除", "button button--ghost", () => selectDocuments([], state, actions)),
  );
  const grid = element("div", "document-grid");
  const selected = new Set(state.design.selectedDocuments);
  for (const definition of DOCUMENT_DEFINITIONS) {
    const active = selected.has(definition.type);
    const label = element("label", `document-choice${active ? " document-choice--selected" : ""}`);
    const checkbox = element("input") as HTMLInputElement;
    checkbox.type = "checkbox";
    checkbox.checked = active;
    checkbox.addEventListener("change", () => {
      const next = new Set(state.design.selectedDocuments);
      if (checkbox.checked) next.add(definition.type); else next.delete(definition.type);
      selectDocuments([...next], state, actions);
    });
    const text = element("span");
    text.append(element("strong", "", definition.type), element("small", "", definition.displayName));
    const badge = element("span", definition.selectedByDefault ? "badge badge--basic" : "badge", definition.selectedByDefault ? "基本" : "追加");
    label.append(checkbox, text, badge);
    grid.append(label);
  }
  section.append(controls, grid);
  return section;
}
