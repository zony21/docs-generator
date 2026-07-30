import { DOCUMENT_TYPES, type DesignPackage, type DocumentType } from "./model";
import {
  COMMON_FIELDS,
  documentTypeForSheet,
  matchesExcelLabel,
} from "./excelImportDefinitions";
import {
  findWorkbookValue,
  importWorkbookDocument,
  updateImportedTableCatalog,
} from "./excelImportMapper";
import { readXlsxWorkbook, type WorkbookSheet } from "./xlsxReader";

export interface ExcelImportResult {
  design: DesignPackage;
  importedDocuments: DocumentType[];
  importedSheets: string[];
  ignoredSheets: string[];
  warnings: string[];
}

function localDateString(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function isCommonSheet(name: string): boolean {
  return ["基本情報", "共通情報", "Common", "README", "表紙"]
    .some((alias) => matchesExcelLabel(name, [alias]));
}

export function applyWorkbookSheets(
  sheets: readonly WorkbookSheet[],
  fileName: string,
  currentDesign: DesignPackage,
): ExcelImportResult {
  const design = structuredClone(currentDesign);
  const commonTargets = sheets.filter((sheet) => isCommonSheet(sheet.name));
  const importedSheetSet = new Set<string>();

  for (const [key, aliases] of COMMON_FIELDS) {
    for (const sheet of commonTargets.length > 0 ? commonTargets : sheets) {
      const value = findWorkbookValue(sheet.rows, aliases);
      if (!value) continue;
      design.common[key] = value;
      importedSheetSet.add(sheet.name);
      break;
    }
  }

  design.common.sourceExcelFile = fileName;
  design.common.conversionDate = localDateString();

  const importedDocuments: DocumentType[] = [];
  const ignoredSheets: string[] = [];
  for (const sheet of sheets) {
    if (importedSheetSet.has(sheet.name) || !sheet.rows.some((row) => row.some(Boolean))) continue;
    const type = documentTypeForSheet(sheet.name);
    if (!type || !importWorkbookDocument(design, type, sheet.rows)) {
      ignoredSheets.push(sheet.name);
      continue;
    }
    importedDocuments.push(type);
    importedSheetSet.add(sheet.name);
  }

  design.selectedDocuments = DOCUMENT_TYPES.filter((type) =>
    design.selectedDocuments.includes(type) || importedDocuments.includes(type),
  );
  updateImportedTableCatalog(design);

  const warnings = ignoredSheets.length > 0 ? [`未取込シート: ${ignoredSheets.join("、")}`] : [];
  if (importedDocuments.length === 0) {
    warnings.unshift("設計書として認識できるシートはありませんでした。共通情報のみ反映した可能性があります。");
  }

  return {
    design,
    importedDocuments: [...new Set(importedDocuments)],
    importedSheets: [...importedSheetSet],
    ignoredSheets,
    warnings,
  };
}

export async function importExcelWorkbook(file: File, currentDesign: DesignPackage): Promise<ExcelImportResult> {
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    throw new Error("現在対応している形式は .xlsx のみです。");
  }
  const sheets = await readXlsxWorkbook(await file.arrayBuffer());
  return applyWorkbookSheets(sheets, file.name, currentDesign);
}
