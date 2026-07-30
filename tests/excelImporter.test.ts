import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { applyWorkbookSheets } from "../src/excelImporter";
import { readXlsxWorkbook, type WorkbookSheet } from "../src/xlsxReader";
import { createDefaultDesignPackage } from "../src/model";

function columnName(index: number): string {
  let value = index + 1;
  let result = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }
  return result;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function worksheetXml(rows: readonly string[][]): string {
  const body = rows.map((row, rowIndex) => {
    const cells = row.map((value, columnIndex) => {
      if (!value) return "";
      const reference = `${columnName(columnIndex)}${rowIndex + 1}`;
      return `<c r="${reference}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
    }).join("");
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body}</sheetData></worksheet>`;
}

async function xlsxBuffer(sheets: readonly WorkbookSheet[]): Promise<ArrayBuffer> {
  const zip = new JSZip();
  const workbookSheets = sheets.map((sheet, index) =>
    `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`,
  ).join("");
  zip.file(
    "xl/workbook.xml",
    `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ` +
      `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${workbookSheets}</sheets></workbook>`,
  );
  zip.file(
    "xl/_rels/workbook.xml.rels",
    `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      sheets.map((_, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" ` +
        `Target="worksheets/sheet${index + 1}.xml"/>`,
      ).join("") +
      `</Relationships>`,
  );
  sheets.forEach((sheet, index) => zip.file(`xl/worksheets/sheet${index + 1}.xml`, worksheetXml(sheet.rows)));
  return zip.generateAsync({ type: "arraybuffer" });
}

describe("Excel workbook import", () => {
  it("reads inline-string worksheets from xlsx", async () => {
    const source: WorkbookSheet[] = [
      { name: "基本情報", rows: [["システム名", "販売管理"]] },
      { name: "Outline_A", rows: [["機能概要", "受注を登録する"]] },
    ];
    const parsed = await readXlsxWorkbook(await xlsxBuffer(source));
    expect(parsed).toEqual(source);
  });

  it("merges recognized workbook data without clearing unrelated input", () => {
    const design = createDefaultDesignPackage();
    design.documents.Footnote.text.supplementalNotes = "既存の補足";
    const result = applyWorkbookSheets([
      {
        name: "基本情報",
        rows: [
          ["システム名", "販売管理"],
          ["モジュール名", "受注登録"],
          ["モジュールID", "ORD01"],
          ["作成者", "久野"],
        ],
      },
      {
        name: "Outline_A",
        rows: [
          ["機能概要", "受注を登録する"],
          ["対象", "営業担当者"],
          ["対象外", "請求処理"],
        ],
      },
      {
        name: "Outline_B",
        rows: [
          ["凧理概要", "受注情報を保存する"],
          [],
          ["論理テーブル名", "物理テーブル名（短縮名）", "種別", "S", "I", "U", "D"],
          ["受注", "T_ORDER", "Table", "○", "○", "○", ""],
        ],
      },
      {
        name: "S-Layout",
        rows: [
          ["画面名", "受注登録画面"],
          ["備考", "新規登録用"],
          [],
          ["項目名称", "タイプ", "I/O", "桁数", "必須", "画面モード①", "画面モード②", "画面モード③", "備考", "フォーカス時メッセージ"],
          ["受注番号", "Text", "O", "10", "必須", "表示", "表示", "表示", "", ""],
        ],
      },
    ], "sample.xlsx", design);

    expect(result.importedDocuments).toEqual(["Outline_A", "Outline_B", "S-Layout"]);
    expect(result.design.common.systemName).toBe("販売管理");
    expect(result.design.common.sourceExcelFile).toBe("sample.xlsx");
    expect(result.design.documents.Outline_A.text.overview).toBe("受注を登録する");
    expect(result.design.documents["S-Layout"].sections[0].name).toBe("受注登録画面");
    expect(result.design.documents["S-Layout"].sections[0].tables.items[0].itemName).toBe("受注番号");
    expect(result.design.documents.Footnote.text.supplementalNotes).toBe("既存の補足");
    expect(result.design.tableCatalog).toEqual(expect.arrayContaining([
      expect.objectContaining({ physicalName: "T_ORDER", logicalName: "受注" }),
    ]));
  });
});
