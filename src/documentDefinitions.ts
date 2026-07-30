import type { DocumentType } from "./model";

export interface DocumentDefinition {
  type: DocumentType;
  displayName: string;
  templatePath: string;
  outputPath: string;
  selectedByDefault: boolean;
  order: number;
  purpose: string;
  incrementUnit: string;
}

export const DOCUMENT_DEFINITIONS: readonly DocumentDefinition[] = [
  { type: "Hist", displayName: "改版履歴", templatePath: "templates/sheets/Hist.md", outputPath: "Hist.md", selectedByDefault: true, order: 10, purpose: "改版履歴", incrementUnit: "改版行" },
  { type: "Outline_A", displayName: "機能概要", templatePath: "templates/sheets/Outline_A.md", outputPath: "Outline_A.md", selectedByDefault: true, order: 20, purpose: "機能概要", incrementUnit: "概要項目" },
  { type: "Outline_B", displayName: "処理概要・CRUD", templatePath: "templates/sheets/Outline_B.md", outputPath: "Outline_B.md", selectedByDefault: true, order: 30, purpose: "処理概要、処理形態、CRUD", incrementUnit: "処理概要、CRUD対象テーブル" },
  { type: "S-Layout", displayName: "画面レイアウト", templatePath: "templates/sheets/S-Layout.md", outputPath: "S-Layout.md", selectedByDefault: false, order: 40, purpose: "画面レイアウト、画面項目、フッター", incrementUnit: "画面単位" },
  { type: "R-Layout", displayName: "帳票レイアウト", templatePath: "templates/sheets/R-Layout.md", outputPath: "R-Layout.md", selectedByDefault: false, order: 50, purpose: "帳票レイアウト", incrementUnit: "帳票単位" },
  { type: "FuncSpec", displayName: "機能仕様", templatePath: "templates/sheets/FuncSpec.md", outputPath: "FuncSpec.md", selectedByDefault: true, order: 60, purpose: "機能仕様", incrementUnit: "画面単位、ボタン単位、処理単位" },
  { type: "Event", displayName: "イベント一覧", templatePath: "templates/sheets/Event.md", outputPath: "Event.md", selectedByDefault: false, order: 70, purpose: "イベント一覧", incrementUnit: "画面単位、イベント単位" },
  { type: "FuncDetail", displayName: "機能詳細説明", templatePath: "templates/sheets/FuncDetail.md", outputPath: "FuncDetail.md", selectedByDefault: true, order: 80, purpose: "機能詳細説明", incrementUnit: "処理名称、関数単位" },
  { type: "Relation", displayName: "DB I/O・項目相関", templatePath: "templates/sheets/Relation.md", outputPath: "Relation.md", selectedByDefault: true, order: 90, purpose: "DB I/O定義、SQL、項目相関", incrementUnit: "移送区分、SQL、テーブル単位" },
  { type: "Check", displayName: "画面チェック仕様", templatePath: "templates/sheets/Check.md", outputPath: "Check.md", selectedByDefault: false, order: 100, purpose: "画面チェック仕様", incrementUnit: "画面単位、チェック単位" },
  { type: "Others", displayName: "定数・補助説明", templatePath: "templates/sheets/Others.md", outputPath: "Others.md", selectedByDefault: false, order: 110, purpose: "定数、Function配列、補助説明", incrementUnit: "定数分類、設定分類" },
  { type: "Footnote", displayName: "補足説明", templatePath: "templates/sheets/Footnote.md", outputPath: "Footnote.md", selectedByDefault: false, order: 120, purpose: "補足説明", incrementUnit: "補足項目" },
] as const;

export function getDocumentDefinition(type: DocumentType): DocumentDefinition {
  const definition = DOCUMENT_DEFINITIONS.find((item) => item.type === type);
  if (!definition) throw new Error(`Unknown document type: ${type}`);
  return definition;
}

export function sortDocumentTypes(types: readonly DocumentType[]): DocumentType[] {
  const selected = new Set(types);
  return DOCUMENT_DEFINITIONS
    .filter((definition) => selected.has(definition.type))
    .map((definition) => definition.type);
}
