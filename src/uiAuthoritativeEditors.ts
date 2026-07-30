import {
  createDocumentSection,
  createSectionForDocument,
  type DesignPackage,
  type DocumentData,
  type DocumentSection,
  type DocumentType,
  type TableRow,
} from "./model";
import type { UiActions, UiState } from "./uiContext";
import { renderTableEditor, renderTextEditor, type EditorPreset } from "./uiEditors";
import { configuredColumns, inputFieldLabel, isInputFieldEnabled } from "./uiFieldSettings";
import { tableCatalogSuggestions } from "./uiTableCatalog";
import { button, element, field, moveItem, type ColumnDefinition } from "./uiPrimitives";

function refresh(actions: UiActions): void {
  actions.render();
  actions.changed();
}

function updateOrders<T extends { order: number }>(items: T[]): void {
  items.forEach((item, index) => { item.order = index + 1; });
}

function cloneSection(section: DocumentSection): DocumentSection {
  return {
    ...structuredClone(section),
    id: crypto.randomUUID(),
    children: section.children.map(cloneSection),
  };
}

function labelFor(state: UiState, type: DocumentType, key: string, fallback: string): string {
  return inputFieldLabel(state.design, type, key, fallback);
}

function enabled(state: UiState, type: DocumentType, key: string): boolean {
  return isInputFieldEnabled(state.design, type, key);
}

function columns(
  type: DocumentType,
  state: UiState,
  scope: string,
  definitions: readonly ColumnDefinition[],
): ColumnDefinition[] {
  return configuredColumns(state.design, type, scope, definitions);
}

function blankRecord(definitions: readonly ColumnDefinition[]): TableRow {
  return Object.fromEntries(definitions.map((definition) => [definition.key, ""]));
}

function renderRowsEditor(
  container: HTMLElement,
  title: string,
  rows: TableRow[],
  definitions: readonly ColumnDefinition[],
  actions: UiActions,
  initialValues: TableRow = {},
): void {
  if (definitions.length === 0) return;
  const subsection = element("div", "subsection");
  const heading = element("div", "subsection__heading");
  heading.append(
    element("h3", "", title),
    button("行を追加", "button button--small button--secondary", () => {
      rows.push({ ...blankRecord(definitions), ...initialValues });
      refresh(actions);
    }),
  );
  subsection.append(heading);
  if (rows.length === 0) subsection.append(element("p", "empty-state", "行はまだありません。必要な場合だけ追加してください。"));
  rows.forEach((row, index) => {
    const card = element("div", "row-card");
    const header = element("div", "row-card__header");
    header.append(element("strong", "", `No. ${index + 1}`));
    const controls = element("div", "row-actions");
    controls.append(
      button("↑", "icon-button", () => { moveItem(rows, index, -1); refresh(actions); }),
      button("↓", "icon-button", () => { moveItem(rows, index, 1); refresh(actions); }),
      button("複製", "icon-button icon-button--text", () => { rows.splice(index + 1, 0, { ...row }); refresh(actions); }),
      button("削除", "icon-button icon-button--danger icon-button--text", () => { rows.splice(index, 1); refresh(actions); }),
    );
    header.append(controls);
    const grid = element("div", "row-card__grid");
    definitions.forEach((definition) => {
      grid.append(field(definition.label, row[definition.key] ?? "", (value) => { row[definition.key] = value; }, actions.changed, {
        rows: definition.textarea ? 3 : undefined,
        placeholder: definition.placeholder,
        compact: true,
        suggestions: definition.suggestions,
      }));
    });
    card.append(header, grid);
    subsection.append(card);
  });
  container.append(subsection);
}

function renderSectionField(
  container: HTMLElement,
  state: UiState,
  type: DocumentType,
  section: DocumentSection,
  key: string,
  preferenceKey: string,
  fallbackLabel: string,
  actions: UiActions,
  options: { rows?: number; placeholder?: string } = {},
): void {
  if (!enabled(state, type, preferenceKey)) return;
  container.append(field(
    labelFor(state, type, preferenceKey, fallbackLabel),
    section.fields[key] ?? "",
    (value) => { section.fields[key] = value; },
    actions.changed,
    { rows: options.rows, placeholder: options.placeholder, compact: true },
  ));
}

function renderSectionName(
  container: HTMLElement,
  state: UiState,
  type: DocumentType,
  section: DocumentSection,
  preferenceKey: string,
  fallbackLabel: string,
  actions: UiActions,
): void {
  if (!enabled(state, type, preferenceKey)) return;
  container.append(field(
    labelFor(state, type, preferenceKey, fallbackLabel),
    section.name,
    (value) => { section.name = value; },
    actions.changed,
    { compact: true },
  ));
}

function renderChildren(
  container: HTMLElement,
  state: UiState,
  type: "FuncSpec" | "FuncDetail",
  section: DocumentSection,
  actions: UiActions,
): void {
  const subsection = element("div", "subsection");
  const heading = element("div", "subsection__heading");
  const itemLabel = type === "FuncSpec" ? "処理・ボタン" : "処理";
  heading.append(
    element("h3", "", `${itemLabel}一覧`),
    button(`${itemLabel}を追加`, "button button--small button--secondary", () => {
      section.children.push(createDocumentSection(type === "FuncSpec" ? `処理${section.children.length + 1}` : `処理名称${section.children.length + 1}`, section.children.length));
      refresh(actions);
    }),
  );
  subsection.append(heading);
  if (section.children.length === 0) subsection.append(element("p", "empty-state", `${itemLabel}はまだありません。`));
  section.children.forEach((child, index) => {
    const card = element("div", "group-card");
    const header = element("div", "row-card__header");
    header.append(element("strong", "", child.name || `${itemLabel}${index + 1}`));
    const controls = element("div", "row-actions");
    controls.append(
      button("↑", "icon-button", () => { moveItem(section.children, index, -1); updateOrders(section.children); refresh(actions); }),
      button("↓", "icon-button", () => { moveItem(section.children, index, 1); updateOrders(section.children); refresh(actions); }),
      button("複製", "icon-button icon-button--text", () => { section.children.splice(index + 1, 0, cloneSection(child)); updateOrders(section.children); refresh(actions); }),
      button("削除", "icon-button icon-button--danger icon-button--text", () => { section.children.splice(index, 1); updateOrders(section.children); refresh(actions); }),
    );
    header.append(controls);
    const grid = element("div", "group-card__grid");
    renderSectionName(grid, state, type, child, "processes.name", type === "FuncSpec" ? "処理名・ボタン名" : "処理名称", actions);
    if (type === "FuncSpec") {
      renderSectionField(grid, state, type, child, "content", "processes.content", "仕様内容（Markdown）", actions, {
        rows: 10,
        placeholder: "例:\n- **入力チェック**\n  - 必須項目を確認する。",
      });
    } else {
      renderSectionField(grid, state, type, child, "functionName", "processes.functionName", "関数名", actions);
      renderSectionField(grid, state, type, child, "functionType", "processes.functionType", "関数種別", actions);
      renderSectionField(grid, state, type, child, "summary", "processes.summary", "概要", actions, { rows: 3 });
      renderSectionField(grid, state, type, child, "referenceSheet", "processes.referenceSheet", "参照Sheet", actions, { placeholder: "Relation / Others / Check" });
      renderSectionField(grid, state, type, child, "notes", "processes.notes", "備考", actions, { rows: 3 });
      renderSectionField(grid, state, type, child, "steps", "processes.steps", "処理手順（Markdown）", actions, {
        rows: 12,
        placeholder: "- **try**\n  - 処理を記載\n- **catch（すべての例外）**\n  - 例外処理",
      });
    }
    card.append(header, grid);
    subsection.append(card);
  });
  container.append(subsection);
}

function renderSectionList(
  type: DocumentType,
  container: HTMLElement,
  data: DocumentData,
  state: UiState,
  actions: UiActions,
): void {
  const list = element("div", "subsection authoritative-sections");
  const heading = element("div", "subsection__heading");
  const unitLabel: Record<string, string> = {
    "S-Layout": "画面",
    "R-Layout": "帳票",
    FuncSpec: "画面",
    Event: "画面",
    FuncDetail: "画面",
    Relation: "移送",
    Check: "画面・チェック",
    Others: "コード定義",
  };
  const unit = unitLabel[type] ?? "セクション";
  heading.append(
    element("h3", "", `${unit}一覧`),
    button(`${unit}を追加`, "button button--small button--secondary", () => {
      data.sections.push(createSectionForDocument(type, data.sections.length));
      refresh(actions);
    }),
  );
  list.append(heading);
  if (data.sections.length === 0) list.append(element("p", "empty-state", `${unit}はまだありません。`));

  data.sections.forEach((section, index) => {
    const card = element("div", "authoritative-section-card");
    const header = element("div", "row-card__header");
    header.append(element("strong", "", `${index + 1}. ${section.name || unit}`));
    const controls = element("div", "row-actions");
    controls.append(
      button("↑", "icon-button", () => { moveItem(data.sections, index, -1); updateOrders(data.sections); refresh(actions); }),
      button("↓", "icon-button", () => { moveItem(data.sections, index, 1); updateOrders(data.sections); refresh(actions); }),
      button("複製", "icon-button icon-button--text", () => { data.sections.splice(index + 1, 0, cloneSection(section)); updateOrders(data.sections); refresh(actions); }),
      button("削除", "icon-button icon-button--danger icon-button--text", () => { data.sections.splice(index, 1); updateOrders(data.sections); refresh(actions); }),
    );
    header.append(controls);
    card.append(header);
    const fields = element("div", "form-grid form-grid--summary");

    if (type === "Others") renderSectionName(fields, state, type, section, "sections.name", "定義名", actions);
    else renderSectionName(fields, state, type, section, "section.name", unit === "移送" ? "移送名" : `${unit}名`, actions);

    switch (type) {
      case "S-Layout": {
        renderSectionField(fields, state, type, section, "notes", "section.notes", "備考", actions, { rows: 5, placeholder: "1行1項目で入力" });
        card.append(fields);
        renderRowsEditor(card, "画面項目", section.tables.items ??= [], columns(type, state, "items", [
          { key: "itemName", label: "項目名称" },
          { key: "type", label: "タイプ" },
          { key: "io", label: "I/O" },
          { key: "length", label: "桁数" },
          { key: "required", label: "必須" },
          { key: "screenMode1", label: "画面モード①" },
          { key: "screenMode2", label: "画面モード②" },
          { key: "screenMode3", label: "画面モード③" },
          { key: "notes", label: "備考", textarea: true },
          { key: "focusMessage", label: "フォーカス時メッセージ", textarea: true },
        ]), actions);
        renderRowsEditor(card, "フッター", section.tables.footer ??= [], columns(type, state, "items", [
          { key: "itemName", label: "項目名称" },
          { key: "type", label: "タイプ" },
          { key: "io", label: "I/O" },
          { key: "length", label: "桁数" },
          { key: "required", label: "必須" },
          { key: "screenMode1", label: "画面モード①" },
          { key: "screenMode2", label: "画面モード②" },
          { key: "screenMode3", label: "画面モード③" },
          { key: "notes", label: "備考", textarea: true },
          { key: "focusMessage", label: "フォーカス時メッセージ", textarea: true },
        ]), actions, { type: "btn", io: "In" });
        break;
      }
      case "R-Layout":
        renderSectionField(fields, state, type, section, "overview", "section.overview", "帳票の用途", actions, { rows: 3 });
        renderSectionField(fields, state, type, section, "outputTiming", "section.outputTiming", "出力タイミング", actions);
        renderSectionField(fields, state, type, section, "outputFormat", "section.outputFormat", "出力形式", actions, { placeholder: "PDF / CSV / Excel / 印刷 / その他" });
        card.append(fields);
        renderRowsEditor(card, "帳票項目", section.tables.items ??= [], columns(type, state, "items", [
          { key: "itemName", label: "項目名称" },
          { key: "digits", label: "桁数" },
          { key: "pageBreak", label: "改頁" },
          { key: "group", label: "グループ" },
          { key: "setting", label: "項目設定内容", textarea: true },
          { key: "notes", label: "備考", textarea: true },
        ]), actions);
        break;
      case "FuncSpec":
        card.append(fields);
        renderChildren(card, state, type, section, actions);
        break;
      case "Event":
        card.append(fields);
        renderRowsEditor(card, "イベント一覧", section.tables.events ??= [], columns(type, state, "events", [
          { key: "eventName", label: "イベント名称／処理名称" },
          { key: "control", label: "コントロール" },
          { key: "timing", label: "起動タイミング" },
          { key: "inheritedMethod", label: "継承メソッド" },
          { key: "summary", label: "概要／備考", textarea: true },
        ]), actions);
        break;
      case "FuncDetail":
        renderSectionField(fields, state, type, section, "overview", "section.overview", "概要", actions, { rows: 3 });
        card.append(fields);
        renderChildren(card, state, type, section, actions);
        break;
      case "Relation": {
        renderSectionField(fields, state, type, section, "transferType", "section.transferType", "移送区分", actions, { placeholder: "Select / Insert / Update / Delete / API / File" });
        renderSectionField(fields, state, type, section, "condition", "section.condition", "条件", actions, { rows: 3 });
        renderSectionField(fields, state, type, section, "sortOrder", "section.sortOrder", "並び順", actions);
        renderSectionField(fields, state, type, section, "arguments", "section.arguments", "引数", actions, { rows: 3 });
        renderSectionField(fields, state, type, section, "sql", "section.sql", "SQL", actions, { rows: 12, placeholder: "SELECT ..." });
        card.append(fields);
        const suggestions = tableCatalogSuggestions(state.design);
        renderRowsEditor(card, "移送元／移送先", section.tables.mappings ??= [], columns(type, state, "mappings", [
          { key: "sourceTable", label: "移送元テーブル名", suggestions },
          { key: "sourceColumn", label: "移送元カラム名" },
          { key: "sourceItem", label: "移送元項目名称" },
          { key: "destinationTable", label: "移送先テーブル名", suggestions },
          { key: "destinationColumn", label: "移送先カラム名" },
          { key: "destinationItem", label: "移送先項目名称" },
          { key: "notes", label: "備考", textarea: true },
        ]), actions);
        break;
      }
      case "Check":
        renderSectionField(fields, state, type, section, "checkName", "section.checkName", "チェック名称", actions);
        renderSectionField(fields, state, type, section, "timing", "section.timing", "タイミング", actions);
        card.append(fields);
        renderRowsEditor(card, "チェック一覧", section.tables.checks ??= [], columns(type, state, "checks", [
          { key: "checkItem", label: "チェック項目" },
          { key: "type", label: "種別" },
          { key: "detail", label: "チェック詳細", textarea: true },
          { key: "messageId", label: "メッセージID" },
          { key: "messageArguments", label: "メッセージ引数" },
          { key: "message", label: "メッセージ", textarea: true },
        ]), actions);
        break;
      case "Others":
        renderSectionField(fields, state, type, section, "language", "sections.language", "コード種別", actions, { placeholder: "csharp / sql / json / text" });
        renderSectionField(fields, state, type, section, "code", "sections.code", "コード", actions, { rows: 14 });
        card.append(fields);
        break;
      default:
        card.append(fields);
        break;
    }
    list.append(card);
  });
  container.append(list);
}

function renderSimpleDocuments(
  type: DocumentType,
  container: HTMLElement,
  data: DocumentData,
  state: UiState,
  actions: UiActions,
): boolean {
  const catalogPresets: EditorPreset[] = state.design.tableCatalog.map((item) => ({
    label: [item.physicalName || item.logicalName, item.logicalName].filter(Boolean).join(" / "),
    values: {
      logicalName: item.logicalName,
      physicalName: item.physicalName,
      category: item.category,
    },
  }));
  switch (type) {
    case "Hist":
      renderTableEditor(container, "改版履歴", data, "history", columns(type, state, "history", [
        { key: "creationDate", label: "Creation Date" },
        { key: "author", label: "Author" },
        { key: "revision", label: "Rev." },
        { key: "sheet", label: "Sheet" },
        { key: "note", label: "Note", textarea: true },
        { key: "approvalDate", label: "Approval Date" },
        { key: "approvedBy", label: "Approval by" },
      ]), actions, {
        initialValues: {
          creationDate: state.design.common.date,
          author: state.design.common.author,
          revision: state.design.common.revision,
        },
      });
      return true;
    case "Outline_A":
      if (enabled(state, type, "overview")) renderTextEditor(container, data, "overview", labelFor(state, type, "overview", "機能概要"), actions, 6, "1行1項目で入力");
      if (enabled(state, type, "scopeTarget")) renderTextEditor(container, data, "scopeTarget", labelFor(state, type, "scopeTarget", "対象"), actions, 4);
      if (enabled(state, type, "scopeExcluded")) renderTextEditor(container, data, "scopeExcluded", labelFor(state, type, "scopeExcluded", "対象外"), actions, 4);
      return true;
    case "Outline_B":
      if (enabled(state, type, "processOverview")) renderTextEditor(container, data, "processOverview", labelFor(state, type, "processOverview", "処理概要"), actions, 6, "1行1項目で入力");
      if (enabled(state, type, "processingStyle")) renderTextEditor(container, data, "processingStyle", labelFor(state, type, "processingStyle", "処理形態"), actions, 2);
      if (enabled(state, type, "executionMethod")) renderTextEditor(container, data, "executionMethod", labelFor(state, type, "executionMethod", "実行方法"), actions, 2);
      renderTableEditor(container, "CRUD表", data, "crud", columns(type, state, "crud", [
        { key: "logicalName", label: "論理テーブル名" },
        { key: "physicalName", label: "物理テーブル名（短縮名）" },
        { key: "category", label: "種別" },
        { key: "select", label: "S" },
        { key: "insert", label: "I" },
        { key: "update", label: "U" },
        { key: "delete", label: "D" },
      ]), actions, { presets: catalogPresets });
      return true;
    case "Footnote":
      if (enabled(state, type, "supplementalNotes")) renderTextEditor(container, data, "supplementalNotes", labelFor(state, type, "supplementalNotes", "補足説明"), actions, 8, "1行1項目で入力");
      return true;
    default:
      return false;
  }
}

export function renderAuthoritativeEditor(
  type: DocumentType,
  container: HTMLElement,
  state: UiState,
  actions: UiActions,
): void {
  const data = state.design.documents[type];
  if (renderSimpleDocuments(type, container, data, state, actions)) return;
  renderSectionList(type, container, data, state, actions);
  if (type === "Others" && enabled(state, type, "supplementalRules")) {
    renderTextEditor(container, data, "supplementalRules", labelFor(state, type, "supplementalRules", "補足ルール"), actions, 6, "1行1項目で入力");
  }
}

export function migrateCatalogPreset(_design: DesignPackage): void {
  // Reserved for future template-defined presets.
}
