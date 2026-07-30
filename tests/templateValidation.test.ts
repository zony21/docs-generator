import { describe, expect, it } from "vitest";
import { DOCUMENT_DEFINITIONS } from "../src/documentDefinitions";
import { BASIC_DOCUMENTS, DOCUMENT_TYPES } from "../src/model";
import { getAllTemplates, getReadmeTemplate, getTemplateGuide } from "../src/templateLoader";

describe("authoritative template validation", () => {
  it("loads README, guide, and all 12 authoritative templates", () => {
    expect(getReadmeTemplate()).toContain("設計書 Markdown テンプレート");
    expect(getTemplateGuide()).toContain("セクション増減の考え方");
    expect(Object.keys(getAllTemplates())).toEqual([...DOCUMENT_TYPES]);
  });

  it("uses root-level output paths matching README links", () => {
    for (const definition of DOCUMENT_DEFINITIONS) {
      expect(definition.outputPath).toBe(`${definition.type}.md`);
    }
  });

  it("marks exactly the basic six documents as defaults", () => {
    expect(DOCUMENT_DEFINITIONS.filter((definition) => definition.selectedByDefault).map((definition) => definition.type)).toEqual([...BASIC_DOCUMENTS]);
  });

  it("preserves the key authoritative structures", () => {
    const templates = getAllTemplates();
    expect(templates["S-Layout"]).toContain("### 画面項目");
    expect(templates["S-Layout"]).toContain("### フッター");
    expect(templates.FuncDetail).toContain("| 参照Sheet |");
    expect(templates.Relation).toContain("### 移送元／移送先");
    expect(templates.Check).toContain("メッセージ引数 | メッセージ");
    expect(templates.Outline_B).toContain("## CRUD表");
  });
});
