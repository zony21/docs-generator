import type { DocumentData, DocumentType } from "./model";
import type { UiActions, UiState } from "./uiContext";
import { renderTableEditor, renderTextEditor } from "./uiEditors";
import { configuredColumns, inputFieldLabel, isInputFieldEnabled } from "./uiFieldSettings";
import { renderImageEditor } from "./uiImages";
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
): void {
  if (!isInputFieldEnabled(state.design, type, key)) return;
  renderTextEditor(
    container,
    data,
    key,
    inputFieldLabel(state.design, type, key, defaultLabel),
    actions,
    rows,
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

export function renderAdditionalEditor(
  type: DocumentType,
  container: HTMLElement,
  data: DocumentData,
  state: UiState,
  actions: UiActions,
): void {
  switch (type) {
    case "S-Layout":
      renderTableEditor(container, "画面領域", data, "areas", columns(type, state, "areas", [
        { key: "area", label: "領域" },
        { key: "description", label: "説明", textarea: true },
      ]), actions);
      renderTableEditor(container, "コントロール一覧", data, "controls", columns(type, state, "controls", [
        { key: "controlId", label: "コントロールID" },
        { key: "controlName", label: "コントロール名" },
        { key: "type", label: "種類" },
        { key: "area", label: "領域" },
      ]), actions);
      renderTableEditor(container, "コントロール属性", data, "properties", columns(type, state, "properties", [
        { key: "controlId", label: "コントロールID" },
        { key: "lengthFormat", label: "桁数・形式" },
        { key: "required", label: "必須" },
        { key: "defaultValue", label: "初期値" },
        { key: "remarks", label: "備考", textarea: true },
      ]), actions);
      renderOptionalText(type, container, data, state, actions, "displayEditRules", "表示・編集ルール", 5);
      if (isInputFieldEnabled(state.design, type, "images")) renderImageEditor("S-Layout", container, state, actions);
      break;
    case "R-Layout":
      renderTableEditor(container, "レイアウトブロック", data, "blocks", columns(type, state, "blocks", [
        { key: "block", label: "ブロック・領域" },
        { key: "description", label: "説明", textarea: true },
      ]), actions);
      renderTableEditor(container, "出力項目", data, "items", columns(type, state, "items", [
        { key: "item", label: "項目" },
        { key: "description", label: "説明", textarea: true },
      ]), actions);
      renderTableEditor(container, "列定義", data, "columns", columns(type, state, "columns", [
        { key: "item", label: "項目" },
        { key: "type", label: "型" },
        { key: "width", label: "幅" },
        { key: "alignment", label: "寄せ" },
        { key: "format", label: "形式" },
        { key: "notes", label: "備考", textarea: true },
      ]), actions);
      renderOptionalText(type, container, data, state, actions, "outputBehaviorNotes", "出力時の注意事項", 5);
      if (isInputFieldEnabled(state.design, type, "images")) renderImageEditor("R-Layout", container, state, actions);
      break;
    case "Event":
      renderTableEditor(container, "イベント一覧", data, "events", columns(type, state, "events", [
        { key: "eventName", label: "イベント名" },
        { key: "trigger", label: "トリガー" },
        { key: "target", label: "対象機能・処理" },
        { key: "remarks", label: "備考", textarea: true },
      ]), actions);
      renderOptionalText(type, container, data, state, actions, "eventNotes", "イベント補足", 4);
      break;
    case "Check":
      renderOptionalText(type, container, data, state, actions, "screenName", "画面名", 2);
      renderOptionalText(type, container, data, state, actions, "checkName", "チェック名", 2);
      renderOptionalText(type, container, data, state, actions, "checkTimingTrigger", "タイミング・トリガー", 2);
      renderTableEditor(container, "チェック一覧", data, "checks", columns(type, state, "checks", [
        { key: "checkItem", label: "チェック項目" },
        { key: "type", label: "種別" },
        { key: "detail", label: "詳細", textarea: true },
        { key: "messageId", label: "メッセージID" },
        { key: "messageArguments", label: "メッセージ引数" },
      ]), actions, { includeNumber: true });
      break;
    case "Others":
      renderTableEditor(container, "共通定数・定義", data, "constants", columns(type, state, "constants", [
        { key: "name", label: "名称" },
        { key: "value", label: "値" },
        { key: "notes", label: "備考", textarea: true },
      ]), actions);
      renderTableEditor(container, "選択肢・ファンクションキー・補助マッピング", data, "mappings", columns(type, state, "mappings", [
        { key: "category", label: "区分" },
        { key: "mapping", label: "マッピング" },
        { key: "notes", label: "備考", textarea: true },
      ]), actions);
      renderOptionalText(type, container, data, state, actions, "operationalNotes", "運用注記", 4);
      break;
    case "Footnote":
      renderTableEditor(container, "用語・注釈", data, "terms", columns(type, state, "terms", [
        { key: "term", label: "用語" },
        { key: "description", label: "説明", textarea: true },
      ]), actions);
      renderTableEditor(container, "略称・コード", data, "abbreviations", columns(type, state, "abbreviations", [
        { key: "code", label: "略称・コード" },
        { key: "definition", label: "定義", textarea: true },
      ]), actions);
      renderOptionalText(type, container, data, state, actions, "supplementalNotes", "補足注記", 4);
      break;
    default:
      break;
  }
}
