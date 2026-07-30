import JSZip from "jszip";

export interface WorkbookSheet {
  name: string;
  rows: string[][];
}

function decodeXml(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, decimal: string) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function attribute(tag: string, name: string): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return decodeXml(tag.match(new RegExp(`(?:^|\\s)${escaped}="([^"]*)"`))?.[1] ?? "");
}

function tagValues(xml: string, name: string): string[] {
  const values: string[] = [];
  const expression = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "gi");
  for (const match of xml.matchAll(expression)) values.push(decodeXml(match[1].replace(/<[^>]+>/g, "")));
  return values;
}

function normalizeZipPath(base: string, target: string): string {
  const combined = target.startsWith("/") ? target.slice(1) : `${base}/${target}`;
  const parts: string[] = [];
  for (const part of combined.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop(); else parts.push(part);
  }
  return parts.join("/");
}

async function zipText(zip: JSZip, path: string, required = true): Promise<string> {
  const entry = zip.file(path);
  if (!entry) {
    if (!required) return "";
    throw new Error(`Excel内の必須ファイルが見つかりません: ${path}`);
  }
  return entry.async("text");
}

function columnIndex(reference: string): number {
  const letters = reference.match(/[A-Z]+/i)?.[0]?.toUpperCase() ?? "A";
  let result = 0;
  for (const letter of letters) result = result * 26 + letter.charCodeAt(0) - 64;
  return result - 1;
}

function parseSharedStrings(xml: string): string[] {
  if (!xml) return [];
  const strings: string[] = [];
  for (const match of xml.matchAll(/<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/gi)) {
    strings.push(tagValues(match[1], "t").join(""));
  }
  return strings;
}

function parseCellValue(cellXml: string, cellTag: string, sharedStrings: readonly string[]): string {
  const type = attribute(cellTag, "t");
  if (type === "inlineStr") return tagValues(cellXml, "t").join("");
  const raw = tagValues(cellXml, "v")[0] ?? "";
  if (type === "s") return sharedStrings[Number.parseInt(raw, 10)] ?? "";
  if (type === "b") return raw === "1" ? "TRUE" : "FALSE";
  return raw;
}

function expandMergedCells(rows: string[][], worksheetXml: string): void {
  for (const match of worksheetXml.matchAll(/<mergeCell\b[^>]*\bref="([A-Z]+\d+):([A-Z]+\d+)"[^>]*\/?>(?:<\/mergeCell>)?/gi)) {
    const start = match[1];
    const end = match[2];
    const startColumn = columnIndex(start);
    const endColumn = columnIndex(end);
    const startRow = Number.parseInt(start.match(/\d+/)?.[0] ?? "1", 10) - 1;
    const endRow = Number.parseInt(end.match(/\d+/)?.[0] ?? "1", 10) - 1;
    const value = rows[startRow]?.[startColumn] ?? "";
    if (!value) continue;
    for (let row = startRow; row <= endRow; row += 1) {
      rows[row] ??= [];
      for (let column = startColumn; column <= endColumn; column += 1) {
        if (!rows[row][column]) rows[row][column] = value;
      }
    }
  }
}

function parseWorksheet(xml: string, sharedStrings: readonly string[]): string[][] {
  const rows: string[][] = [];
  for (const rowMatch of xml.matchAll(/<row\b[^>]*\br="(\d+)"[^>]*>([\s\S]*?)<\/row>/gi)) {
    const rowIndex = Number.parseInt(rowMatch[1], 10) - 1;
    const row = rows[rowIndex] ?? [];
    for (const cellMatch of rowMatch[2].matchAll(/(<c\b[^>]*\br="([A-Z]+\d+)"[^>]*>)([\s\S]*?)<\/c>/gi)) {
      row[columnIndex(cellMatch[2])] = parseCellValue(cellMatch[3], cellMatch[1], sharedStrings).trim();
    }
    rows[rowIndex] = row;
  }
  expandMergedCells(rows, xml);
  while (rows.length > 0 && rows[rows.length - 1].every((value) => !value?.trim())) rows.pop();
  return rows;
}

export async function readXlsxWorkbook(buffer: ArrayBuffer): Promise<WorkbookSheet[]> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(buffer);
  } catch {
    throw new Error("Excelファイルを開けませんでした。.xlsx形式か確認してください。");
  }
  const workbookXml = await zipText(zip, "xl/workbook.xml");
  const relationshipsXml = await zipText(zip, "xl/_rels/workbook.xml.rels");
  const sharedStrings = parseSharedStrings(await zipText(zip, "xl/sharedStrings.xml", false));
  const relationshipTargets = new Map<string, string>();
  for (const match of relationshipsXml.matchAll(/<Relationship\b[^>]*\/>/gi)) {
    relationshipTargets.set(attribute(match[0], "Id"), attribute(match[0], "Target"));
  }
  const sheets: WorkbookSheet[] = [];
  for (const match of workbookXml.matchAll(/<sheet\b[^>]*\/>/gi)) {
    const name = attribute(match[0], "name");
    const relationId = attribute(match[0], "r:id");
    const target = relationshipTargets.get(relationId);
    if (!name || !target) continue;
    const path = normalizeZipPath("xl", target);
    const rows = parseWorksheet(await zipText(zip, path), sharedStrings);
    sheets.push({ name, rows });
  }
  if (sheets.length === 0) throw new Error("Excelブック内に読み取り可能なシートがありません。");
  return sheets;
}
