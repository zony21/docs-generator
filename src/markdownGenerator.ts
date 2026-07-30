import { buildDocumentMarkdown } from "./documentContentBuilder";
import { DOCUMENT_DEFINITIONS, getDocumentDefinition, sortDocumentTypes } from "./documentDefinitions";
import type { DesignPackage, DocumentType } from "./model";
import {
  commonTokens,
  findUnresolvedTokens,
  normalizeMarkdown,
  packageRootName,
  replaceTokens,
} from "./markdownUtils";
import { getReadmeTemplate, getTemplateGuide } from "./templateLoader";

export {
  bulletList,
  escapeMarkdownCell,
  findUnresolvedTokens,
  markdownTableRows,
  numberedList,
  packageRootName,
  replaceTokens,
  sanitizePackageName,
  sqlCodeBlock,
} from "./markdownUtils";

export interface GeneratedTextFile { kind: "text"; path: string; content: string }
export interface GeneratedBinaryFile { kind: "binary"; path: string; content: File }
export type GeneratedFile = GeneratedTextFile | GeneratedBinaryFile;
export interface GenerationResult { rootDirectory: string; files: GeneratedFile[] }

export function validateDesignPackage(design: DesignPackage): string[] {
  const errors: string[] = [];
  const required: Array<[string, string]> = [
    ["システム名", design.common.systemName],
    ["モジュール名", design.common.moduleName],
    ["モジュールID", design.common.moduleId],
    ["文書日付", design.common.date],
    ["Rev", design.common.revision],
    ["作成者", design.common.author],
  ];
  for (const [fieldLabel, value] of required) {
    if (!value.trim()) errors.push(`${fieldLabel}を入力してください。`);
  }
  if (design.selectedDocuments.length === 0) errors.push("作成する設計書を1件以上選択してください。");
  if (!packageRootName(design)) errors.push("出力フォルダ名を作成できません。モジュールIDとモジュール名を確認してください。");
  return errors;
}

function assertResolved(fileLabel: string, content: string): void {
  const unresolved = findUnresolvedTokens(content);
  if (unresolved.length > 0) throw new Error(`${fileLabel}: 未置換トークンがあります: ${unresolved.join(", ")}`);
}

function buildDocument(design: DesignPackage, type: DocumentType): GeneratedTextFile {
  const content = buildDocumentMarkdown(design, type, design.documents[type]);
  assertResolved(type, content);
  return { kind: "text", path: getDocumentDefinition(type).outputPath, content };
}

function readmeTable(selected: readonly DocumentType[]): string {
  const selectedSet = new Set(selected);
  const rows = DOCUMENT_DEFINITIONS
    .filter((definition) => selectedSet.has(definition.type))
    .map((definition, index) =>
      `| ${index + 1} | [${definition.outputPath}](${definition.outputPath}) | ${definition.purpose} | ${definition.incrementUnit} |`,
    );
  return [
    "| No. | Markdown | 用途 | 増やす単位 |",
    "| ---: | --- | --- | --- |",
    ...rows,
  ].join("\n");
}

function buildReadme(design: DesignPackage, selected: readonly DocumentType[], generatedAt: string): GeneratedTextFile {
  const template = getReadmeTemplate();
  const withSelectedFiles = template.replace(
    /\| No\. \| Markdown \| 用途 \| 増やす単位 \|[\s\S]*?(?=\n\n## 注意事項)/,
    readmeTable(selected),
  );
  const content = replaceTokens(withSelectedFiles, commonTokens(design, generatedAt));
  assertResolved("README", content);
  return { kind: "text", path: "README.md", content };
}

function buildTemplateGuide(): GeneratedTextFile {
  return { kind: "text", path: "TEMPLATE_GUIDE.md", content: normalizeMarkdown(getTemplateGuide()) };
}

export function generateDesignPackage(
  design: DesignPackage,
  generatedAt = new Date().toISOString(),
  options: { validate?: boolean } = {},
): GenerationResult {
  if (options.validate !== false) {
    const errors = validateDesignPackage(design);
    if (errors.length > 0) throw new Error(errors.join("\n"));
  }
  const selected = sortDocumentTypes(design.selectedDocuments);
  const files: GeneratedFile[] = [
    buildReadme(design, selected, generatedAt),
    buildTemplateGuide(),
    ...selected.map((type) => buildDocument(design, type)),
  ];
  const paths = files.map((file) => file.path);
  if (new Set(paths).size !== paths.length) throw new Error("出力ファイル名が重複しています。");
  return { rootDirectory: packageRootName(design), files };
}
