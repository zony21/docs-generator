import {
  createDocumentSection,
  createId,
  createSectionForDocument,
  type DesignPackage,
  type DocumentSection,
  type DocumentType,
  type TableCatalogItem,
  type TableRow,
} from "./model";
import {
  SECTION_FIELDS,
  TABLE_PREFIX,
  TEXT_KEYS,
  fieldAliases,
  matchesExcelLabel,
  normalizeExcelLabel,
  tableColumnSpecs,
  type TableColumnSpec,
} from "./excelImportDefinitions";

function valueToRight(row: readonly string[], column: number): string {
  for (let index = column + 1; index < row.length; index += 1) {
    if (row[index]?.trim()) return row[index].trim();
  }
  return "";
}

export function findWorkbookValue(
  rows: readonly string[][],
  aliases: readonly string[],
  start = 0,
  end = rows.length,
): string {
  for (let rowIndex = start; rowIndex < end; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    for (let column = 0; column < row.length; column += 1) {
      if (!matchesExcelLabel(row[column] ?? "", aliases)) continue;
      const right = valueToRight(row, column);
      if (right && !matchesExcelLabel(right, aliases)) return right;
      for (let below = rowIndex + 1; below < Math.min(end, rowIndex + 4); below += 1) {
        if (rows[below]?.[column]?.trim()) return rows[below][column].trim();
      }
    }
  }
  return "";
}

function readTable(
  rows: readonly string[][],
  columns: readonly TableColumnSpec[],
  start = 0,
  end = rows.length,
): TableRow[] {
  for (let headerIndex = start; headerIndex < end; headerIndex += 1) {
    const mappedColumns = new Map<number, string>();
    rows[headerIndex]?.forEach((cell, index) => {
      const column = columns.find((candidate) => matchesExcelLabel(cell ?? "", candidate.aliases));
      if (column) mappedColumns.set(index, column.key);
    });
    if (mappedColumns.size < Math.min(2, columns.length)) continue;

    const result: TableRow[] = [];
    for (let dataIndex = headerIndex + 1; dataIndex < end; dataIndex += 1) {
      const source = rows[dataIndex] ?? [];
      if (!source.some((cell) => cell?.trim())) break;
      const item: TableRow = {};
      for (const [columnIndex, key] of mappedColumns) item[key] = source[columnIndex]?.trim() ?? "";
      if (Object.values(item).some(Boolean)) result.push(item);
    }
    if (result.length > 0) return result;
  }
  return [];
}

function sectionRanges(rows: readonly string[][], type: DocumentType): Array<{ start: number; end: number; name: string }> {
  const headings: Array<{ row: number; name: string }> = [];
  rows.forEach((row, rowIndex) => row.forEach((cell, column) => {
    if (!matchesExcelLabel(cell ?? "", fieldAliases(type, "section.name"))) return;
    const name = valueToRight(row, column);
    if (name) headings.push({ row: rowIndex, name });
  }));
  if (headings.length === 0) return [{ start: 0, end: rows.length, name: "" }];
  return headings.map((item, index) => ({
    start: item.row,
    end: headings[index + 1]?.row ?? rows.length,
    name: item.name,
  }));
}

function fillTextFields(design: DesignPackage, type: DocumentType, rows: readonly string[][]): boolean {
  let changed = false;
  for (const key of TEXT_KEYS[type] ?? []) {
    const value = findWorkbookValue(rows, fieldAliases(type, key));
    if (!value) continue;
    design.documents[type].text[key] = value;
    changed = true;
  }
  return changed;
}

function fillSectionFields(
  section: DocumentSection,
  type: DocumentType,
  rows: readonly string[][],
  start: number,
  end: number,
): boolean {
  let changed = false;
  for (const key of SECTION_FIELDS[type] ?? []) {
    const value = findWorkbookValue(rows, fieldAliases(type, `section.${key}`), start, end);
    if (!value) continue;
    section.fields[key] = value;
    changed = true;
  }
  return changed;
}

function importSections(design: DesignPackage, type: DocumentType, rows: readonly string[][]): boolean {
  const prefix = TABLE_PREFIX[type];
  let changed = false;
  const sections = sectionRanges(rows, type).map((range, index) => {
    const section = createSectionForDocument(type, index);
    if (range.name) section.name = range.name;
    changed = fillSectionFields(section, type, rows, range.start, range.end) || changed || Boolean(range.name);

    if (prefix) {
      const values = readTable(rows, tableColumnSpecs(type, prefix), range.start, range.end);
      if (values.length > 0) {
        if (type === "FuncSpec" || type === "FuncDetail") {
          section.children = values.map((row, childIndex) => {
            const child = createDocumentSection(row.name || `処理${childIndex + 1}`, childIndex);
            Object.entries(row).forEach(([key, value]) => {
              if (key !== "name" && value) child.fields[key] = value;
            });
            return child;
          });
        } else {
          section.tables[prefix] = values;
        }
        changed = true;
      }
    }
    return section;
  });

  if (changed) design.documents[type].sections = sections;
  return changed;
}

function importOthers(design: DesignPackage, rows: readonly string[][]): boolean {
  const names = fieldAliases("Others", "sections.name");
  const sections: DocumentSection[] = [];
  rows.forEach((row, rowIndex) => row.forEach((cell, column) => {
    if (!matchesExcelLabel(cell ?? "", names)) return;
    const name = valueToRight(row, column);
    if (!name) return;
    const section = createDocumentSection(name, sections.length);
    section.fields.language = findWorkbookValue(rows, fieldAliases("Others", "sections.language"), rowIndex) || "text";
    section.fields.code = findWorkbookValue(rows, fieldAliases("Others", "sections.code"), rowIndex);
    sections.push(section);
  }));
  const changed = fillTextFields(design, "Others", rows) || sections.length > 0;
  if (sections.length > 0) design.documents.Others.sections = sections;
  return changed;
}

export function importWorkbookDocument(design: DesignPackage, type: DocumentType, rows: readonly string[][]): boolean {
  if (type === "Others") return importOthers(design, rows);
  let changed = fillTextFields(design, type, rows);
  const prefix = TABLE_PREFIX[type];
  if (["Hist", "Outline_B"].includes(type) && prefix) {
    const values = readTable(rows, tableColumnSpecs(type, prefix));
    if (values.length > 0) {
      design.documents[type].tables[prefix] = values;
      changed = true;
    }
  }
  if (!["Hist", "Outline_A", "Outline_B", "Footnote"].includes(type)) {
    changed = importSections(design, type, rows) || changed;
  }
  return changed;
}

function mergeCatalog(items: TableCatalogItem[], item: Omit<TableCatalogItem, "id">): void {
  if (!item.physicalName && !item.logicalName) return;
  const key = normalizeExcelLabel(item.physicalName || item.logicalName);
  const existing = items.find((candidate) => normalizeExcelLabel(candidate.physicalName || candidate.logicalName) === key);
  if (existing) {
    existing.physicalName ||= item.physicalName;
    existing.logicalName ||= item.logicalName;
    return;
  }
  items.push({ id: createId(), ...item });
}

export function updateImportedTableCatalog(design: DesignPackage): void {
  for (const row of design.documents.Outline_B.tables.crud ?? []) {
    mergeCatalog(design.tableCatalog, {
      category: row.category || "Table",
      physicalName: row.physicalName || "",
      logicalName: row.logicalName || "",
      description: "Excel取込: Outline_B",
    });
  }
  for (const section of design.documents.Relation.sections) {
    for (const row of section.tables.mappings ?? []) {
      mergeCatalog(design.tableCatalog, {
        category: "Table",
        physicalName: row.sourceTable || "",
        logicalName: "",
        description: "Excel取込: Relation移送元",
      });
      mergeCatalog(design.tableCatalog, {
        category: "Table",
        physicalName: row.destinationTable || "",
        logicalName: "",
        description: "Excel取込: Relation移送先",
      });
    }
  }
}
