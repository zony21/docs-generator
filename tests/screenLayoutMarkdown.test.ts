import { describe, expect, it } from "vitest";
import { generateDesignPackage } from "../src/markdownGenerator";
import { createDefaultDesignPackage, createSectionForDocument } from "../src/model";

function content() {
  const design = createDefaultDesignPackage();
  Object.assign(design.common, { systemName: "TEST", moduleName: "画面", moduleId: "SC01", author: "担当" });
  design.selectedDocuments = ["S-Layout"];
  const first = design.documents["S-Layout"].sections[0];
  first.name = "第一画面";
  first.fields.notes = "一覧表示\nCSV取込中は操作不可";
  first.tables.items = [{ itemName: "検索条件", type: "lbl", io: "Out", screenMode1: "△" }];
  first.tables.footer = [{ itemName: "終了", type: "btn", io: "In", screenMode1: "↑" }];
  const second = createSectionForDocument("S-Layout", 1);
  second.name = "確認画面";
  design.documents["S-Layout"].sections.push(second);
  const file = generateDesignPackage(design).files.find((candidate) => candidate.path === "S-Layout.md");
  if (!file || file.kind !== "text") throw new Error("S-Layout not generated");
  return file.content;
}

describe("S-Layout authoritative structure", () => {
  it("repeats sections by screen", () => {
    const markdown = content();
    expect(markdown).toContain("## 第一画面");
    expect(markdown).toContain("## 確認画面");
    expect(markdown).toContain("### 画面項目");
    expect(markdown).toContain("### フッター");
  });

  it("renders notes as bullets and uses circled mode headers", () => {
    const markdown = content();
    expect(markdown).toContain("- 一覧表示\n- CSV取込中は操作不可");
    expect(markdown).toContain("画面モード①");
    expect(markdown).not.toContain("画面モード1");
  });

  it("does not generate obsolete layout images", () => {
    expect(content()).not.toContain("![");
  });
});
