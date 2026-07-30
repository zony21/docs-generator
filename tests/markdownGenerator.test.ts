import { describe, expect, it } from "vitest";
import { setInputFieldPreference } from "../src/inputFieldDefinitions";
import {
  escapeMarkdownCell,
  generateDesignPackage,
  markdownTableRows,
  numberedList,
  packageRootName,
  sqlCodeBlock,
} from "../src/markdownGenerator";
import { createDefaultDesignPackage, createDocumentSection, createSectionForDocument, DOCUMENT_TYPES } from "../src/model";

function validDesign() {
  const design = createDefaultDesignPackage();
  Object.assign(design.common, {
    systemName: "WMS",
    moduleName: "品目マスタ",
    moduleId: "Awcs_M001",
    sourceExcelFile: "docs/source/item-master.xlsx",
    author: "担当者",
  });
  return design;
}

function textFileContent(design: ReturnType<typeof validDesign>, path: string): string {
  const file = generateDesignPackage(design).files.find((candidate) => candidate.path === path);
  expect(file?.kind).toBe("text");
  return file?.kind === "text" ? file.content : "";
}

describe("authoritative markdown generator", () => {
  it("keeps markdown utility behavior", () => {
    expect(escapeMarkdownCell("A|B\nC")).toBe("A\\|B<br>C");
    expect(markdownTableRows([{ name: "first", value: "1" }], ["name", "value"])).toBe("| first | 1 |");
    expect(numberedList("入力\n検索")).toBe("1. 入力\n2. 検索");
    expect(sqlCodeBlock("SELECT 1")).toBe("```sql\nSELECT 1\n```");
  });

  it("generates README, template guide, and root-level selected documents", () => {
    const design = validDesign();
    const result = generateDesignPackage(design, "2026-07-30T06:00:00.000Z");
    expect(result.rootDirectory).toBe("Awcs_M001_品目マスタ");
    expect(result.files.filter((file) => file.kind === "text").map((file) => file.path)).toEqual([
      "README.md",
      "TEMPLATE_GUIDE.md",
      "Hist.md",
      "Outline_A.md",
      "Outline_B.md",
      "FuncSpec.md",
      "FuncDetail.md",
      "Relation.md",
    ]);
    const readme = textFileContent(design, "README.md");
    expect(readme).toContain("# WMS / 品目マスタ 設計書 Markdown テンプレート");
    expect(readme).toContain("[Hist.md](Hist.md)");
    expect(readme).not.toContain("S-Layout.md](S-Layout.md)");
  });

  it("renders the authoritative common information table", () => {
    const design = validDesign();
    design.selectedDocuments = ["Outline_A"];
    design.documents.Outline_A.text.overview = "一覧を表示する";
    const content = textFileContent(design, "Outline_A.md");
    expect(content).toContain("- 元シート名: `Outline_A`");
    expect(content).toContain("| System Name | WMS |");
    expect(content).toContain("| Module ID | Awcs_M001 |");
    expect(content).toContain("## 機能概要\n\n- 一覧を表示する");
  });

  it("renders multiple S-Layout screens without the removed spacer or image column", () => {
    const design = validDesign();
    design.selectedDocuments = ["S-Layout"];
    const first = design.documents["S-Layout"].sections[0];
    first.name = "第一画面";
    first.fields.notes = "CSV取込中は操作不可";
    first.tables.items = [{ itemName: "品目コード", type: "txt", io: "In", length: "10", required: "", screenMode1: "○", screenMode2: "", screenMode3: "", notes: "半角", focusMessage: "" }];
    first.tables.footer = [{ itemName: "検索", type: "btn", io: "In" }];
    const second = createSectionForDocument("S-Layout", 1);
    second.name = "第二画面";
    design.documents["S-Layout"].sections.push(second);
    const content = textFileContent(design, "S-Layout.md");
    expect(content).toContain("## 第一画面");
    expect(content).toContain("### 備考\n\n- CSV取込中は操作不可");
    expect(content).toContain("| No | 項目名称 | タイプ | I/O | 桁数 | 必須 | 画面モード① | 画面モード② | 画面モード③ | 備考 | フォーカス時メッセージ |");
    expect(content).not.toContain("| - |");
    expect(content).not.toContain("![");
    expect(content).toContain("## 第二画面");
  });

  it("renders nested screens and processes for FuncSpec and FuncDetail", () => {
    const design = validDesign();
    design.selectedDocuments = ["FuncSpec", "FuncDetail"];
    const spec = design.documents.FuncSpec.sections[0];
    spec.name = "一覧画面";
    spec.children[0].name = "「検索」ボタン";
    spec.children[0].fields.content = "- 入力された検索条件を付加する。";
    const detail = design.documents.FuncDetail.sections[0];
    detail.name = "一覧画面";
    detail.fields.overview = "検索処理群";
    detail.children[0].name = "検索処理";
    Object.assign(detail.children[0].fields, {
      functionName: "Search()",
      functionType: "個別メソッド",
      summary: "一覧を検索する。",
      referenceSheet: "Relation",
      steps: "- SQLを実行する。",
    });
    expect(textFileContent(design, "FuncSpec.md")).toContain("### 「検索」ボタン\n\n- 入力された検索条件を付加する。");
    const detailContent = textFileContent(design, "FuncDetail.md");
    expect(detailContent).toContain("## 一覧画面");
    expect(detailContent).toContain("| 関数名 | Search() |");
    expect(detailContent).toContain("- SQLを実行する。");
  });

  it("renders Relation by transfer unit with SQL and mappings", () => {
    const design = validDesign();
    design.selectedDocuments = ["Relation"];
    const transfer = design.documents.Relation.sections[0];
    transfer.name = "商品検索";
    Object.assign(transfer.fields, {
      transferType: "Select",
      condition: "削除フラグ = 0",
      sortOrder: "品目コード",
      arguments: "ownerCode",
      sql: "SELECT * FROM M_ITEM",
    });
    transfer.tables.mappings = [{ sourceTable: "M_ITEM", sourceColumn: "ITEM_CD", sourceItem: "品目コード", destinationTable: "ItemDto", destinationColumn: "itemCode", destinationItem: "品目コード", notes: "" }];
    const content = textFileContent(design, "Relation.md");
    expect(content).toContain("## 商品検索");
    expect(content).toContain("| 移送区分 | Select |");
    expect(content).toContain("```sql\nSELECT * FROM M_ITEM\n```");
    expect(content).toContain("| M_ITEM | ITEM_CD | 品目コード | ItemDto | itemCode | 品目コード |  |");
  });

  it("links field visibility and edited labels to generated Markdown", () => {
    const design = validDesign();
    design.selectedDocuments = ["Check"];
    const section = design.documents.Check.sections[0];
    section.name = "一覧画面";
    section.tables.checks = [{ checkItem: "品目コード", type: "必須", detail: "未入力はエラー", messageId: "E001", messageArguments: "品目コード", message: "入力してください" }];
    setInputFieldPreference(design, "Check", "checks.detail", { label: "判定内容", enabled: true });
    setInputFieldPreference(design, "Check", "checks.messageArguments", { label: "メッセージ引数", enabled: false });
    const content = textFileContent(design, "Check.md");
    expect(content).toContain("| No | チェック項目 | 種別 | 判定内容 | メッセージID | メッセージ |");
    expect(content).not.toContain("メッセージ引数");
    expect(content).not.toContain("| 品目コード | 入力してください |" );
  });

  it("generates all selected documents in template order", () => {
    const design = validDesign();
    design.selectedDocuments = [...DOCUMENT_TYPES];
    const paths = generateDesignPackage(design).files.filter((file) => file.kind === "text").map((file) => file.path);
    expect(paths).toEqual(["README.md", "TEMPLATE_GUIDE.md", ...DOCUMENT_TYPES.map((type) => `${type}.md`)]);
  });

  it("sanitizes package names from module metadata", () => {
    const design = validDesign();
    design.common.moduleName = "品目/検索:管理";
    expect(packageRootName(design)).toBe("Awcs_M001_品目_検索_管理");
  });

  it("allows arbitrary additional process sections", () => {
    const design = validDesign();
    design.selectedDocuments = ["FuncSpec"];
    const section = design.documents.FuncSpec.sections[0];
    const child = createDocumentSection("「CSV取込」ボタン", 1);
    child.fields.content = "- CSVファイルを取り込む。";
    section.children.push(child);
    expect(textFileContent(design, "FuncSpec.md")).toContain("### 「CSV取込」ボタン");
  });
});
