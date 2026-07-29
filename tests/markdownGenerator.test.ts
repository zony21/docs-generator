import { describe, expect, it } from "vitest";
import {
  escapeMarkdownCell,
  findUnresolvedTokens,
  generateDesignPackage,
  markdownTableRows,
  numberedList,
  packageRootName,
  sqlCodeBlock,
} from "../src/markdownGenerator";
import { createDefaultDesignPackage, DOCUMENT_TYPES } from "../src/model";

function validDesign() {
  const design = createDefaultDesignPackage();
  Object.assign(design.common, {
    systemName: "SES-APP",
    moduleName: "契約管理",
    moduleId: "KY",
    functionId: "KY01",
    functionName: "契約一覧",
    summary: "契約を検索し一覧表示する。",
    author: "久野",
  });
  return design;
}

describe("markdown generator", () => {
  it("escapes tables without changing input order", () => {
    expect(escapeMarkdownCell("A|B\nC")).toBe("A\\|B<br>C");
    expect(markdownTableRows([
      { name: "first", value: "1" },
      { name: "second", value: "2" },
    ], ["name", "value"])).toBe("| first | 1 |\n| second | 2 |");
  });

  it("creates numbered lists and SQL fences", () => {
    expect(numberedList("入力\n\n検索\n表示")).toBe("1. 入力\n2. 検索\n3. 表示");
    expect(sqlCodeBlock("SELECT *\n  FROM T")).toBe("```sql\nSELECT *\n  FROM T\n```");
    expect(sqlCodeBlock(" ")).toBe("");
  });

  it("generates README and the basic six documents", () => {
    const design = validDesign();
    design.documents.Outline_A.text.operationFlow = "条件入力\n検索\n一覧表示";
    design.documents.Outline_B.tables.crud = [{ category: "Read", description: "契約一覧を取得" }];
    design.documents.Relation.groups.relations = [{
      sourceName: "T_CONTRACT",
      sourceCondition: "有効な契約",
      destinationName: "契約一覧DTO",
      destinationCondition: "表示対象",
      sql: "SELECT *\nFROM T_CONTRACT",
      notes: "",
    }];

    const result = generateDesignPackage(design, "2026-07-29T06:30:00.000Z");
    const textFiles = result.files.filter((file) => file.kind === "text");
    expect(result.rootDirectory).toBe("KY01_契約一覧");
    expect(textFiles.map((file) => file.path)).toEqual([
      "README.md",
      "sheets/Hist.md",
      "sheets/Outline_A.md",
      "sheets/Outline_B.md",
      "sheets/FuncSpec.md",
      "sheets/FuncDetail.md",
      "sheets/Relation.md",
    ]);
    expect(textFiles[0].content).toContain("[sheets/Relation.md](sheets/Relation.md)");
    expect(textFiles.find((file) => file.path === "sheets/Outline_A.md")?.content).toContain("1. 条件入力");
    expect(textFiles.find((file) => file.path === "sheets/Relation.md")?.content).toContain("```sql\nSELECT *\nFROM T_CONTRACT\n```");
    for (const file of textFiles) {
      expect(findUnresolvedTokens(file.content)).toEqual([]);
    }
  });

  it("generates all selected documents in the defined order", () => {
    const design = validDesign();
    design.selectedDocuments = [...DOCUMENT_TYPES];
    const result = generateDesignPackage(design);
    const paths = result.files.filter((file) => file.kind === "text").map((file) => file.path);
    expect(paths).toEqual(["README.md", ...DOCUMENT_TYPES.map((type) => `sheets/${type}.md`)]);
  });

  it("removes unselected cross references", () => {
    const design = validDesign();
    design.selectedDocuments = ["FuncDetail"];
    const result = generateDesignPackage(design);
    const detail = result.files.find((file) => file.path === "sheets/FuncDetail.md");
    expect(detail?.kind).toBe("text");
    if (detail?.kind === "text") {
      expect(detail.content).not.toContain("Check.md");
      expect(detail.content).not.toContain("Others.md");
      expect(detail.content).not.toContain("Relation.md");
    }
  });

  it("sanitizes the package root name", () => {
    const design = validDesign();
    design.common.functionName = "契約/一覧:検索";
    expect(packageRootName(design)).toBe("KY01_契約_一覧_検索");
  });
});
