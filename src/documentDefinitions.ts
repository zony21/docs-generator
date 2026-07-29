import type { DocumentType } from "./model";

export interface DocumentDefinition {
  type: DocumentType;
  displayName: string;
  templatePath: string;
  outputPath: string;
  selectedByDefault: boolean;
  order: number;
}

export const DOCUMENT_DEFINITIONS: readonly DocumentDefinition[] = [
  { type: "Hist", displayName: "改訂履歴", templatePath: "templates/sheets/Hist.md", outputPath: "sheets/Hist.md", selectedByDefault: true, order: 10 },
  { type: "Outline_A", displayName: "概要A", templatePath: "templates/sheets/Outline_A.md", outputPath: "sheets/Outline_A.md", selectedByDefault: true, order: 20 },
  { type: "Outline_B", displayName: "概要B", templatePath: "templates/sheets/Outline_B.md", outputPath: "sheets/Outline_B.md", selectedByDefault: true, order: 30 },
  { type: "S-Layout", displayName: "画面レイアウト", templatePath: "templates/sheets/S-Layout.md", outputPath: "sheets/S-Layout.md", selectedByDefault: false, order: 40 },
  { type: "R-Layout", displayName: "帳票レイアウト", templatePath: "templates/sheets/R-Layout.md", outputPath: "sheets/R-Layout.md", selectedByDefault: false, order: 50 },
  { type: "FuncSpec", displayName: "機能仕様", templatePath: "templates/sheets/FuncSpec.md", outputPath: "sheets/FuncSpec.md", selectedByDefault: true, order: 60 },
  { type: "Event", displayName: "イベント定義", templatePath: "templates/sheets/Event.md", outputPath: "sheets/Event.md", selectedByDefault: false, order: 70 },
  { type: "FuncDetail", displayName: "機能詳細", templatePath: "templates/sheets/FuncDetail.md", outputPath: "sheets/FuncDetail.md", selectedByDefault: true, order: 80 },
  { type: "Relation", displayName: "データ関連", templatePath: "templates/sheets/Relation.md", outputPath: "sheets/Relation.md", selectedByDefault: true, order: 90 },
  { type: "Check", displayName: "チェック仕様", templatePath: "templates/sheets/Check.md", outputPath: "sheets/Check.md", selectedByDefault: false, order: 100 },
  { type: "Others", displayName: "その他定義", templatePath: "templates/sheets/Others.md", outputPath: "sheets/Others.md", selectedByDefault: false, order: 110 },
  { type: "Footnote", displayName: "注釈・用語", templatePath: "templates/sheets/Footnote.md", outputPath: "sheets/Footnote.md", selectedByDefault: false, order: 120 },
] as const;

export function getDocumentDefinition(type: DocumentType): DocumentDefinition {
  const definition = DOCUMENT_DEFINITIONS.find((item) => item.type === type);
  if (!definition) {
    throw new Error(`Unknown document type: ${type}`);
  }
  return definition;
}

export function sortDocumentTypes(types: readonly DocumentType[]): DocumentType[] {
  const selected = new Set(types);
  return DOCUMENT_DEFINITIONS
    .filter((definition) => selected.has(definition.type))
    .map((definition) => definition.type);
}
