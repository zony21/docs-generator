import type { DesignPackage, DocumentType, InputFieldPreference } from "./model";

export interface InputFieldDefinition {
  key: string;
  defaultLabel: string;
}

export const INPUT_FIELD_DEFINITIONS: Readonly<Record<DocumentType, readonly InputFieldDefinition[]>> = {
  Hist: [
    { key: "history.date", defaultLabel: "作成・更新日" },
    { key: "history.author", defaultLabel: "作成者" },
    { key: "history.revision", defaultLabel: "Rev" },
    { key: "history.target", defaultLabel: "対象設計書・領域" },
    { key: "history.change", defaultLabel: "変更内容" },
    { key: "history.approvalDate", defaultLabel: "承認日" },
    { key: "history.approvedBy", defaultLabel: "承認者" },
    { key: "additionalNotes", defaultLabel: "追加注記" },
  ],
  Outline_A: [
    { key: "purpose", defaultLabel: "目的" },
    { key: "scopeTarget", defaultLabel: "対象範囲・対象ユーザー・対象処理" },
    { key: "operationFlow", defaultLabel: "概要フロー（1行1ステップ）" },
    { key: "preconditions", defaultLabel: "前提条件" },
    { key: "postconditions", defaultLabel: "後続条件" },
  ],
  Outline_B: [
    { key: "processingStyle", defaultLabel: "処理方式・分類" },
    { key: "crud.category", defaultLabel: "区分" },
    { key: "crud.description", defaultLabel: "説明" },
    { key: "resources.type", defaultLabel: "種別" },
    { key: "resources.name", defaultLabel: "名称" },
    { key: "resources.notes", defaultLabel: "備考" },
    { key: "constraintsRemarks", defaultLabel: "制約・備考" },
  ],
  "S-Layout": [
    { key: "areas.area", defaultLabel: "領域" },
    { key: "areas.description", defaultLabel: "説明" },
    { key: "controls.controlId", defaultLabel: "コントロールID" },
    { key: "controls.controlName", defaultLabel: "コントロール名" },
    { key: "controls.type", defaultLabel: "種類" },
    { key: "controls.area", defaultLabel: "領域" },
    { key: "properties.controlId", defaultLabel: "コントロールID" },
    { key: "properties.lengthFormat", defaultLabel: "桁数・形式" },
    { key: "properties.required", defaultLabel: "必須" },
    { key: "properties.defaultValue", defaultLabel: "初期値" },
    { key: "properties.remarks", defaultLabel: "備考" },
    { key: "displayEditRules", defaultLabel: "表示・編集ルール" },
    { key: "images", defaultLabel: "レイアウト画像" },
  ],
  "R-Layout": [
    { key: "blocks.block", defaultLabel: "ブロック・領域" },
    { key: "blocks.description", defaultLabel: "説明" },
    { key: "items.item", defaultLabel: "項目" },
    { key: "items.description", defaultLabel: "説明" },
    { key: "columns.item", defaultLabel: "項目" },
    { key: "columns.type", defaultLabel: "型" },
    { key: "columns.width", defaultLabel: "幅" },
    { key: "columns.alignment", defaultLabel: "寄せ" },
    { key: "columns.format", defaultLabel: "形式" },
    { key: "columns.notes", defaultLabel: "備考" },
    { key: "outputBehaviorNotes", defaultLabel: "出力時の注意事項" },
    { key: "images", defaultLabel: "レイアウト画像" },
  ],
  FuncSpec: [
    { key: "functionUnit", defaultLabel: "画面・機能単位" },
    { key: "triggerTiming", defaultLabel: "トリガー・タイミング" },
    { key: "actions.title", defaultLabel: "アクション名" },
    { key: "actions.intent", defaultLabel: "目的" },
    { key: "actions.majorSteps", defaultLabel: "主な手順（1行1ステップ）" },
    { key: "actions.successPath", defaultLabel: "正常時の動作" },
    { key: "actions.errorPath", defaultLabel: "エラー・中断時の動作" },
  ],
  Event: [
    { key: "events.eventName", defaultLabel: "イベント名" },
    { key: "events.trigger", defaultLabel: "トリガー" },
    { key: "events.target", defaultLabel: "対象機能・処理" },
    { key: "events.remarks", defaultLabel: "備考" },
    { key: "eventNotes", defaultLabel: "イベント補足" },
  ],
  FuncDetail: [
    { key: "units.processingName", defaultLabel: "処理名" },
    { key: "units.methodName", defaultLabel: "関数・メソッド名" },
    { key: "units.functionType", defaultLabel: "関数種別" },
    { key: "units.summary", defaultLabel: "概要" },
    { key: "units.normalFlow", defaultLabel: "通常処理（try）" },
    { key: "units.exceptionFlow", defaultLabel: "例外処理（catch）" },
    { key: "units.finallyFlow", defaultLabel: "終了処理（finally）" },
    { key: "units.relatedDocuments", defaultLabel: "関連設計書" },
  ],
  Relation: [
    { key: "relations.sourceName", defaultLabel: "Transfer Source" },
    { key: "relations.sourceCondition", defaultLabel: "転送元条件" },
    { key: "relations.destinationName", defaultLabel: "Transfer Destination" },
    { key: "relations.destinationCondition", defaultLabel: "転送先条件" },
    { key: "relations.sql", defaultLabel: "SQL" },
    { key: "relations.notes", defaultLabel: "備考" },
  ],
  Check: [
    { key: "screenName", defaultLabel: "画面名" },
    { key: "checkName", defaultLabel: "チェック名" },
    { key: "checkTimingTrigger", defaultLabel: "タイミング・トリガー" },
    { key: "checks.checkItem", defaultLabel: "チェック項目" },
    { key: "checks.type", defaultLabel: "種別" },
    { key: "checks.detail", defaultLabel: "詳細" },
    { key: "checks.messageId", defaultLabel: "メッセージID" },
    { key: "checks.messageArguments", defaultLabel: "メッセージ引数" },
  ],
  Others: [
    { key: "constants.name", defaultLabel: "名称" },
    { key: "constants.value", defaultLabel: "値" },
    { key: "constants.notes", defaultLabel: "備考" },
    { key: "mappings.category", defaultLabel: "区分" },
    { key: "mappings.mapping", defaultLabel: "マッピング" },
    { key: "mappings.notes", defaultLabel: "備考" },
    { key: "operationalNotes", defaultLabel: "運用注記" },
  ],
  Footnote: [
    { key: "terms.term", defaultLabel: "用語" },
    { key: "terms.description", defaultLabel: "説明" },
    { key: "abbreviations.code", defaultLabel: "略称・コード" },
    { key: "abbreviations.definition", defaultLabel: "定義" },
    { key: "supplementalNotes", defaultLabel: "補足注記" },
  ],
};

function defaultDefinition(type: DocumentType, key: string): InputFieldDefinition {
  return INPUT_FIELD_DEFINITIONS[type].find((definition) => definition.key === key) ?? {
    key,
    defaultLabel: key,
  };
}

export function getInputFieldPreference(
  design: DesignPackage,
  type: DocumentType,
  key: string,
): InputFieldPreference {
  const definition = defaultDefinition(type, key);
  const saved = design.fieldPreferences[type]?.[key];
  return {
    label: saved?.label?.trim() || definition.defaultLabel,
    enabled: saved?.enabled ?? true,
  };
}

export function setInputFieldPreference(
  design: DesignPackage,
  type: DocumentType,
  key: string,
  value: InputFieldPreference,
): void {
  design.fieldPreferences[type] ??= {};
  design.fieldPreferences[type]![key] = value;
}

export function resetInputFieldPreference(design: DesignPackage, type: DocumentType, key: string): void {
  delete design.fieldPreferences[type]?.[key];
}

export function resetDocumentInputFields(design: DesignPackage, type: DocumentType): void {
  delete design.fieldPreferences[type];
}
