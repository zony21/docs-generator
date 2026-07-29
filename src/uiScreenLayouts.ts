import { createLayoutImages, revokeImagePreview } from "./imageAssets";
import {
  createScreenLayoutSection,
  defaultScreenLayoutName,
  type LayoutImage,
  type ScreenLayoutSection,
  type TableRow,
} from "./model";
import type { UiActions, UiState } from "./uiContext";
import { configuredColumns, inputFieldLabel, isInputFieldEnabled } from "./uiFieldSettings";
import { button, element, field, moveItem, type ColumnDefinition } from "./uiPrimitives";

const SCREEN_ITEM_COLUMNS: readonly ColumnDefinition[] = [
  { key: "itemName", label: "項目名称" },
  { key: "type", label: "タイプ" },
  { key: "io", label: "I/O" },
  { key: "length", label: "桁数" },
  { key: "required", label: "必須" },
  { key: "screenMode1", label: "画面モード1" },
  { key: "screenMode2", label: "画面モード2" },
  { key: "screenMode3", label: "画面モード3" },
  { key: "separator", label: "-" },
  { key: "notes", label: "備考", textarea: true },
  { key: "focusMessage", label: "フォーカス時メッセージ", textarea: true },
];

function refresh(actions: UiActions): void {
  actions.render();
  actions.changed();
}

function updateOrders(screens: ScreenLayoutSection[]): void {
  screens.forEach((screen, index) => {
    screen.order = index + 1;
    if (screen.image) screen.image.order = index + 1;
  });
}

function activeColumns(state: UiState): ColumnDefinition[] {
  return configuredColumns(state.design, "S-Layout", "screenItems", SCREEN_ITEM_COLUMNS);
}

function blankRow(columns: readonly ColumnDefinition[]): TableRow {
  return Object.fromEntries(columns.map((column) => [column.key, ""]));
}

function allScreenImages(state: UiState, excludingScreenId?: string): LayoutImage[] {
  return state.design.documents["S-Layout"].screens.flatMap((screen) =>
    screen.id !== excludingScreenId && screen.image ? [screen.image] : [],
  );
}

function renderRows(
  container: HTMLElement,
  title: string,
  rows: TableRow[],
  columns: readonly ColumnDefinition[],
  actions: UiActions,
): void {
  if (columns.length === 0) return;
  const subsection = element("div", "screen-layout-table");
  const heading = element("div", "subsection__heading");
  heading.append(
    element("h4", "", title),
    button("行を追加", "button button--small button--secondary", () => {
      rows.push(blankRow(columns));
      refresh(actions);
    }),
  );
  subsection.append(heading);
  if (rows.length === 0) {
    subsection.append(element("p", "empty-state", "行はまだありません。必要な行を追加してください。"));
  }

  rows.forEach((row, index) => {
    const card = element("div", "row-card screen-layout-row");
    const header = element("div", "row-card__header");
    header.append(element("strong", "", `No. ${index + 1}`));
    const controls = element("div", "row-actions");
    controls.append(
      button("↑", "icon-button", () => { moveItem(rows, index, -1); refresh(actions); }),
      button("↓", "icon-button", () => { moveItem(rows, index, 1); refresh(actions); }),
      button("複製", "icon-button icon-button--text", () => {
        rows.splice(index + 1, 0, { ...row });
        refresh(actions);
      }),
      button("削除", "icon-button icon-button--danger icon-button--text", () => {
        rows.splice(index, 1);
        refresh(actions);
      }),
    );
    header.append(controls);
    card.append(header);
    const grid = element("div", "screen-layout-row__grid");
    for (const column of columns) {
      grid.append(field(
        column.label,
        row[column.key] ?? "",
        (value) => { row[column.key] = value; },
        actions.changed,
        {
          rows: column.textarea ? 3 : undefined,
          compact: true,
          placeholder: column.placeholder,
          suggestions: column.suggestions,
        },
      ));
    }
    card.append(grid);
    subsection.append(card);
  });
  container.append(subsection);
}

function renderScreenImage(
  container: HTMLElement,
  screen: ScreenLayoutSection,
  state: UiState,
  actions: UiActions,
): void {
  if (!isInputFieldEnabled(state.design, "S-Layout", "screens.image")) return;
  const subsection = element("div", "screen-layout-image");
  const heading = element("div", "subsection__heading");
  heading.append(element("h4", "", inputFieldLabel(state.design, "S-Layout", "screens.image", "画面画像")));
  const label = element(
    "label",
    "button button--small button--secondary file-button",
    screen.image ? "画像を変更" : "画像を選択",
  );
  const input = element("input") as HTMLInputElement;
  input.type = "file";
  input.accept = ".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp";
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (!file) return;
    const result = createLayoutImages([file], allScreenImages(state, screen.id));
    actions.setMessages(result.errors);
    const image = result.images[0];
    if (!image) return;
    if (screen.image) revokeImagePreview(screen.image);
    image.order = screen.order;
    image.title = screen.name || defaultScreenLayoutName(screen.order - 1);
    image.alt = image.title;
    screen.image = image;
    refresh(actions);
  });
  label.append(input);
  heading.append(label);
  subsection.append(
    heading,
    element("p", "helper-text", "PNG・JPEG・WebP、1枚10MB以下。画面ごとに1枚登録できます。"),
  );

  if (!screen.image) {
    subsection.append(element("p", "empty-state", "画像はまだ選択されていません。"));
    container.append(subsection);
    return;
  }

  const card = element("div", "image-card screen-layout-image__card");
  const preview = element("div", "image-card__preview");
  if (screen.image.previewUrl) {
    const image = element("img") as HTMLImageElement;
    image.src = screen.image.previewUrl;
    image.alt = screen.name || screen.image.alt;
    preview.append(image);
  } else {
    preview.append(element("span", "", "画像の再選択が必要です"));
  }
  const content = element("div", "image-card__content");
  const header = element("div", "row-card__header");
  header.append(
    element("strong", "", screen.image.outputFileName),
    button("削除", "icon-button icon-button--danger icon-button--text", () => {
      if (screen.image) revokeImagePreview(screen.image);
      screen.image = undefined;
      refresh(actions);
    }),
  );
  content.append(header, element("p", "helper-text", `Markdown: ./S-Layout/${screen.image.outputFileName}`));
  card.append(preview, content);
  subsection.append(card);
  container.append(subsection);
}

function renderScreenCard(
  screen: ScreenLayoutSection,
  index: number,
  state: UiState,
  actions: UiActions,
): HTMLElement {
  const card = element("section", "screen-layout-card");
  const heading = element("div", "screen-layout-card__heading");
  const title = element("div");
  title.append(
    element("p", "screen-layout-card__eyebrow", `画面 ${index + 1}`),
    element("h3", "", screen.name || defaultScreenLayoutName(index)),
  );
  const controls = element("div", "row-actions");
  controls.append(
    button("↑", "icon-button", () => {
      moveItem(state.design.documents["S-Layout"].screens, index, -1);
      updateOrders(state.design.documents["S-Layout"].screens);
      refresh(actions);
    }),
    button("↓", "icon-button", () => {
      moveItem(state.design.documents["S-Layout"].screens, index, 1);
      updateOrders(state.design.documents["S-Layout"].screens);
      refresh(actions);
    }),
    button("削除", "icon-button icon-button--danger icon-button--text", () => {
      if (!window.confirm(`「${screen.name || defaultScreenLayoutName(index)}」を削除しますか？`)) return;
      if (screen.image) revokeImagePreview(screen.image);
      const screens = state.design.documents["S-Layout"].screens;
      screens.splice(index, 1);
      if (screens.length === 0) screens.push(createScreenLayoutSection());
      updateOrders(screens);
      refresh(actions);
    }),
  );
  heading.append(title, controls);
  card.append(heading);

  if (isInputFieldEnabled(state.design, "S-Layout", "screens.name")) {
    card.append(field(
      inputFieldLabel(state.design, "S-Layout", "screens.name", "画面名"),
      screen.name,
      (value) => {
        const previous = screen.name;
        screen.name = value;
        if (screen.image && (!screen.image.alt || screen.image.alt === previous)) screen.image.alt = value;
        if (screen.image && (!screen.image.title || screen.image.title === previous)) screen.image.title = value;
      },
      actions.changed,
      { compact: true, placeholder: defaultScreenLayoutName(index) },
    ));
  }

  renderScreenImage(card, screen, state, actions);

  if (isInputFieldEnabled(state.design, "S-Layout", "screens.notes")) {
    card.append(field(
      inputFieldLabel(state.design, "S-Layout", "screens.notes", "備考"),
      screen.notes,
      (value) => { screen.notes = value; },
      actions.changed,
      { rows: 4, compact: true },
    ));
  }

  const columns = activeColumns(state);
  renderRows(card, "画面項目", screen.items, columns, actions);
  if (isInputFieldEnabled(state.design, "S-Layout", "screens.footer")) {
    renderRows(
      card,
      inputFieldLabel(state.design, "S-Layout", "screens.footer", "フッター"),
      screen.footerItems,
      columns,
      actions,
    );
  }
  return card;
}

export function renderScreenLayoutEditor(
  container: HTMLElement,
  state: UiState,
  actions: UiActions,
): void {
  const data = state.design.documents["S-Layout"];
  if (data.screens.length === 0) data.screens.push(createScreenLayoutSection());
  updateOrders(data.screens);

  const subsection = element("div", "subsection screen-layout-editor");
  const heading = element("div", "subsection__heading");
  const title = element("div");
  title.append(
    element("h3", "", "画面構成"),
    element("p", "helper-text", "1機能に複数画面を登録できます。各画面に画像、備考、画面項目、フッター項目を設定します。"),
  );
  heading.append(
    title,
    button("画面を追加", "button button--small button--secondary", () => {
      data.screens.push(createScreenLayoutSection(data.screens.length));
      updateOrders(data.screens);
      refresh(actions);
    }),
  );
  subsection.append(heading);
  data.screens.forEach((screen, index) => subsection.append(renderScreenCard(screen, index, state, actions)));
  container.append(subsection);
}
