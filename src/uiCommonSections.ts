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
    element("p", "hero__description", "正規Markdownテンプレートに沿って、一機能分の設計書を画面・帳票・処理・移送単位で作成します。入力内容はブラウザ内だけで扱います。"),
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
  section.append(sectionHeader("1", "共通情報", "READMEと全設計書の基本情報へ反映します。"));
  const grid = element("div", "form-grid");
  const common = state.design.common;
  grid.append(
    field("システム名", common.systemName, (value) => { common.systemName = value; }, actions.changed, { required: true }),
    field("モジュール名", common.moduleName, (value) => { common.moduleName = value; }, actions.changed, { required: true }),
    field("モジュールID", common.moduleId, (value) => { common.moduleId = value; }, actions.changed, { required: true }),
    field("文書日付", common.date, (value) => { common.date = value; }, actions.changed, { type: "date", required: true }),
    field("変換日", common.conversionDate, (value) => { common.conversionDate = value; }, actions.changed, { type: "date", required: true }),
    field("Rev", common.revision, (value) => { common.revision = value; }, actions.changed, { required: true }),
    field("作成者", common.author, (value) => { common.author = value; }, actions.changed, { required: true }),
  );
  const wide = element("div", "form-grid form-grid--wide");
  wide.append(
    field("元Excelファイル", common.sourceExcelFile, (value) => { common.sourceExcelFile = value; }, actions.changed, {
      placeholder: "例: docs/source/design-excel/screen/xxx.xlsx",
    }),
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
  section.append(sectionHeader("2", "作成する設計書", "基本6設計書は初期選択済みです。テンプレートガイドに従い必要な設計書を追加してください。"));
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
    const labelNode = element("label", `document-choice${active ? " document-choice--selected" : ""}`);
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
    labelNode.append(checkbox, text, badge);
    grid.append(labelNode);
  }
  section.append(controls, grid);
  return section;
}
