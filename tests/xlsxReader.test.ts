import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { readXlsxWorkbook, type WorkbookSheet } from "../src/xlsxReader";

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
  return `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body}</sheetData></worksheet>`;
}

async function xlsxBuffer(sheets: readonly WorkbookSheet[]): Promise<ArrayBuffer> {
  const zip = new JSZip();
  const workbookSheets = sheets.map((sheet, index) =>
    `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`,
  ).join("");
  zip.file(
    "xl/workbook.xml",
    `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${workbookSheets}</sheets></workbook>`,
  );
  zip.file(
    "xl/_rels/workbook.xml.rels",
    `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      sheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join("") +
      `</Relationships>`,
  );
  sheets.forEach((sheet, index) => zip.file(`xl/worksheets/sheet${index + 1}.xml`, worksheetXml(sheet.rows)));
  return zip.generateAsync({ type: "arraybuffer" });
}

describe("xlsx reader", () => {
  it("reads inline-string worksheets", async () => {
    const source: WorkbookSheet[] = [
      { name: "基本情報", rows: [["システム名", "販売管理"]] },
      { name: "Outline_A", rows: [["機能概要", "受注を登録する"]] },
    ];
    expect(await readXlsxWorkbook(await xlsxBuffer(source))).toEqual(source);
  });
});
