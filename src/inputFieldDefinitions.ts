import type { DesignPackage, DocumentType, InputFieldPreference } from "./model";

export interface InputFieldDefinition {
  key: string;
  defaultLabel: string;
}

export const INPUT_FIELD_DEFINITIONS: Readonly<Record<DocumentType, readonly InputFieldDefinition[]>> = {
  Hist: [
    { key: "history.creationDate", defaultLabel: "Creation Date" },
    { key: "history.author", defaultLabel: "Author" },
    { key: "history.revision", defaultLabel: "Rev." },
    { key: "history.sheet", defaultLabel: "Sheet" },
    { key: "history.note", defaultLabel: "Note" },
    { key: "history.approvalDate", defaultLabel: "Approval Date" },
    { key: "history.approvedBy", defaultLabel: "Approval by" },
  ],
  Outline_A: [
    { key: "overview", defaultLabel: "機能概要" },
    { key: "scopeTarget", defaultLabel: "対象" },
    { key: "scopeExcluded", defaultLabel: "対象外" },
  ],
  Outline_B: [
    { key: "processOverview", defaultLabel: "処理概要" },
    { key: "processingStyle", defaultLabel: "処理形態" },
    { key: "executionMethod", defaultLabel: "実行方法" },
    { key: "crud.logicalName", defaultLabel: "論理テーブル名" },
    { key: "crud.physicalName", defaultLabel: "物理テーブル名（短縮名）" },
    { key: "crud.category", defaultLabel: "種別" },
    { key: "crud.select", defaultLabel: "S" },
    { key: "crud.insert", defaultLabel: "I" },
    { key: "crud.update", defaultLabel: "U" },
    { key: "crud.delete", defaultLabel: "D" },
  ],
  "S-Layout": [
    { key: "section.name", defaultLabel: "画面名" },
    { key: "section.notes", defaultLabel: "備考" },
    { key: "items.itemName", defaultLabel: "項目名称" },
    { key: "items.type", defaultLabel: "タイプ" },
    { key: "items.io", defaultLabel: "I/O" },
    { key: "items.length", defaultLabel: "桁数" },
    { key: "items.required", defaultLabel: "必須" },
    { key: "items.screenMode1", defaultLabel: "画面モード①" },
    { key: "items.screenMode2", defaultLabel: "画面モード②" },
    { key: "items.screenMode3", defaultLabel: "画面モード③" },
    { key: "items.notes", defaultLabel: "備考" },
    { key: "items.focusMessage", defaultLabel: "フォーカス時メッセージ" },
  ],
  "R-Layout": [
    { key: "section.name", defaultLabel: "帳票名" },
    { key: "section.overview", defaultLabel: "帳票の用途" },
    { key: "section.outputTiming", defaultLabel: "出力タイミング" },
    { key: "section.outputFormat", defaultLabel: "出力形式" },
    { key: "items.itemName", defaultLabel: "項目名称" },
    { key: "items.digits", defaultLabel: "桁数" },
    { key: "items.pageBreak", defaultLabel: "改頁" },
    { key: "items.group", defaultLabel: "グループ" },
    { key: "items.setting", defaultLabel: "項目設定内容" },
    { key: "items.notes", defaultLabel: "備考" },
  ],
  FuncSpec: [
    { key: "section.name", defaultLabel: "画面名" },
    { key: "processes.name", defaultLabel: "処理名・ボタン名" },
    { key: "processes.content", defaultLabel: "仕様内容（Markdown）" },
  ],
  Event: [
    { key: "section.name", defaultLabel: "画面名" },
    { key: "events.eventName", defaultLabel: "イベント名称／処理名称" },
    { key: "events.control", defaultLabel: "コントロール" },
    { key: "events.timing", defaultLabel: "起動タイミング" },
    { key: "events.inheritedMethod", defaultLabel: "継承メソッド" },
    { key: "events.summary", defaultLabel: "概要／備考" },
  ],
  FuncDetail: [
    { key: "section.name", defaultLabel: "画面名" },
    { key: "section.overview", defaultLabel: "概要" },
    { key: "processes.name", defaultLabel: "処理名称" },
    { key: "processes.functionName", defaultLabel: "関数名" },
    { key: "processes.functionType", defaultLabel: "関数種別" },
    { key: "processes.summary", defaultLabel: "概要" },
    { key: "processes.referenceSheet", defaultLabel: "参照Sheet" },
    { key: "processes.notes", defaultLabel: "備考" },
    { key: "processes.steps", defaultLabel: "処理手順（Markdown）" },
  ],
  Relation: [
    { key: "section.name", defaultLabel: "移送名" },
    { key: "section.transferType", defaultLabel: "移送区分" },
    { key: "section.condition", defaultLabel: "条件" },
    { key: "section.sortOrder", defaultLabel: "並び順" },
    { key: "section.arguments", defaultLabel: "引数" },
    { key: "section.sql", defaultLabel: "SQL" },
    { key: "mappings.sourceTable", defaultLabel: "移送元テーブル名" },
    { key: "mappings.sourceColumn", defaultLabel: "移送元カラム名" },
    { key: "mappings.sourceItem", defaultLabel: "移送元項目名称" },
    { key: "mappings.destinationTable", defaultLabel: "移送先テーブル名" },
    { key: "mappings.destinationColumn", defaultLabel: "移送先カラム名" },
    { key: "mappings.destinationItem", defaultLabel: "移送先項目名称" },
    { key: "mappings.notes", defaultLabel: "備考" },
  ],
  Check: [
    { key: "section.name", defaultLabel: "画面名称" },
    { key: "section.checkName", defaultLabel: "チェック名称" },
    { key: "section.timing", defaultLabel: "タイミング" },
    { key: "checks.checkItem", defaultLabel: "チェック項目" },
    { key: "checks.type", defaultLabel: "種別" },
    { key: "checks.detail", defaultLabel: "チェック詳細" },
    { key: "checks.messageId", defaultLabel: "メッセージID" },
    { key: "checks.messageArguments", defaultLabel: "メッセージ引数" },
    { key: "checks.message", defaultLabel: "メッセージ" },
  ],
  Others: [
    { key: "sections.name", defaultLabel: "定義名" },
    { key: "sections.language", defaultLabel: "コード種別" },
    { key: "sections.code", defaultLabel: "コード" },
    { key: "supplementalRules", defaultLabel: "補足ルール" },
  ],
  Footnote: [
    { key: "supplementalNotes", defaultLabel: "補足説明" },
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
