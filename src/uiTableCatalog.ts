import { createId, type DesignPackage, type TableCatalogItem } from "./model";
import type { UiActions, UiState } from "./uiContext";
import { button, element, field, sectionHeader, type SuggestionOption } from "./uiPrimitives";

const CATEGORY_SUGGESTIONS: readonly SuggestionOption[] = [
  { value: "Table", label: "テーブル" },
  { value: "Master", label: "マスタ" },
  { value: "View", label: "ビュー" },
  { value: "Interface", label: "インターフェース" },
  { value: "DTO", label: "DTO" },
  { value: "Other", label: "その他" },
];

export function tableCatalogSuggestions(design: DesignPackage): SuggestionOption[] {
  const suggestions: SuggestionOption[] = [];
  for (const item of design.tableCatalog) {
    if (item.physicalName.trim()) {
      suggestions.push({
        value: item.physicalName,
        label: [item.category, item.logicalName].filter(Boolean).join(" / "),
      });
    }
    if (item.logicalName.trim()) {
      suggestions.push({
        value: item.logicalName,
        label: [item.category, item.physicalName].filter(Boolean).join(" / "),
      });
    }
  }
  return suggestions;
}

export function catalogItemToResourceRow(item: TableCatalogItem): Record<string, string> {
  return {
    type: item.category,
    name: item.physicalName || item.logicalName,
    notes: [item.logicalName, item.description].filter(Boolean).join(" / "),
  };
}

export function catalogItemToRelation(item: TableCatalogItem): Record<string, string> {
  return {
    sourceName: item.physicalName || item.logicalName,
    sourceCondition: "",
    destinationName: "",
    destinationCondition: "",
    sql: "",
    notes: [item.logicalName, item.description].filter(Boolean).join(" / "),
  };
}

function addCatalogItem(state: UiState, actions: UiActions): void {
  state.design.tableCatalog.push({
    id: createId(),
    category: "Table",
    physicalName: "",
    logicalName: "",
    description: "",
  });
  actions.changed();
  actions.render();
}

export function renderTableCatalogSection(state: UiState, actions: UiActions): HTMLElement {
  const section = element("section", "panel table-catalog-panel");
  section.append(sectionHeader("2", "テーブル・関連資源設定", "よく使うテーブル、マスタ、インターフェースなどを事前登録し、設計書入力時に選択できます。"));
  const toolbar = element("div", "subsection__heading");
  toolbar.append(
    element("p", "helper-text", "物理名または論理名を候補として利用できます。登録内容はLocal Storageへ保存されます。"),
    button("登録を追加", "button button--secondary", () => addCatalogItem(state, actions)),
  );
  section.append(toolbar);

  if (state.design.tableCatalog.length === 0) {
    section.append(element("p", "empty-state empty-state--large", "登録済みのテーブル・関連資源はありません。"));
    return section;
  }

  const list = element("div", "catalog-list");
  state.design.tableCatalog.forEach((item, index) => {
    const card = element("article", "catalog-card");
    const header = element("div", "row-card__header");
    header.append(element("strong", "", `${index + 1}. ${item.physicalName || item.logicalName || "名称未入力"}`));
    const actionsArea = element("div", "row-actions");
    actionsArea.append(
      button("複製", "icon-button icon-button--text", () => {
        state.design.tableCatalog.splice(index + 1, 0, { ...item, id: createId() });
        actions.changed();
        actions.render();
      }),
      button("削除", "icon-button icon-button--danger icon-button--text", () => {
        state.design.tableCatalog.splice(index, 1);
        actions.changed();
        actions.render();
      }),
    );
    header.append(actionsArea);
    const grid = element("div", "form-grid");
    grid.append(
      field("種別", item.category, (value) => { item.category = value; }, actions.changed, { compact: true, suggestions: CATEGORY_SUGGESTIONS }),
      field("物理名", item.physicalName, (value) => { item.physicalName = value; }, actions.changed, { compact: true, placeholder: "例: T_CONTRACT" }),
      field("論理名", item.logicalName, (value) => { item.logicalName = value; }, actions.changed, { compact: true, placeholder: "例: 契約" }),
    );
    card.append(
      header,
      grid,
      field("説明", item.description, (value) => { item.description = value; }, actions.changed, { compact: true, rows: 3 }),
    );
    list.append(card);
  });
  section.append(list);
  return section;
}
