import { INPUT_FIELD_DEFINITIONS } from "./inputFieldDefinitions";
import {
  DOCUMENT_TYPES,
  createDocumentSection,
  createId,
  createSectionForDocument,
  type DesignPackage,
  type DocumentSection,
  type DocumentType,
  type TableCatalogItem,
  type TableRow,
} from "./model";
import { readXlsxWorkbook, type WorkbookSheet } from "./xlsxReader";

export interface ExcelImportResult {
  design: DesignPackage;
  importedDocuments: DocumentType[];
  importedSheets: string[];
  ignoredSheets: string[];
  warnings: string[];
}

type Spec = { key: string; aliases: string[] };
const SHEET_ALIASES: Record<DocumentType, string[]> = {
  Hist: ["Hist", "改版履歴", "履歴"], Outline_A: ["Outline_A", "機能概要"],
  Outline_B: ["Outline_B", "処理概要"], "S-Layout": ["S-Layout", "画面レイアウト", "画面項目"],
  "R-Layout": ["R-Layout", "帳票レイアウト", "帳票項目"], FuncSpec: ["FuncSpec", "機能仕様"],
  Event: ["Event", "イベント"], FuncDetail: ["FuncDetail", "機能詳細"],
  Relation: ["Relation", "項目相関", "移送仕様"], Check: ["Check", "チェック"],
  Others: ["Others", "その他", "定数"], Footnote: ["Footnote", "脚注", "補足"],
};
const COMMON: Array<[keyof DesignPackage["common"], string[]]> = [
  ["systemName", ["System Name", "システム名"]], ["moduleName", ["Module Name", "モジュール名"]],
  ["moduleId", ["Module ID", "モジュールID"]], ["date", ["Date", "文書日付", "作成日"]],
  ["revision", ["Rev", "Rev.", "版数"]], ["author", ["Author", "作成者", "担当者"]],
];
const TEXT_KEYS: Partial<Record<DocumentType, string[]>> = {
  Outline_A: ["overview", "scopeTarget", "scopeExcluded"],
  Outline_B: ["processOverview", "processingStyle", "executionMethod"],
  Footnote: ["supplementalNotes"], Others: ["supplementalRules"],
};
const TABLE_PREFIX: Partial<Record<DocumentType, string>> = {
  Hist: "history", Outline_B: "crud", "S-Layout": "items", "R-Layout": "items",
  Event: "events", FuncSpec: "processes", FuncDetail: "processes", Relation: "mappings", Check: "checks",
};
const SECTION_FIELDS: Partial<Record<DocumentType, string[]>> = {
  "S-Layout": ["notes"], "R-Layout": ["overview", "outputTiming", "outputFormat"],
  FuncDetail: ["overview"], Relation: ["transferType", "condition", "sortOrder", "arguments", "sql"],
  Check: ["checkName", "timing"],
};
const EXTRA_ALIASES: Record<string, string[]> = {
  overview: ["機能概要", "概要"], scopeTarget: ["対象", "対象範囲"], scopeExcluded: ["対象外", "除外対象"],
  processOverview: ["処理概要"], processingStyle: ["凧理形態"], executionMethod: ["実行方法"],
  "section.name": ["画面名", "画面名称", "帳票名", "移送名"], "section.notes": ["備考", "画面備考"],
  "section.overview": ["帳票の用途", "帳票概要", "概要"], "section.outputTiming": ["出力タイミング"],
  "section.outputFormat": ["出力形式"], "section.transferType": ["移送区分"], "section.condition": ["条件"],
  "section.sortOrder": ["並び順", "ソート順"], "section.arguments": ["引数"], "section.sql": ["SQL", "SQL文"],
  "section.checkName": ["チェック名称", "チェック名"], "section.timing": ["タイミング"],
  supplementalNotes: ["補足説明", "脚注"], supplementalRules: ["補足ルール"],
};

function norm(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/\.md$/i, "")
    .replace(/^[0-9０-９]+[._\-\s]*/, "").replace(/[\s\u3000_\-–—・･/\\()（）\[\]【】「」『』:：.。]/g, "");
}
function matches(value: string, aliases: readonly string[]): boolean {
  const target = norm(value); return aliases.some((alias) => target === norm(alias));
}
function typeFor(name: string): DocumentType | null {
  const target = norm(name);
  return DOCUMENT_TYPES.find((type) => SHEET_ALIASES[type].some((alias) => target === norm(alias) || target.endsWith(norm(alias)))) ?? null;
}
function right(row: readonly string[], column: number): string {
  for (let i = column + 1; i < row.length; i += 1) if (row[i]?.trim()) return row[i].trim(); return "";
}
function aliases(type: DocumentType, key: string): string[] {
  const definition = INPUT_FIELD_DEFINITIONS[type].find((item) => item.key === key);
  return [...(EXTRA_ALIASES[key] ?? []), definition?.defaultLabel ?? "", key].filter(Boolean);
}
function findValue(rows: readonly string[][], names: readonly string[], start = 0, end = rows.length): string {
  for (let r = start; r < end; r += 1) for (let c = 0; c < (rows[r]?.length ?? 0); c += 1) {
    if (!matches(rows[r][c] ?? "", names)) continue;
    const value = right(rows[r], c); if (value && !matches(value, names)) return value;
    for (let b = r + 1; b < Math.min(end, r + 4); b += 1) if (rows[b]?.[c]?.trim()) return rows[b][c].trim();
  }
  return "";
}
function specs(type: DocumentType, prefix: string): Spec[] {
  return INPUT_FIELD_DEFINITIONS[type].filter((item) => item.key.startsWith(`${prefix}.`)).map((item) => ({
    key: item.key.slice(prefix.length + 1), aliases: [item.defaultLabel, item.key.slice(prefix.length + 1)],
  }));
}
function table(rows: readonly string[][], columns: readonly Spec[], start = 0, end = rows.length): TableRow[] {
  for (let r = start; r < end; r += 1) {
    const map = new Map<number, string>();
    rows[r]?.forEach((cell, index) => { const spec = columns.find((candidate) => matches(cell ?? "", candidate.aliases)); if (spec) map.set(index, spec.key); });
    if (map.size < Math.min(2, columns.length)) continue;
    const result: TableRow[] = [];
    for (let d = r + 1; d < end; d += 1) {
      const source = rows[d] ?? []; if (!source.some((cell) => cell?.trim())) break;
      const item: TableRow = {}; for (const [index, key] of map) item[key] = source[index]?.trim() ?? "";
      if (Object.values(item).some(Boolean)) result.push(item);
    }
    if (result.length) return result;
  }
  return [];
}
function ranges(rows: readonly string[][], type: DocumentType): Array<{ start: number; end: number; name: string }> {
  const found: Array<{ row: number; name: string }> = [];
  rows.forEach((row, rowIndex) => row.forEach((cell, column) => {
    if (matches(cell ?? "", aliases(type, "section.name"))) { const name = right(row, column); if (name) found.push({ row: rowIndex, name }); }
  }));
  if (!found.length) return [{ start: 0, end: rows.length, name: "" }];
  return found.map((item, index) => ({ start: item.row, end: found[index + 1]?.row ?? rows.length, name: item.name }));
}
function fillText(design: DesignPackage, type: DocumentType, rows: readonly string[][]): boolean {
  let changed = false;
  for (const key of TEXT_KEYS[type] ?? []) { const value = findValue(rows, aliases(type, key)); if (value) { design.documents[type].text[key] = value; changed = true; } }
  return changed;
}
function fillSectionFields(section: DocumentSection, type: DocumentType, rows: readonly string[][], start: number, end: number): boolean {
  let changed = false;
  for (const key of SECTION_FIELDS[type] ?? []) { const value = findValue(rows, aliases(type, `section.${key}`), start, end); if (value) { section.fields[key] = value; changed = true; } }
  return changed;
}
function importSections(design: DesignPackage, type: DocumentType, rows: readonly string[][]): boolean {
  const prefix = TABLE_PREFIX[type]; let changed = false;
  const sections = ranges(rows, type).map((range, index) => {
    const section = createSectionForDocument(type, index); if (range.name) section.name = range.name;
    changed = fillSectionFields(section, type, rows, range.start, range.end) || changed || Boolean(range.name);
    if (prefix) {
      const values = table(rows, specs(type, prefix), range.start, range.end);
      if (values.length) {
        if (type === "FuncSpec" || type === "FuncDetail") section.children = values.map((row, childIndex) => {
          const child = createDocumentSection(row.name || `処理${childIndex + 1}`, childIndex);
          Object.entries(row).forEach(([key, value]) => { if (key !== "name" && value) child.fields[key] = value; }); return child;
        }); else section.tables[prefix] = values;
        changed = true;
      }
    }
    return section;
  });
  if (changed) design.documents[type].sections = sections; return changed;
}
function importOthers(design: DesignPackage, rows: readonly string[][]): boolean {
  const names = aliases("Others", "sections.name"); const sections: DocumentSection[] = [];
  rows.forEach((row, rowIndex) => row.forEach((cell, column) => {
    if (!matches(cell ?? "", names)) return; const name = right(row, column); if (!name) return;
    const section = createDocumentSection(name, sections.length);
    section.fields.language = findValue(rows, aliases("Others", "sections.language"), rowIndex, rows.length) || "text";
    section.fields.code = findValue(rows, aliases("Others", "sections.code"), rowIndex, rows.length); sections.push(section);
  }));
  const changed = fillText(design, "Others", rows) || sections.length > 0; if (sections.length) design.documents.Others.sections = sections; return changed;
}
function importDocument(design: DesignPackage, type: DocumentType, rows: readonly string[][]): boolean {
  if (type === "Others") return importOthers(design, rows);
  let changed = fillText(design, type, rows); const prefix = TABLE_PREFIX[type];
  if (["Hist", "Outline_B"].includes(type) && prefix) { const values = table(rows, specs(type, prefix)); if (values.length) { design.documents[type].tables[prefix] = values; changed = true; } }
  if (!["Hist", "Outline_A", "Outline_B", "Footnote"].includes(type)) changed = importSections(design, type, rows) || changed;
  return changed;
}
function localDate(): string { const now = new Date(); return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10); }
function mergeCatalog(items: TableCatalogItem[], item: Omit<TableCatalogItem, "id">): void {
  if (!item.physicalName && !item.logicalName) return;
  const existing = items.find((candidate) => norm(candidate.physicalName || candidate.logicalName) === norm(item.physicalName || item.logicalName));
  if (existing) { existing.physicalName ||= item.physicalName; existing.logicalName ||= item.logicalName; return; }
  items.push({ id: createId(), ...item });
}
function updateCatalog(design: DesignPackage): void {
  for (const row of design.documents.Outline_B.tables.crud ?? []) mergeCatalog(design.tableCatalog, {
    category: row.category || "Table", physicalName: row.physicalName || "", logicalName: row.logicalName || "", description: "Excel取込: Outline_B",
  });
  for (const section of design.documents.Relation.sections) for (const row of section.tables.mappings ?? []) {
    mergeCatalog(design.tableCatalog, { category: "Table", physicalName: row.sourceTable || "", logicalName: "", description: "Excel取込: Relation移送元" });
    mergeCatalog(design.tableCatalog, { category: "Table", physicalName: row.destinationTable || "", logicalName: "", description: "Excel取込: Relation移送先" });
  }
}
export function applyWorkbookSheets(sheets: readonly WorkbookSheet[], fileName: string, currentDesign: DesignPackage): ExcelImportResult {
  const design = structuredClone(currentDesign); const commonSheets: string[] = [];
  const commonTargets = sheets.filter((sheet) => ["基本情報", "共通情報", "Common", "README", "表紙"].some((name) => matches(sheet.name, [name])));
  for (const [key, names] of COMMON) for (const sheet of commonTargets.length ? commonTargets : sheets) {
    const value = findValue(sheet.rows, names); if (value) { design.common[key] = value; commonSheets.push(sheet.name); break; }
  }
  design.common.sourceExcelFile = fileName; design.common.conversionDate = localDate();
  const importedDocuments: DocumentType[] = []; const importedSheets = [...new Set(commonSheets)]; const ignoredSheets: string[] = [];
  for (const sheet of sheets) {
    if (importedSheets.includes(sheet.name) || !sheet.rows.some((row) => row.some(Boolean))) continue;
    const type = typeFor(sheet.name); if (!type || !importDocument(design, type, sheet.rows)) { ignoredSheets.push(sheet.name); continue; }
    importedDocuments.push(type); importedSheets.push(sheet.name);
  }
  design.selectedDocuments = DOCUMENT_TYPES.filter((type) => design.selectedDocuments.includes(type) || importedDocuments.includes(type)); updateCatalog(design);
  const warnings = ignoredSheets.length ? [`未取込シート: ${ignoredSheets.join("、")}`] : [];
  if (!importedDocuments.length) warnings.unshift("設計書として認識できるシートはありませんでした。共通情報のみ反映した可能性があります。");
  return { design, importedDocuments: [...new Set(importedDocuments)], importedSheets, ignoredSheets, warnings };
}
export async function importExcelWorkbook(file: File, currentDesign: DesignPackage): Promise<ExcelImportResult> {
  if (!file.name.toLowerCase().endsWith(".xlsx")) throw new Error("現在対応している形式は .xlsx のみです。");
  return applyWorkbookSheets(await readXlsxWorkbook(await file.arrayBuffer()), file.name, currentDesign);
}
