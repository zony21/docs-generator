import type { DocumentData, DocumentType } from "./model";
import type { UiActions, UiState } from "./uiContext";
import { renderGroupEditor, renderTableEditor, renderTextEditor, type EditorPreset } from "./uiEditors";
import { configuredColumns, inputFieldLabel, isInputFieldEnabled } from "./uiFieldSettings";
import { catalogItemToRelation, catalogItemToResourceRow, tableCatalogSuggestions } from "./uiTableCatalog";
import type { ColumnDefinition } from "./uiPrimitives";

function renderOptionalText(
  type: DocumentType,
  container: HTMLElement,
  data: DocumentData,
  state: UiState,
  actions: UiActions,
  key: string,
  defaultLabel: string,
  rows = 4,
  placeholder = "",
): void {
  if (!isInputFieldEnabled(state.design, type, key)) return;
  renderTextEditor(
    container,
    data,
    key,
    inputFieldLabel(state.design, type, key, defaultLabel),
    actions,
    rows,
    placeholder,
  );
}

function columns(
  type: DocumentType,
  state: UiState,
  scope: string,
  definitions: readonly ColumnDefinition[],
): ColumnDefinition[] {
  return configuredColumns(state.design, type, scope, definitions);
}

export function renderBasicEditor(
  type: DocumentType,
  container: HTMLElement,
  data: DocumentData,
  state: UiState,
  actions: UiActions,
): boolean {
  const catalogSuggestions = tableCatalogSuggestions(state.design);
  const resourcePresets: EditorPreset[] = state.design.tableCatalog.map((item) => ({
    label: [item.physicalName || item.logicalName, item.logicalName].filter(Boolean).join(" / "),
    values: catalogItemToResourceRow(item),
  }));
  const relationPresets: EditorPreset[] = state.design.tableCatalog.map((item) => ({
    label: [item.physicalName || item.logicalName, item.logicalName].filter(Boolean).join(" / "),
    values: catalogItemToRelation(item),
  }));

  switch (type) {
    case "Hist":
      renderTableEditor(container, "改訂履歴", data, "history", columns(type, state, "history", [
        { key: "date", label: "作成・更新日" },
        { key: "author", label: "作成者" },
        { key: "revision", label: "Rev" },
        { key: "target", label: "対象設計書・領域" },
        { key: "change", label: "変更内容", textarea: true },
        { key: "approvalDate", label: "承認日" },
        { key: "approvedBy", label: "承認者" },
      ]), actions, {
        initialValues: {
          date: state.design.common.date,
          author: state.design.common.author,
          revision: state.design.common.revision,
        },
      });
      renderOptionalText(type, container, data, state, actions, "additionalNotes", "追加注記", 4);
      return true;
    case "Outline_A":
      renderOptionalText(type, container, data, state, actions, "purpose", "目的", 4);
      renderOptionalText(type, container, data, state, actions, "scopeTarget", "対象範囲・対象ユーザー・対象処理", 4);
      renderOptionalText(type, container, data, state, actions, "operationFlow", "概要フロー（1行1ステップ）", 6, "例:\n検索条件を入力する\n検索ボタンを押す\n結果を一覧表示する");
      renderOptionalText(type, container, data, state, actions, "preconditions", "前提条件", 3);
      renderOptionalText(type, container, data, state, actions, "postconditions", "後続条件", 3);
      return true;
    case "Outline_B":
      renderOptionalText(type, container, data, state, actions, "processingStyle", "処理方式・分類", 3);
      renderTableEditor(container, "CRUD・操作区分", data, "crud", columns(type, state, "crud", [
        { key: "category", label: "区分" },
        { key: "description", label: "説明", textarea: true },
      ]), actions);
      renderTableEditor(container, "関連テーブル・マスタ・インターフェース", data, "resources", columns(type, state, "resources", [
        { key: "type", label: "種別" },
        { key: "name", label: "名称", suggestions: catalogSuggestions },
        { key: "notes", label: "備考", textarea: true },
      ]), actions, { presets: resourcePresets });
      renderOptionalText(type, container, data, state, actions, "constraintsRemarks", "制約・備考", 4);
      return true;
    case "FuncSpec":
      renderOptionalText(type, container, data, state, actions, "functionUnit", "画面・機能単位", 3);
      renderOptionalText(type, container, data, state, actions, "triggerTiming", "トリガー・タイミング", 3);
      renderGroupEditor(container, "アクション詳細", data, "actions", columns(type, state, "actions", [
        { key: "title", label: "アクション名" },
        { key: "intent", label: "目的", textarea: true },
        { key: "majorSteps", label: "主な手順（1行1ステップ）", textarea: true },
        { key: "successPath", label: "正常時の動作", textarea: true },
        { key: "errorPath", label: "エラー・中断時の動作", textarea: true },
      ]), "アクション", actions);
      return true;
    case "FuncDetail":
      renderGroupEditor(container, "処理単位", data, "units", columns(type, state, "units", [
        { key: "processingName", label: "処理名" },
        { key: "methodName", label: "関数・メソッド名" },
        { key: "functionType", label: "関数種別" },
        { key: "summary", label: "概要", textarea: true },
        { key: "normalFlow", label: "通常処理（try）", textarea: true },
        { key: "exceptionFlow", label: "例外処理（catch）", textarea: true },
        { key: "finallyFlow", label: "終了処理（finally）", textarea: true },
        { key: "relatedDocuments", label: "関連設計書" },
      ]), "処理", actions);
      return true;
    case "Relation":
      renderGroupEditor(container, "データ関係", data, "relations", columns(type, state, "relations", [
        { key: "sourceName", label: "Transfer Source", suggestions: catalogSuggestions },
        { key: "sourceCondition", label: "転送元条件", textarea: true },
        { key: "destinationName", label: "Transfer Destination", suggestions: catalogSuggestions },
        { key: "destinationCondition", label: "転送先条件", textarea: true },
        { key: "sql", label: "SQL", textarea: true, placeholder: "SELECT ..." },
        { key: "notes", label: "備考", textarea: true },
      ]), "関係", actions, { presets: relationPresets });
      return true;
    default:
      return false;
  }
}
