import type { DesignPackage, DocumentData, GroupItem, TableRow } from "./model";

const TOKEN_PATTERN = /{{[A-Z0-9_]+}}/g;
const INVALID_PATH_CHARACTERS = /[\\/:*?"<>|]/g;

export function normalizeMarkdown(content: string): string {
  return `${content.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}

export function sanitizePackageName(value: string): string {
  return value.replace(INVALID_PATH_CHARACTERS, "_").trim();
}

export function packageRootName(design: DesignPackage): string {
  return sanitizePackageName(`${design.common.functionId}_${design.common.functionName}`);
}

export function replaceTokens(template: string, values: Readonly<Record<string, string>>): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return normalizeMarkdown(result);
}

export function findUnresolvedTokens(content: string): string[] {
  return [...new Set(content.match(TOKEN_PATTERN) ?? [])];
}

export function escapeMarkdownCell(value: string): string {
  return value.replace(/\r?\n/g, "<br>").replace(/\|/g, "\\|");
}

export function markdownTableRows(rows: readonly TableRow[], keys: readonly string[], includeNumber = false): string {
  return rows.map((row, index) => {
    const cells = keys.map((key) => escapeMarkdownCell(row[key] ?? ""));
    if (includeNumber) cells.unshift(String(index + 1));
    return `| ${cells.join(" | ")} |`;
  }).join("\n");
}

export function numberedList(value: string): string {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    .map((line, index) => `${index + 1}. ${line}`).join("\n");
}

export function sqlCodeBlock(sql: string): string {
  return sql.trim() ? `\`\`\`sql\n${sql.replace(/\s+$/, "")}\n\`\`\`` : "";
}

export function commonTokens(design: DesignPackage, generatedAt: string): Record<string, string> {
  const value = design.common;
  return {
    SYSTEM_NAME: value.systemName,
    MODULE_NAME: value.moduleName,
    MODULE_ID: value.moduleId,
    FUNCTION_ID: value.functionId,
    FUNCTION_NAME: value.functionName,
    DATE: value.date,
    REVISION: value.revision,
    DOC_NUMBER: value.documentNumber,
    AUTHOR: value.author,
    GENERATED_AT: generatedAt,
  };
}

export function summaryTokens(data: DocumentData): Record<string, string> {
  return {
    SHEET_TITLE: data.summary.sheetTitle,
    SCREEN_COMPONENT_NAME: data.summary.screenComponentName,
    EVENT_CHECK_FUNCTION_NAME: data.summary.eventCheckFunctionName,
    TIMING: data.summary.timing,
    NOTES: data.summary.notes,
  };
}

export function textValue(data: DocumentData, key: string): string {
  return data.text[key] ?? "";
}

export function tableRows(data: DocumentData, key: string): TableRow[] {
  return data.tables[key] ?? [];
}

export function groupItems(data: DocumentData, key: string): GroupItem[] {
  return data.groups[key] ?? [];
}

export function optionalBullet(label: string, value: string): string {
  return value.trim() ? `- ${label}: ${value}` : "";
}
