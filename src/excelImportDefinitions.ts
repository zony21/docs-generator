import { INPUT_FIELD_DEFINITIONS } from "./inputFieldDefinitions";
import { DOCUMENT_TYPES, type DesignPackage, type DocumentType } from "./model";

export interface TableColumnSpec {
  key: string;
  aliases: string[];
}

export const COMMON_FIELDS: Array<[keyof DesignPackage["common"], string[]]> = [
  ["systemName", ["System Name", "システム名"]],
  ["moduleName", ["Module Name", "モジュール名"]],
  ["moduleId", ["Module ID", "モジュールID"]],
  ["date", ["Date", "文書日付", "作成日"]],
  ["revision", ["Rev", "Rev.", "版数"]],
  ["author", ["Author", "作成者", "担当者"]],
];

export const TEXT_KEYS: Partial<Record<DocumentType, string[]>> = {
  Outline_A: ["overview", "scopeTarget", "scopeExcluded"],
  Outline_B: ["processOverview", "processingStyle", "executionMethod"],
  Footnote: ["supplementalNotes"],
  Others: ["supplementalRules"],
};

export const TABLE_PREFIX: Partial<Record<DocumentType, string>> = {
  Hist: "history",
  Outline_B: "crud",
  "S-Layout": "items",
  "R-Layout": "items",
  Event: "events",
  FuncSpec: "processes",
  FuncDetail: "processes",
  Relation: "mappings",
  Check: "checks",
};

export const SECTION_FIELDS: Partial<Record<DocumentType, string[]>> = {
  "S-Layout": ["notes"],
  "R-Layout": ["overview", "outputTiming", "outputFormat"],
  FuncDetail: ["overview"],
  Relation: ["transferType", "condition", "sortOrder", "arguments", "sql"],
  Check: ["checkName", "timing"],
};

const SHEET_ALIASES: Record<DocumentType, string[]> = {
  Hist: ["Hist", "改版履歴", "履歴"],
  Outline_A: ["Outline_A", "機能概要"],
  Outline_B: ["Outline_B", "処理概要"],
  "S-Layout": ["S-Layout", "画面レイアウト", "画面項目"],
  "R-Layout": ["R-Layout", "帳票レイアウト", "帳票項目"],
  FuncSpec: ["FuncSpec", "機能仕様"],
  Event: ["Event", "イベント"],
  FuncDetail: ["FuncDetail", "機能詳細"],
  Relation: ["Relation", "項目相関", "移送仕様"],
  Check: ["Check", "チェック"],
  Others: ["Others", "その他", "定数"],
  Footnote: ["Footnote", "脚注", "補足"],
};

const EXTRA_ALIASES: Record<string, string[]> = {
  overview: ["機能概要", "概要"],
  scopeTarget: ["対象", "対象範囲"],
  scopeExcluded: ["対象外", "除外対象"],
  processOverview: ["処理概要"],
  processingStyle: ["処理形態"],
  executionMethod: ["実行方法"],
  "section.name": ["画面名", "画面名称", "帳票名", "移送名"],
  "section.notes": ["備考", "画面備考"],
  "section.overview": ["帳票の用途", "帳票概要", "概要"],
  "section.outputTiming": ["出力タイミング"],
  "section.outputFormat": ["出力形式"],
  "section.transferType": ["移送区分"],
  "section.condition": ["条件"],
  "section.sortOrder": ["並び順", "ソート順"],
  "section.arguments": ["引数"],
  "section.sql": ["SQL", "SQL文"],
  "section.checkName": ["チェック名称", "チェック名"],
  "section.timing": ["タイミング"],
  supplementalNotes: ["補足説明", "脚注"],
  supplementalRules: ["補足ルール"],
};

export function normalizeExcelLabel(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/\.md$/i, "")
    .replace(/^[0-9０-９]+[._\-\s]*/, "")
    .replace(/[\s\u3000_\-–—・･/\\()（）\[\]【】「」『』:：.。]/g, "");
}

export function matchesExcelLabel(value: string, aliases: readonly string[]): boolean {
  const target = normalizeExcelLabel(value);
  return aliases.some((alias) => target === normalizeExcelLabel(alias));
}

export function documentTypeForSheet(name: string): DocumentType | null {
  const target = normalizeExcelLabel(name);
  return DOCUMENT_TYPES.find((type) => SHEET_ALIASES[type].some((alias) => {
    const normalizedAlias = normalizeExcelLabel(alias);
    return target === normalizedAlias || target.endsWith(normalizedAlias);
  })) ?? null;
}

export function fieldAliases(type: DocumentType, key: string): string[] {
  const definition = INPUT_FIELD_DEFINITIONS[type].find((item) => item.key === key);
  return [...(EXTRA_ALIASES[key] ?? []), definition?.defaultLabel ?? "", key].filter(Boolean);
}

export function tableColumnSpecs(type: DocumentType, prefix: string): TableColumnSpec[] {
  return INPUT_FIELD_DEFINITIONS[type]
    .filter((item) => item.key.startsWith(`${prefix}.`))
    .map((item) => ({
      key: item.key.slice(prefix.length + 1),
      aliases: [item.defaultLabel, item.key.slice(prefix.length + 1)],
    }));
}
