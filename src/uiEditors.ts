import { getDocumentSummary, type DocumentData, type DocumentType, type GroupItem, type TableRow } from "./model";
import type { UiActions, UiState } from "./uiContext";
import { button, element, field, moveItem, type ColumnDefinition } from "./uiPrimitives";

export interface EditorPreset {
  label: string;
  values: Record<string, string>;
}

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

function renderSummaryValues(data: DocumentData): HTMLElement {
  const grid = element("dl", "fixed-summary__grid");
  const entries: Array<[string, string]> = [
    ["Title", data.summary.sheetTitle],
    ["Screen / component name", data.summary.screenComponentName],
    ["Event / check / function name", data.summary.eventCheckFunctionName],
    ["Timing", data.summary.timing],
    ["Notes", data.summary.notes],
  ];
  for (const [label, value] of entries) {
    const item = element("div", "fixed-summary__item");
    item.append(
      element("dt", "", label),
      element("dd", value ? "" : "fixed-summary__empty", value || "（空）"),
    );
    grid.append(item);
  }
  return grid;
}

export function renderSummaryEditor(
  type: DocumentType,
  data: DocumentData,
  container: HTMLElement,
  state: UiState,
  actions: UiActions,
): void {
  const summary = element("div", "subsection fixed-summary");
  const heading = element("div", "subsection__heading");
  const title = element("div");
  title.append(
    element("h3", "", "シートサマリー"),
    element("p", "helper-text", "Excelシートの役割を表す初期値です。必要な場合だけ編集できます。"),
  );
  heading.append(title);

  if (state.editingSummary !== type) {
    heading.append(button("編集", "button button--small button--secondary", () => {
      state.editingSummary = type;
      actions.render();
    }));
    summary.append(heading, renderSummaryValues(data));
    container.append(summary);
    return;
  }

  const controls = element("div", "button-row button-row--compact");
  controls.append(
    button("初期値に戻す", "button button--small button--ghost", () => {
      data.summary = getDocumentSummary(type);
      actions.changed();
      actions.render();
    }),
    button("編集完了", "button button--small button--secondary", () => {
      state.editingSummary = null;
      actions.render();
    }),
  );
  heading.append(controls);
  const grid = element("div", "form-grid form-grid--summary");
  grid.append(
    field("Title", data.summary.sheetTitle, (value) => { data.summary.sheetTitle = value; }, actions.changed, { compact: true }),
    field("Screen / component name", data.summary.screenComponentName, (value) => { data.summary.screenComponentName = value; }, actions.changed, { compact: true }),
    field("Event / check / function name", data.summary.eventCheckFunctionName, (value) => { data.summary.eventCheckFunctionName = value; }, actions.changed, { compact: true }),
    field("Timing", data.summary.timing, (value) => { data.summary.timing = value; }, actions.changed, { compact: true }),
  );
  summary.append(
    heading,
    grid,
    field("Notes", data.summary.notes, (value) => { data.summary.notes = value; }, actions.changed, { rows: 3, compact: true }),
  );
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

function renderPresetPicker(
  presets: readonly EditorPreset[],
  onAdd: (values: Record<string, string>) => void,
): HTMLElement | null {
  if (presets.length === 0) return null;
  const wrapper = element("div", "preset-picker");
  const select = element("select") as HTMLSelectElement;
  const placeholder = element("option") as HTMLOptionElement;
  placeholder.value = "";
  placeholder.textContent = "登録済みから選択";
  select.append(placeholder);
  presets.forEach((preset, index) => {
    const option = element("option") as HTMLOptionElement;
    option.value = String(index);
    option.textContent = preset.label;
    select.append(option);
  });
  const addButton = button("追加", "button button--small button--secondary", () => {
    if (!select.value) return;
    const preset = presets[Number(select.value)];
    if (preset) onAdd({ ...preset.values });
    select.value = "";
  });
  wrapper.append(select, addButton);
  return wrapper;
}

export function renderTableEditor(
  container: HTMLElement,
  title: string,
  data: DocumentData,
  tableKey: string,
  columns: readonly ColumnDefinition[],
  actions: UiActions,
  options: {
    includeNumber?: boolean;
    initialValues?: Record<string, string>;
    presets?: readonly EditorPreset[];
  } = {},
): void {
  if (columns.length === 0) return;
  const subsection = element("div", "subsection");
  const heading = element("div", "subsection__heading");
  const rows = ensureTable(data, tableKey);
  const controls = element("div", "subsection__controls");
  const presetPicker = renderPresetPicker(options.presets ?? [], (values) => {
    rows.push({ ...blankRecord(columns), ...values });
    refresh(actions);
  });
  if (presetPicker) controls.append(presetPicker);
  controls.append(button("行を追加", "button button--small button--secondary", () => {
    rows.push({ ...blankRecord(columns), ...options.initialValues });
    refresh(actions);
  }));
  heading.append(element("h3", "", title), controls);
  subsection.append(heading);
  if (rows.length === 0) subsection.append(element("p", "empty-state", "行はまだありません。必要な場合だけ追加してください。"));

  rows.forEach((row, index) => {
    const card = element("div", "row-card");
    const header = element("div", "row-card__header");
    header.append(element("strong", "", options.includeNumber ? `No. ${index + 1}` : `行 ${index + 1}`));
    const controlsArea = element("div", "row-actions");
    controlsArea.append(
      button("↑", "icon-button", () => { moveItem(rows, index, -1); refresh(actions); }),
      button("↓", "icon-button", () => { moveItem(rows, index, 1); refresh(actions); }),
      button("複製", "icon-button icon-button--text", () => { rows.splice(index + 1, 0, { ...row }); refresh(actions); }),
      button("削除", "icon-button icon-button--danger icon-button--text", () => { rows.splice(index, 1); refresh(actions); }),
    );
    header.append(controlsArea);
    card.append(header);
    const grid = element("div", "row-card__grid");
    for (const column of columns) {
      grid.append(field(column.label, row[column.key] ?? "", (value) => { row[column.key] = value; }, actions.changed, {
        rows: column.textarea ? 3 : undefined,
        placeholder: column.placeholder,
        compact: true,
        suggestions: column.suggestions,
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
  options: { presets?: readonly EditorPreset[] } = {},
): void {
  if (fields.length === 0) return;
  const subsection = element("div", "subsection");
  const heading = element("div", "subsection__heading");
  const groups = ensureGroups(data, groupKey);
  const controls = element("div", "subsection__controls");
  const presetPicker = renderPresetPicker(options.presets ?? [], (values) => {
    groups.push({ ...blankRecord(fields), ...values });
    refresh(actions);
  });
  if (presetPicker) controls.append(presetPicker);
  controls.append(button(`${itemLabel}を追加`, "button button--small button--secondary", () => {
    groups.push(blankRecord(fields));
    refresh(actions);
  }));
  heading.append(element("h3", "", title), controls);
  subsection.append(heading);
  if (groups.length === 0) subsection.append(element("p", "empty-state", `${itemLabel}はまだありません。`));

  groups.forEach((item, index) => {
    const card = element("div", "group-card");
    const header = element("div", "row-card__header");
    header.append(element("strong", "", `${itemLabel} ${index + 1}`));
    const controlsArea = element("div", "row-actions");
    controlsArea.append(
      button("↑", "icon-button", () => { moveItem(groups, index, -1); refresh(actions); }),
      button("↓", "icon-button", () => { moveItem(groups, index, 1); refresh(actions); }),
      button("複製", "icon-button icon-button--text", () => { groups.splice(index + 1, 0, { ...item }); refresh(actions); }),
      button("削除", "icon-button icon-button--danger icon-button--text", () => { groups.splice(index, 1); refresh(actions); }),
    );
    header.append(controlsArea);
    card.append(header);
    const grid = element("div", "group-card__grid");
    for (const definition of fields) {
      grid.append(field(definition.label, item[definition.key] ?? "", (value) => { item[definition.key] = value; }, actions.changed, {
        rows: definition.textarea ? 4 : undefined,
        placeholder: definition.placeholder,
        compact: true,
        suggestions: definition.suggestions,
      }));
    }
    card.append(grid);
    subsection.append(card);
  });
  container.append(subsection);
}
