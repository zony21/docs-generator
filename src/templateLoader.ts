import readmeTemplate from "../templates/README_TEMPLATE.md?raw";
import checkTemplate from "../templates/sheets/Check.md?raw";
import eventTemplate from "../templates/sheets/Event.md?raw";
import footnoteTemplate from "../templates/sheets/Footnote.md?raw";
import funcDetailTemplate from "../templates/sheets/FuncDetail.md?raw";
import funcSpecTemplate from "../templates/sheets/FuncSpec.md?raw";
import histTemplate from "../templates/sheets/Hist.md?raw";
import othersTemplate from "../templates/sheets/Others.md?raw";
import outlineATemplate from "../templates/sheets/Outline_A.md?raw";
import outlineBTemplate from "../templates/sheets/Outline_B.md?raw";
import reportLayoutTemplate from "../templates/sheets/R-Layout.md?raw";
import relationTemplate from "../templates/sheets/Relation.md?raw";
import screenLayoutTemplate from "../templates/sheets/S-Layout.md?raw";
import type { DocumentType } from "./model";

function prepareDocumentTemplate(template: string): string {
  const mainContentMarker = "## 4. Main content";
  const markerIndex = template.indexOf(mainContentMarker);
  if (markerIndex < 0) throw new Error("設計書テンプレートにMain contentセクションがありません。");

  const metadata = template.slice(0, markerIndex)
    .replace("## 1. Document metadata", "## 1. 文書メタデータ")
    .replace("- Package:", "- パッケージ:")
    .replace("- Document:", "- 設計書:")
    .replace("- File:", "- ファイル:")
    .replace("- Generated at:", "- 生成日時:")
    .replace("## 2. Common metadata", "## 2. 共通情報")
    .replace("- System Name:", "- システム名:")
    .replace("- Module Name:", "- モジュール名:")
    .replace("- Module ID:", "- モジュールID:")
    .replace("- Function ID:", "- 機能ID:")
    .replace("- Function Name:", "- 機能名:")
    .replace("- Date:", "- 作成日:")
    .replace("- Doc Number:", "- 文書番号:")
    .replace("- Author:", "- 作成者:")
    .replace("## 3. Document summary", "## 3. シートサマリー")
    .replace("- Title:", "- タイトル:")
    .replace("- Screen / component name:", "- 画面・コンポーネント名:")
    .replace("- Event / check / function name:", "- イベント・チェック・機能名:")
    .replace("- Timing:", "- タイミング:")
    .replace("- Notes:", "- 備考:");

  return `${metadata}## 4. 設計内容\n\n{{MAIN_CONTENT}}\n`;
}

const DOCUMENT_TEMPLATES: Record<DocumentType, string> = {
  Hist: prepareDocumentTemplate(histTemplate),
  Outline_A: prepareDocumentTemplate(outlineATemplate),
  Outline_B: prepareDocumentTemplate(outlineBTemplate),
  "S-Layout": prepareDocumentTemplate(screenLayoutTemplate),
  "R-Layout": prepareDocumentTemplate(reportLayoutTemplate),
  FuncSpec: prepareDocumentTemplate(funcSpecTemplate),
  Event: prepareDocumentTemplate(eventTemplate),
  FuncDetail: prepareDocumentTemplate(funcDetailTemplate),
  Relation: prepareDocumentTemplate(relationTemplate),
  Check: prepareDocumentTemplate(checkTemplate),
  Others: prepareDocumentTemplate(othersTemplate),
  Footnote: prepareDocumentTemplate(footnoteTemplate),
};

export function getReadmeTemplate(): string {
  return readmeTemplate;
}

export function getDocumentTemplate(type: DocumentType): string {
  return DOCUMENT_TEMPLATES[type];
}

export function getAllTemplates(): Readonly<Record<DocumentType, string>> {
  return DOCUMENT_TEMPLATES;
}
