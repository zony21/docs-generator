import type { DocumentData, DocumentType } from "./model";
import type { UiActions, UiState } from "./uiContext";
import { renderGroupEditor, renderTableEditor, renderTextEditor } from "./uiEditors";

export function renderBasicEditor(
  type: DocumentType,
  container: HTMLElement,
  data: DocumentData,
  state: UiState,
  actions: UiActions,
): boolean {
  switch (type) {
    case "Hist":
      renderTableEditor(container, "改訂履歴", data, "history", [
        { key: "date", label: "作成・更新日" },
        { key: "author", label: "作成者" },
        { key: "revision", label: "Rev" },
        { key: "target", label: "対象設計書・領域" },
        { key: "change", label: "変更内容", textarea: true },
        { key: "approvalDate", label: "承認日" },
        { key: "approvedBy", label: "承認者" },
      ], actions, {
        initialValues: {
          date: state.design.common.date,
          author: state.design.common.author,
          revision: state.design.common.revision,
        },
      });
      renderTextEditor(container, data, "additionalNotes", "追加注記", actions, 4);
      return true;
    case "Outline_A":
      renderTextEditor(container, data, "purpose", "目的", actions, 4);
      renderTextEditor(container, data, "scopeTarget", "対象範囲・対象ユーザー・対象処理", actions, 4);
      renderTextEditor(container, data, "operationFlow", "概要フロー（1行1ステップ）", actions, 6, "例:\n検索条件を入力する\n検索ボタンを押す\n結果を一覧表示する");
      renderTextEditor(container, data, "preconditions", "前提条件", actions, 3);
      renderTextEditor(container, data, "postconditions", "後続条件", actions, 3);
      return true;
    case "Outline_B":
      renderTextEditor(container, data, "processingStyle", "処理方式・分類", actions, 3);
      renderTableEditor(container, "CRUD・操作区分", data, "crud", [
        { key: "category", label: "区分" },
        { key: "description", label: "説明", textarea: true },
      ], actions);
      renderTableEditor(container, "関連テーブル・マスタ・インターフェース", data, "resources", [
        { key: "type", label: "種別" },
        { key: "name", label: "名称" },
        { key: "notes", label: "備考", textarea: true },
      ], actions);
      renderTextEditor(container, data, "constraintsRemarks", "制約・備考", actions, 4);
      return true;
    case "FuncSpec":
      renderTextEditor(container, data, "functionUnit", "画面・機能単位", actions, 3);
      renderTextEditor(container, data, "triggerTiming", "トリガー・タイミング", actions, 3);
      renderGroupEditor(container, "アクション詳細", data, "actions", [
        { key: "title", label: "アクション名" },
        { key: "intent", label: "目的", textarea: true },
        { key: "majorSteps", label: "主な手順（1行1ステップ）", textarea: true },
        { key: "successPath", label: "正常時の動作", textarea: true },
        { key: "errorPath", label: "エラー・中断時の動作", textarea: true },
      ], "アクション", actions);
      return true;
    case "FuncDetail":
      renderGroupEditor(container, "処理単位", data, "units", [
        { key: "processingName", label: "処理名" },
        { key: "methodName", label: "関数・メソッド名" },
        { key: "functionType", label: "関数種別" },
        { key: "summary", label: "概要", textarea: true },
        { key: "normalFlow", label: "通常処理（try）", textarea: true },
        { key: "exceptionFlow", label: "例外処理（catch）", textarea: true },
        { key: "finallyFlow", label: "終了処理（finally）", textarea: true },
        { key: "relatedDocuments", label: "関連設計書" },
      ], "処理", actions);
      return true;
    case "Relation":
      renderGroupEditor(container, "データ関係", data, "relations", [
        { key: "sourceName", label: "Transfer Source" },
        { key: "sourceCondition", label: "転送元条件", textarea: true },
        { key: "destinationName", label: "Transfer Destination" },
        { key: "destinationCondition", label: "転送先条件", textarea: true },
        { key: "sql", label: "SQL", textarea: true, placeholder: "SELECT ..." },
        { key: "notes", label: "備考", textarea: true },
      ], "関係", actions);
      return true;
    default:
      return false;
  }
}
