import { describe, expect, it } from "vitest";
import { DOCUMENT_DEFINITIONS } from "../src/documentDefinitions";
import { BASIC_DOCUMENTS, DOCUMENT_TYPES } from "../src/model";
import { getAllTemplates, getReadmeTemplate } from "../src/templateLoader";

const COMMON_TOKENS = [
  "{{SYSTEM_NAME}}",
  "{{FUNCTION_ID}}",
  "{{FUNCTION_NAME}}",
  "{{GENERATED_AT}}",
  "{{MAIN_CONTENT}}",
];

describe("template validation", () => {
  it("loads README and all 12 document templates", () => {
    expect(getReadmeTemplate()).toContain("{{SHEET_INDEX_ROWS}}");
    expect(Object.keys(getAllTemplates())).toEqual([...DOCUMENT_TYPES]);
  });

  it("defines unique template and output paths", () => {
    const templatePaths = DOCUMENT_DEFINITIONS.map((definition) => definition.templatePath);
    const outputPaths = DOCUMENT_DEFINITIONS.map((definition) => definition.outputPath);
    expect(new Set(templatePaths).size).toBe(DOCUMENT_DEFINITIONS.length);
    expect(new Set(outputPaths).size).toBe(DOCUMENT_DEFINITIONS.length);
  });

  it("marks exactly the basic six documents as defaults", () => {
    const defaults = DOCUMENT_DEFINITIONS
      .filter((definition) => definition.selectedByDefault)
      .map((definition) => definition.type);
    expect(defaults).toEqual([...BASIC_DOCUMENTS]);
  });

  it("contains common tokens and one configurable main-content token", () => {
    for (const template of Object.values(getAllTemplates())) {
      for (const token of COMMON_TOKENS) {
        expect(template).toContain(token);
      }
      expect(template).toContain("## 4. 設計内容");
      expect(template.match(/{{MAIN_CONTENT}}/g)).toHaveLength(1);
    }
  });
});
