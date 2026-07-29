import { getDocumentSummary, type DocumentData, type DocumentType, type GroupItem, type TableRow } from "./model";
import type { UiActions } from "./uiContext";
import { button, element, field, moveItem, type ColumnDefinition } from "./uiPrimitives";

function ensureTable(data: DocumentData, key: string): TableRow[] {
  data.tables[key] ??= [];
  return data.tables[key];
}

function ensureGroups(data: DocumentData, key: string): GroupItem[] {
  data.groups[key] ??= [];
  return data.groups[key];
}

function blankRecord(columns: readonly ColumnDefinition[]): Record<string, string> {
  return Object.fromEntries(columns.map((column) => [column.key, ""]));
}

function refresh(actions: UiActions): void {
  actions.render();
  actions.changed();
}

export function renderSummaryEditor(type: DocumentType, container: HTMLElement): void {
  const data = getDocumentSummary(type);
  const summary = element("div", "subsection fixed-summary");
  summary.append(
    element("h3", "", "シートサマリー（固定）"),
    element("p", "helper-text", "Excelシートの役割を表す定型情報です。設計内容の入力対象ではありません。"),
  );
  const grid = element("dl", "fixed-summary__grid");
  const entries: Array<[string, string]> = [
    ["Title", data.sheetTitle],
    ["Screen / component name", data.screenComponentName],
    ["Event / check / function name", data.eventCheckFunctionName],
    ["Timing", data.timing],
    ["Notes", data.notes],
  ];
  for (const [label, value] of entries) {
    const item = element("div", "fixed-summary__item");
    item.append(
      element("dt", "", label),
      element("dd", value ? "" : "fixed-summary__empty", value || "（空）"),
    );
    grid.append(item);
  }
  summary.append(grid);
  container.append(summary);
}

export function renderTextEditor(
  container: HTMLElement,
  data: DocumentData,
  key: string,
  label: string,
  actions: UiActions,
  rows = 4,
  placeholder = "",
): void {
  container.append(field(label, data.text[key] ?? "", (value) => { data.text[key] = value; }, actions.changed, { rows, placeholder }));
}

export function renderTableEditor(
  container: HTMLElement,
  title: string,
  data: DocumentData,
  tableKey: string,
  columns: readonly ColumnDefinition[],
  actions: UiActions,
  options: { includeNumber?: boolean; initialValues?: Record<string, string> } = {},
): void {
  const subsection = element("div", "subsection");
  const heading = element("div", "subsection__heading");
  const rows = ensureTable(data, tableKey);
  heading.append(
    element("h3", "", title),
    button("行を追加", "button button--small button--secondary", () => {
      rows.push({ ...blankRecord(columns), ...options.initialValues });
      refresh(actions);
    }),
  );
  subsection.append(heading);
  if (rows.length === 0) subsection.append(element("p", "empty-state", "行はまだありません。必要な場合だけ追加してください。"));

  rows.forEach((row, index) => {
    const card = element("div", "row-card");
    const header = element("div", "row-card__header");
    header.append(element("strong", "", options.includeNumber ? `No. ${index + 1}` : `行 ${index + 1}`));
    const controls = element("div", "row-actions");
    controls.append(
      button("↑", "icon-button", () => { moveItem(rows, index, -1); refresh(actions); }),
      button("↓", "icon-button", () => { moveItem(rows, index, 1); refresh(actions); }),
      button("複製", "icon-button icon-button--text", () => { rows.splice(index + 1, 0, { ...row }); refresh(actions); }),
      button("削除", "icon-button icon-button--danger icon-button--text", () => { rows.splice(index, 1); refresh(actions); }),
    );
    header.append(controls);
    card.append(header);
    const grid = element("div", "row-card__grid");
    for (const column of columns) {
      grid.append(field(column.label, row[column.key] ?? "", (value) => { row[column.key] = value; }, actions.changed, {
        rows: column.textarea ? 3 : undefined,
        placeholder: column.placeholder,
        compact: true,
      }));
    }
    card.append(grid);
    subsection.append(card);
  });
  container.append(subsection);
}

export function renderGroupEditor(
  container: HTMLElement,
  title: string,
  data: DocumentData,
  groupKey: string,
  fields: readonly ColumnDefinition[],
  itemLabel: string,
  actions: UiActions,
): void {
  const subsection = element("div", "subsection");
  const heading = element("div", "subsection__heading");
  const groups = ensureGroups(data, groupKey);
  heading.append(
    element("h3", "", title),
    button(`${itemLabel}を追加`, "button button--small button--secondary", () => {
      groups.push(blankRecord(fields));
      refresh(actions);
    }),
  );
  subsection.append(heading);
  if (groups.length === 0) subsection.append(element("p", "empty-state", `${itemLabel}はまだありません。`));

  groups.forEach((item, index) => {
    const card = element("div", "group-card");
    const header = element("div", "row-card__header");
    header.append(element("strong", "", `${itemLabel} ${index + 1}`));
    const controls = element("div", "row-actions");
    controls.append(
      button("↑", "icon-button", () => { moveItem(groups, index, -1); refresh(actions); }),
      button("↓", "icon-button", () => { moveItem(groups, index, 1); refresh(actions); }),
      button("複製", "icon-button icon-button--text", () => { groups.splice(index + 1, 0, { ...item }); refresh(actions); }),
      button("削除", "icon-button icon-button--danger icon-button--text", () => { groups.splice(index, 1); refresh(actions); }),
    );
    header.append(controls);
    card.append(header);
    const grid = element("div", "group-card__grid");
    for (const definition of fields) {
      grid.append(field(definition.label, item[definition.key] ?? "", (value) => { item[definition.key] = value; }, actions.changed, {
        rows: definition.textarea ? 4 : undefined,
        placeholder: definition.placeholder,
        compact: true,
      }));
    }
    card.append(grid);
    subsection.append(card);
  });
  container.append(subsection);
}
