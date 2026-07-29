import { describe, expect, it } from "vitest";
import { setInputFieldPreference } from "../src/inputFieldDefinitions";
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

function textFileContent(design: ReturnType<typeof validDesign>, path: string): string {
  const file = generateDesignPackage(design).files.find((candidate) => candidate.path === path);
  expect(file?.kind).toBe("text");
  return file?.kind === "text" ? file.content : "";
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
    expect(textFiles.find((file) => file.path === "sheets/Hist.md")?.content).toContain("- タイトル: 改版履歴 History");
    expect(textFiles.find((file) => file.path === "sheets/Outline_A.md")?.content).toContain("1. 条件入力");
    expect(textFiles.find((file) => file.path === "sheets/Relation.md")?.content).toContain("- イベント・チェック・機能名: Data transfer / I/O mapping");
    expect(textFiles.find((file) => file.path === "sheets/Relation.md")?.content).toContain("```sql\nSELECT *\nFROM T_CONTRACT\n```");
    for (const file of textFiles) {
      expect(findUnresolvedTokens(file.content)).toEqual([]);
    }
  });

  it("uses edited sheet summaries", () => {
    const design = validDesign();
    design.selectedDocuments = ["FuncDetail"];
    design.documents.FuncDetail.summary.sheetTitle = "受信処理の機能詳細";
    design.documents.FuncDetail.summary.timing = "メッセージ受信時";
    const detail = textFileContent(design, "sheets/FuncDetail.md");
    expect(detail).toContain("- タイトル: 受信処理の機能詳細");
    expect(detail).toContain("- タイミング: メッセージ受信時");
  });

  it("omits disabled text fields and uses edited Japanese labels", () => {
    const design = validDesign();
    design.selectedDocuments = ["Outline_A"];
    design.documents.Outline_A.text.purpose = "出力してはいけない目的";
    design.documents.Outline_A.text.scopeTarget = "契約管理担当者";
    setInputFieldPreference(design, "Outline_A", "purpose", { label: "目的", enabled: false });
    setInputFieldPreference(design, "Outline_A", "scopeTarget", { label: "利用対象", enabled: true });

    const outline = textFileContent(design, "sheets/Outline_A.md");
    expect(outline).not.toContain("出力してはいけない目的");
    expect(outline).not.toContain("### 4.1 目的");
    expect(outline).toContain("### 4.1 利用対象");
    expect(outline).toContain("契約管理担当者");
  });

  it("omits disabled table columns and removes a table when all columns are disabled", () => {
    const design = validDesign();
    design.selectedDocuments = ["Outline_B"];
    design.documents.Outline_B.tables.crud = [{ category: "Read", description: "契約一覧を取得" }];
    design.documents.Outline_B.tables.resources = [{ type: "Table", name: "T_CONTRACT", notes: "契約" }];
    setInputFieldPreference(design, "Outline_B", "crud.category", { label: "区分", enabled: false });
    setInputFieldPreference(design, "Outline_B", "crud.description", { label: "処理内容", enabled: true });
    for (const key of ["resources.type", "resources.name", "resources.notes"]) {
      setInputFieldPreference(design, "Outline_B", key, { label: key, enabled: false });
    }

    const outline = textFileContent(design, "sheets/Outline_B.md");
    expect(outline).toContain("| 処理内容 |");
    expect(outline).toContain("| 契約一覧を取得 |");
    expect(outline).not.toContain("| 区分 |");
    expect(outline).not.toContain("Read");
    expect(outline).not.toContain("関連テーブル・マスタ・インターフェース");
    expect(outline).not.toContain("T_CONTRACT");
  });

  it("does not leak disabled group values", () => {
    const design = validDesign();
    design.selectedDocuments = ["FuncDetail"];
    design.documents.FuncDetail.groups.units = [{
      processingName: "非表示処理名",
      methodName: "handleRequest",
      functionType: "service",
      summary: "受信処理",
      normalFlow: "通常処理",
      exceptionFlow: "例外処理",
      finallyFlow: "終了処理",
      relatedDocuments: "Relation.md",
    }];
    setInputFieldPreference(design, "FuncDetail", "units.processingName", { label: "処理名", enabled: false });
    setInputFieldPreference(design, "FuncDetail", "units.methodName", { label: "メソッド", enabled: true });
    setInputFieldPreference(design, "FuncDetail", "units.exceptionFlow", { label: "異常時", enabled: false });

    const detail = textFileContent(design, "sheets/FuncDetail.md");
    expect(detail).not.toContain("非表示処理名");
    expect(detail).not.toContain("例外処理");
    expect(detail).toContain("- メソッド: handleRequest");
    expect(detail).toContain("**通常処理（try）**");
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
    const detail = textFileContent(design, "sheets/FuncDetail.md");
    expect(detail).not.toContain("Check.md");
    expect(detail).not.toContain("Others.md");
    expect(detail).not.toContain("Relation.md");
  });

  it("sanitizes the package root name", () => {
    const design = validDesign();
    design.common.functionName = "契約/一覧:検索";
    expect(packageRootName(design)).toBe("KY01_契約_一覧_検索");
  });
});
