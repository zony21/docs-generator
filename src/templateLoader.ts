import readmeTemplate from "../templates/README_TEMPLATE.md?raw";
import templateGuide from "../templates/TEMPLATE_GUIDE.md?raw";
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

const DOCUMENT_TEMPLATES: Record<DocumentType, string> = {
  Hist: histTemplate,
  Outline_A: outlineATemplate,
  Outline_B: outlineBTemplate,
  "S-Layout": screenLayoutTemplate,
  "R-Layout": reportLayoutTemplate,
  FuncSpec: funcSpecTemplate,
  Event: eventTemplate,
  FuncDetail: funcDetailTemplate,
  Relation: relationTemplate,
  Check: checkTemplate,
  Others: othersTemplate,
  Footnote: footnoteTemplate,
};

export function getReadmeTemplate(): string {
  return readmeTemplate;
}

export function getTemplateGuide(): string {
  return templateGuide;
}

export function getDocumentTemplate(type: DocumentType): string {
  return DOCUMENT_TEMPLATES[type];
}

export function getAllTemplates(): Readonly<Record<DocumentType, string>> {
  return DOCUMENT_TEMPLATES;
}
