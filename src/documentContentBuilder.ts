import { getInputFieldPreference } from "./inputFieldDefinitions";
import type {
  DesignPackage,
  DocumentData,
  DocumentSection,
  DocumentType,
  TableRow,
} from "./model";
import { bulletList, escapeMarkdownCell, normalizeMarkdown } from "./markdownUtils";

interface TableColumn {
  preferenceKey: string;
  dataKey: string;
}

function preference(design: DesignPackage, type: DocumentType, key: string) {
  return getInputFieldPreference(design, type, key);
}

function enabled(design: DesignPackage, type: DocumentType, key: string): boolean {
  return preference(design, type, key).enabled;
}

function label(design: DesignPackage, type: DocumentType, key: string): string {
  return preference(design, type, key).label;
}

function cleanHeading(value: string): string {
  return value.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
}

function missing(value: string): string {
  return value.trim() || "（未定義）";
}

function bulletsOrMissing(value: string): string {
  return bulletList(value) || "（記載なし）";
}

function sectionName(
  design: DesignPackage,
  type: DocumentType,
  section: DocumentSection,
  index: number,
  fallback: string,
  preferenceKey = "section.name",
): string {
  if (!enabled(design, type, preferenceKey)) return `${fallback}${index + 1}`;
  return cleanHeading(section.name) || `${fallback}${index + 1}`;
}

function commonHeader(design: DesignPackage, type: DocumentType): string {
  const common = design.common;
  return [
    `# ${type}`,
    "",
    `- 元シート名: \`${type}\``,
    "",
    "## 基本情報",
    "",
    "| 項目 | 値 |",
    "| --- | --- |",
    `| System Name | ${escapeMarkdownCell(common.systemName)} |`,
    `| Module Name | ${escapeMarkdownCell(common.moduleName)} |`,
    `| Date | ${escapeMarkdownCell(common.date)} |`,
    `| Rev | ${escapeMarkdownCell(common.revision)} |`,
    `| Author | ${escapeMarkdownCell(common.author)} |`,
    `| Module ID | ${escapeMarkdownCell(common.moduleId)} |`,
  ].join("\n");
}

function renderConfiguredTable(
  design: DesignPackage,
  type: DocumentType,
  rows: readonly TableRow[],
  columns: readonly TableColumn[],
  includeNumber = true,
): string | null {
  const active = columns.filter((column) => enabled(design, type, column.preferenceKey));
  if (active.length === 0) return null;
  if (rows.length === 0) return "（記載なし）";

  const headers = active.map((column) => escapeMarkdownCell(label(design, type, column.preferenceKey)));
  if (includeNumber) headers.unshift("No");
  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map((_, index) => includeNumber && index === 0 ? "---:" : "---").join(" | ")} |`,
  ];
  rows.forEach((row, index) => {
    const cells = active.map((column) => escapeMarkdownCell(row[column.dataKey] ?? ""));
    if (includeNumber) cells.unshift(String(index + 1));
    lines.push(`| ${cells.join(" | ")} |`);
  });
  return lines.join("\n");
}

function renderKeyValueTable(rows: readonly [string, string][]): string | null {
  if (rows.length === 0) return null;
  return [
    "| 項目 | 値 |",
    "| --- | --- |",
    ...rows.map(([key, value]) => `| ${escapeMarkdownCell(key)} | ${escapeMarkdownCell(value)} |`),
  ].join("\n");
}

function renderItemContentTable(rows: readonly [string, string][]): string | null {
  if (rows.length === 0) return null;
  return [
    "| 項目 | 内容 |",
    "| --- | --- |",
    ...rows.map(([key, value]) => `| ${escapeMarkdownCell(key)} | ${escapeMarkdownCell(value)} |`),
  ].join("\n");
}

function renderHist(design: DesignPackage, data: DocumentData): string {
  const table = renderConfiguredTable(design, "Hist", data.tables.history ?? [], [
    { preferenceKey: "history.creationDate", dataKey: "creationDate" },
    { preferenceKey: "history.author", dataKey: "author" },
    { preferenceKey: "history.revision", dataKey: "revision" },
    { preferenceKey: "history.sheet", dataKey: "sheet" },
    { preferenceKey: "history.note", dataKey: "note" },
    { preferenceKey: "history.approvalDate", dataKey: "approvalDate" },
    { preferenceKey: "history.approvedBy", dataKey: "approvedBy" },
  ], false);
  return [
    "## 改版履歴",
    "",
    "> 日付、Rev、Author が省略されている行は、直前行の値を引き継いで記載します。  ",
    "> 複数シートにまたがる変更は、Sheet列を変更対象シートごとに分けます。",
    table ? `\n${table}` : "",
  ].filter(Boolean).join("\n");
}

function renderOutlineA(design: DesignPackage, data: DocumentData): string {
  const parts: string[] = [];
  if (enabled(design, "Outline_A", "overview")) {
    parts.push(`## ${cleanHeading(label(design, "Outline_A", "overview"))}\n\n${bulletsOrMissing(data.text.overview ?? "")}`);
  }
  const scopeLines: string[] = [];
  if (enabled(design, "Outline_A", "scopeTarget")) {
    scopeLines.push(`- ${cleanHeading(label(design, "Outline_A", "scopeTarget"))}: ${missing(data.text.scopeTarget ?? "")}`);
  }
  if (enabled(design, "Outline_A", "scopeExcluded")) {
    scopeLines.push(`- ${cleanHeading(label(design, "Outline_A", "scopeExcluded"))}: ${missing(data.text.scopeExcluded ?? "")}`);
  }
  if (scopeLines.length > 0) parts.push(`## 対象範囲\n\n${scopeLines.join("\n")}`);
  return parts.join("\n\n");
}

function renderOutlineB(design: DesignPackage, data: DocumentData): string {
  const parts: string[] = [];
  if (enabled(design, "Outline_B", "processOverview")) {
    parts.push(`## ${cleanHeading(label(design, "Outline_B", "processOverview"))}\n\n${bulletsOrMissing(data.text.processOverview ?? "")}`);
  }
  const styleRows: Array<[string, string]> = [];
  for (const key of ["processingStyle", "executionMethod"] as const) {
    if (enabled(design, "Outline_B", key)) styleRows.push([label(design, "Outline_B", key), data.text[key] ?? ""]);
  }
  const styleTable = renderItemContentTable(styleRows);
  if (styleTable) parts.push(`## 処理形態説明\n\n${styleTable}`);

  const crud = renderConfiguredTable(design, "Outline_B", data.tables.crud ?? [], [
    { preferenceKey: "crud.logicalName", dataKey: "logicalName" },
    { preferenceKey: "crud.physicalName", dataKey: "physicalName" },
    { preferenceKey: "crud.category", dataKey: "category" },
    { preferenceKey: "crud.select", dataKey: "select" },
    { preferenceKey: "crud.insert", dataKey: "insert" },
    { preferenceKey: "crud.update", dataKey: "update" },
    { preferenceKey: "crud.delete", dataKey: "delete" },
  ]);
  if (crud) {
    parts.push([
      "## CRUD表",
      "",
      crud,
      "",
      "> 対象テーブルが増える場合は行を追加します。  ",
      "> View、Work、Temp、Master など、種別の粒度はプロジェクト標準に合わせてください。",
    ].join("\n"));
  }
  return parts.join("\n\n");
}

const SCREEN_COLUMNS: readonly TableColumn[] = [
  { preferenceKey: "items.itemName", dataKey: "itemName" },
  { preferenceKey: "items.type", dataKey: "type" },
  { preferenceKey: "items.io", dataKey: "io" },
  { preferenceKey: "items.length", dataKey: "length" },
  { preferenceKey: "items.required", dataKey: "required" },
  { preferenceKey: "items.screenMode1", dataKey: "screenMode1" },
  { preferenceKey: "items.screenMode2", dataKey: "screenMode2" },
  { preferenceKey: "items.screenMode3", dataKey: "screenMode3" },
  { preferenceKey: "items.notes", dataKey: "notes" },
  { preferenceKey: "items.focusMessage", dataKey: "focusMessage" },
];

function renderScreenLayout(design: DesignPackage, data: DocumentData): string {
  return data.sections.map((section, index) => {
    const parts = [`## ${sectionName(design, "S-Layout", section, index, "画面")}`];
    if (enabled(design, "S-Layout", "section.notes")) {
      parts.push(`### ${cleanHeading(label(design, "S-Layout", "section.notes"))}\n\n${bulletsOrMissing(section.fields.notes ?? "")}`);
    }
    const items = renderConfiguredTable(design, "S-Layout", section.tables.items ?? [], SCREEN_COLUMNS);
    if (items) parts.push(`### 画面項目\n\n${items}`);
    const footer = renderConfiguredTable(design, "S-Layout", section.tables.footer ?? [], SCREEN_COLUMNS);
    if (footer) parts.push(`### フッター\n\n${footer}`);
    return parts.join("\n\n");
  }).join("\n\n") || "## 画面\n\n（記載なし）";
}

function renderReportLayout(design: DesignPackage, data: DocumentData): string {
  const columns: readonly TableColumn[] = [
    { preferenceKey: "items.itemName", dataKey: "itemName" },
    { preferenceKey: "items.digits", dataKey: "digits" },
    { preferenceKey: "items.pageBreak", dataKey: "pageBreak" },
    { preferenceKey: "items.group", dataKey: "group" },
    { preferenceKey: "items.setting", dataKey: "setting" },
    { preferenceKey: "items.notes", dataKey: "notes" },
  ];
  return data.sections.map((section, index) => {
    const parts = [`## ${sectionName(design, "R-Layout", section, index, "帳票")}`];
    const overview: string[] = [];
    for (const key of ["section.overview", "section.outputTiming", "section.outputFormat"] as const) {
      if (!enabled(design, "R-Layout", key)) continue;
      const dataKey = key.split(".")[1];
      overview.push(`- ${cleanHeading(label(design, "R-Layout", key))}: ${missing(section.fields[dataKey] ?? "")}`);
    }
    if (overview.length > 0) parts.push(`### 帳票概要\n\n${overview.join("\n")}`);
    const table = renderConfiguredTable(design, "R-Layout", section.tables.items ?? [], columns);
    if (table) parts.push(`### 帳票項目\n\n${table}`);
    return parts.join("\n\n");
  }).join("\n\n") || "（記載なし）";
}

function renderFuncSpec(design: DesignPackage, data: DocumentData): string {
  return data.sections.map((section, sectionIndex) => {
    const parts = [`## ${sectionName(design, "FuncSpec", section, sectionIndex, "画面")}`];
    section.children.forEach((process, processIndex) => {
      const name = enabled(design, "FuncSpec", "processes.name")
        ? cleanHeading(process.name) || `処理${processIndex + 1}`
        : `処理${processIndex + 1}`;
      const content = enabled(design, "FuncSpec", "processes.content")
        ? process.fields.content?.trim() || "（未定義）"
        : "";
      parts.push(`### ${name}${content ? `\n\n${content}` : ""}`);
    });
    return parts.join("\n\n");
  }).join("\n\n") || "## 画面\n\n（記載なし）";
}

function renderEvent(design: DesignPackage, data: DocumentData): string {
  const columns: readonly TableColumn[] = [
    { preferenceKey: "events.eventName", dataKey: "eventName" },
    { preferenceKey: "events.control", dataKey: "control" },
    { preferenceKey: "events.timing", dataKey: "timing" },
    { preferenceKey: "events.inheritedMethod", dataKey: "inheritedMethod" },
    { preferenceKey: "events.summary", dataKey: "summary" },
  ];
  return data.sections.map((section, index) => {
    const table = renderConfiguredTable(design, "Event", section.tables.events ?? [], columns);
    return `## ${sectionName(design, "Event", section, index, "画面")}\n\n${table ?? "（記載なし）"}`;
  }).join("\n\n") || "## 画面\n\n（記載なし）";
}

function renderFuncDetail(design: DesignPackage, data: DocumentData): string {
  return data.sections.map((section, sectionIndex) => {
    const parts = [`## ${sectionName(design, "FuncDetail", section, sectionIndex, "画面")}`];
    if (enabled(design, "FuncDetail", "section.overview")) {
      parts.push(`**${cleanHeading(label(design, "FuncDetail", "section.overview"))}:** ${missing(section.fields.overview ?? "")}`);
    }
    section.children.forEach((process, processIndex) => {
      const name = enabled(design, "FuncDetail", "processes.name")
        ? cleanHeading(process.name) || `処理${processIndex + 1}`
        : `処理${processIndex + 1}`;
      const metadata: Array<[string, string]> = [];
      for (const key of ["functionName", "functionType", "summary", "referenceSheet", "notes"] as const) {
        const preferenceKey = `processes.${key}`;
        if (enabled(design, "FuncDetail", preferenceKey)) {
          metadata.push([label(design, "FuncDetail", preferenceKey), process.fields[key] ?? ""]);
        }
      }
      const table = renderItemContentTable(metadata);
      let content = `### ${name}`;
      if (table) content += `\n\n${table}`;
      if (enabled(design, "FuncDetail", "processes.steps") && process.fields.steps?.trim()) {
        content += `\n\n${process.fields.steps.trim()}`;
      }
      parts.push(content);
    });
    return parts.join("\n\n");
  }).join("\n\n") || "## 画面\n\n（記載なし）";
}

function renderRelation(design: DesignPackage, data: DocumentData): string {
  const columns: readonly TableColumn[] = [
    { preferenceKey: "mappings.sourceTable", dataKey: "sourceTable" },
    { preferenceKey: "mappings.sourceColumn", dataKey: "sourceColumn" },
    { preferenceKey: "mappings.sourceItem", dataKey: "sourceItem" },
    { preferenceKey: "mappings.destinationTable", dataKey: "destinationTable" },
    { preferenceKey: "mappings.destinationColumn", dataKey: "destinationColumn" },
    { preferenceKey: "mappings.destinationItem", dataKey: "destinationItem" },
    { preferenceKey: "mappings.notes", dataKey: "notes" },
  ];
  return data.sections.map((section, index) => {
    const parts = [`## ${sectionName(design, "Relation", section, index, "移送")}`];
    const metadata: Array<[string, string]> = [];
    for (const key of ["transferType", "condition", "sortOrder", "arguments"] as const) {
      const preferenceKey = `section.${key}`;
      if (enabled(design, "Relation", preferenceKey)) metadata.push([label(design, "Relation", preferenceKey), section.fields[key] ?? ""]);
    }
    if (enabled(design, "Relation", "section.name")) metadata.splice(1, 0, [label(design, "Relation", "section.name"), section.name]);
    const metadataTable = renderKeyValueTable(metadata);
    if (metadataTable) parts.push(metadataTable);
    if (enabled(design, "Relation", "section.sql")) {
      const sql = section.fields.sql?.trim();
      parts.push(`### ${cleanHeading(label(design, "Relation", "section.sql"))}\n\n${sql ? `\`\`\`sql\n${sql}\n\`\`\`` : "（記載なし）"}`);
    }
    const mappings = renderConfiguredTable(design, "Relation", section.tables.mappings ?? [], columns, false);
    if (mappings) parts.push(`### 移送元／移送先\n\n${mappings}`);
    return parts.join("\n\n");
  }).join("\n\n") || "## 移送\n\n（記載なし）";
}

function renderCheck(design: DesignPackage, data: DocumentData): string {
  const columns: readonly TableColumn[] = [
    { preferenceKey: "checks.checkItem", dataKey: "checkItem" },
    { preferenceKey: "checks.type", dataKey: "type" },
    { preferenceKey: "checks.detail", dataKey: "detail" },
    { preferenceKey: "checks.messageId", dataKey: "messageId" },
    { preferenceKey: "checks.messageArguments", dataKey: "messageArguments" },
    { preferenceKey: "checks.message", dataKey: "message" },
  ];
  return data.sections.map((section, index) => {
    const parts = [`## ${sectionName(design, "Check", section, index, "画面")}`];
    const metadata: Array<[string, string]> = [];
    if (enabled(design, "Check", "section.name")) metadata.push([label(design, "Check", "section.name"), section.name]);
    for (const key of ["checkName", "timing"] as const) {
      const preferenceKey = `section.${key}`;
      if (enabled(design, "Check", preferenceKey)) metadata.push([label(design, "Check", preferenceKey), section.fields[key] ?? ""]);
    }
    const metadataTable = renderKeyValueTable(metadata);
    if (metadataTable) parts.push(metadataTable);
    const checks = renderConfiguredTable(design, "Check", section.tables.checks ?? [], columns);
    if (checks) parts.push(checks);
    return parts.join("\n\n");
  }).join("\n\n") || "## 画面\n\n（記載なし）";
}

function renderOthers(design: DesignPackage, data: DocumentData): string {
  const parts: string[] = [];
  data.sections.forEach((section, index) => {
    const name = enabled(design, "Others", "sections.name")
      ? cleanHeading(section.name) || `定義${index + 1}`
      : `定義${index + 1}`;
    const language = enabled(design, "Others", "sections.language")
      ? (section.fields.language ?? "text").replace(/[^a-zA-Z0-9_+#-]/g, "") || "text"
      : "text";
    const code = enabled(design, "Others", "sections.code") ? section.fields.code?.trim() ?? "" : "";
    parts.push(`## ${name}\n\n\`\`\`${language}\n${code}\n\`\`\``);
  });
  if (enabled(design, "Others", "supplementalRules")) {
    parts.push(`## ${cleanHeading(label(design, "Others", "supplementalRules"))}\n\n${bulletsOrMissing(data.text.supplementalRules ?? "")}`);
  }
  return parts.join("\n\n");
}

function renderFootnote(design: DesignPackage, data: DocumentData): string {
  if (!enabled(design, "Footnote", "supplementalNotes")) return "";
  return `## ${cleanHeading(label(design, "Footnote", "supplementalNotes"))}\n\n${bulletsOrMissing(data.text.supplementalNotes ?? "")}\n\n> 補足説明がない場合は \`（記載なし）\` としてください。`;
}

export function buildDocumentMarkdown(
  design: DesignPackage,
  type: DocumentType,
  data: DocumentData,
): string {
  let body = "";
  switch (type) {
    case "Hist": body = renderHist(design, data); break;
    case "Outline_A": body = renderOutlineA(design, data); break;
    case "Outline_B": body = renderOutlineB(design, data); break;
    case "S-Layout": body = renderScreenLayout(design, data); break;
    case "R-Layout": body = renderReportLayout(design, data); break;
    case "FuncSpec": body = renderFuncSpec(design, data); break;
    case "Event": body = renderEvent(design, data); break;
    case "FuncDetail": body = renderFuncDetail(design, data); break;
    case "Relation": body = renderRelation(design, data); break;
    case "Check": body = renderCheck(design, data); break;
    case "Others": body = renderOthers(design, data); break;
    case "Footnote": body = renderFootnote(design, data); break;
  }
  return normalizeMarkdown(`${commonHeader(design, type)}${body ? `\n\n${body}` : ""}`);
}

/** Backward-compatible export used by older callers. */
export function buildDocumentMainContent(
  design: DesignPackage,
  type: DocumentType,
  data: DocumentData,
): string {
  return buildDocumentMarkdown(design, type, data).split("\n\n").slice(3).join("\n\n");
}
