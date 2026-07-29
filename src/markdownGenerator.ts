import { getDocumentDefinition, sortDocumentTypes } from "./documentDefinitions";
import { imageAssetPath, isLayoutDocument } from "./imageAssets";
import type { DesignPackage, DocumentType } from "./model";
import { documentSpecificTokens } from "./markdownTokens";
import {
  commonTokens,
  findUnresolvedTokens,
  normalizeMarkdown,
  packageRootName,
  replaceTokens,
  summaryTokens,
} from "./markdownUtils";
import { getDocumentTemplate, getReadmeTemplate } from "./templateLoader";

export { escapeMarkdownCell, findUnresolvedTokens, markdownTableRows, numberedList, packageRootName, replaceTokens, sanitizePackageName, sqlCodeBlock } from "./markdownUtils";

export interface GeneratedTextFile { kind: "text"; path: string; content: string }
export interface GeneratedBinaryFile { kind: "binary"; path: string; content: File }
export type GeneratedFile = GeneratedTextFile | GeneratedBinaryFile;
export interface GenerationResult { rootDirectory: string; files: GeneratedFile[] }

export function validateDesignPackage(design: DesignPackage): string[] {
  const errors: string[] = [];
  const required: Array<[string, string]> = [
    ["システム名", design.common.systemName],
    ["機能ID", design.common.functionId],
    ["機能名", design.common.functionName],
    ["作成日", design.common.date],
    ["Rev", design.common.revision],
    ["作成者", design.common.author],
  ];
  for (const [label, value] of required) if (!value.trim()) errors.push(`${label}を入力してください。`);
  if (design.selectedDocuments.length === 0) errors.push("作成する設計書を1件以上選択してください。");
  if (!packageRootName(design)) errors.push("出力フォルダ名を作成できません。機能IDと機能名を確認してください。");
  for (const type of ["S-Layout", "R-Layout"] as const) {
    for (const image of design.documents[type].images) {
      if (!image.file) errors.push(`${type}の画像「${image.title || image.outputFileName}」を再選択してください。`);
    }
  }
  return errors;
}

function filterFuncDetailReferences(content: string, selected: ReadonlySet<DocumentType>): string {
  return content.split("\n").filter((line) => {
    if (line.startsWith("- Check:")) return selected.has("Check");
    if (line.startsWith("- Others:")) return selected.has("Others");
    if (line.startsWith("- Relation:")) return selected.has("Relation");
    return true;
  }).join("\n");
}

function assertResolved(label: string, content: string): void {
  const unresolved = findUnresolvedTokens(content);
  if (unresolved.length > 0) throw new Error(`${label}: 未置換トークンがあります: ${unresolved.join(", ")}`);
}

function buildDocument(design: DesignPackage, type: DocumentType, generatedAt: string): GeneratedTextFile {
  const data = design.documents[type];
  let content = replaceTokens(getDocumentTemplate(type), {
    ...commonTokens(design, generatedAt),
    ...summaryTokens(type),
    ...documentSpecificTokens(type, data),
  });
  if (type === "FuncDetail") {
    content = normalizeMarkdown(filterFuncDetailReferences(content, new Set(design.selectedDocuments)));
  }
  assertResolved(type, content);
  return { kind: "text", path: getDocumentDefinition(type).outputPath, content };
}

function buildReadme(design: DesignPackage, selected: readonly DocumentType[], generatedAt: string): GeneratedTextFile {
  const sheetRows = selected.map((type) => `| ${type} | [sheets/${type}.md](sheets/${type}.md) |`).join("\n");
  const packageNotes = [design.common.summary, design.common.notes].filter((value) => value.trim()).join("\n\n");
  const content = replaceTokens(getReadmeTemplate(), {
    ...commonTokens(design, generatedAt),
    SHEET_INDEX_ROWS: sheetRows,
    PACKAGE_NOTES: packageNotes,
  });
  assertResolved("README", content);
  return { kind: "text", path: "README.md", content };
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
  const textFiles = [buildReadme(design, selected, generatedAt), ...selected.map((type) => buildDocument(design, type, generatedAt))];
  const binaryFiles: GeneratedBinaryFile[] = [];
  for (const type of selected) {
    if (!isLayoutDocument(type)) continue;
    for (const image of [...design.documents[type].images].sort((a, b) => a.order - b.order)) {
      if (image.file) binaryFiles.push({ kind: "binary", path: imageAssetPath(type, image), content: image.file });
    }
  }
  const paths = new Set([...textFiles, ...binaryFiles].map((file) => file.path));
  for (const type of selected) {
    if (!isLayoutDocument(type)) continue;
    for (const image of design.documents[type].images) {
      if (image.file && !paths.has(imageAssetPath(type, image))) throw new Error(`${type}: 画像参照先が出力対象にありません。`);
    }
  }
  return { rootDirectory: packageRootName(design), files: [...textFiles, ...binaryFiles] };
}
