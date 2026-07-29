import { describe, expect, it } from "vitest";
import { generateDesignPackage } from "../src/markdownGenerator";
import { createDefaultDesignPackage, createScreenLayoutSection } from "../src/model";

function screenRow(overrides: Record<string, string> = {}) {
  return {
    itemName: "",
    type: "",
    io: "",
    length: "",
    required: "",
    screenMode1: "",
    screenMode2: "",
    screenMode3: "",
    separator: "",
    notes: "",
    focusMessage: "",
    ...overrides,
  };
}

function generatedScreenLayout() {
  const design = createDefaultDesignPackage();
  design.selectedDocuments = ["S-Layout"];
  const first = design.documents["S-Layout"].screens[0];
  first.name = "第一画面";
  first.notes = "ピッキング作業中はCSV取込の実施不可";
  first.items = [screenRow({
    itemName: "品目コード",
    type: "txt",
    io: "In",
    length: "10",
    notes: "半角入力、部分一致",
  })];
  first.footerItems = [screenRow({ itemName: "検索", type: "btn", io: "In" })];

  const second = createScreenLayoutSection(1);
  second.name = "第二画面";
  second.items = [screenRow({ itemName: "確認メッセージ", type: "lbl", io: "Out" })];
  design.documents["S-Layout"].screens.push(second);
  const result = generateDesignPackage(design, "2026-07-29T08:50:00.000Z", { validate: false });
  const file = result.files.find((candidate) => candidate.path === "sheets/S-Layout.md");
  if (!file || file.kind !== "text") throw new Error("S-Layout.md was not generated.");
  return { design, result, content: file.content };
}

describe("S-Layout markdown", () => {
  it("renders multiple screens with notes, items, and footer in Excel order", () => {
    const { content } = generatedScreenLayout();
    expect(content).toContain("### 4.1 第一画面");
    expect(content).toContain("#### 備考\n\nピッキング作業中はCSV取込の実施不可");
    expect(content).toContain("| No. | 項目名称 | タイプ | I/O | 桁数 | 必須 | 画面モード1 | 画面モード2 | 画面モード3 | - | 備考 | フォーカス時メッセージ |");
    expect(content).toContain("| 1 | 品目コード | txt | In | 10 |");
    expect(content).toContain("#### フッター");
    expect(content).toContain("| 1 | 検索 | btn | In |");
    expect(content).toContain("### 4.2 第二画面");
  });

  it("uses configured Japanese headers and omits disabled columns", () => {
    const { design } = generatedScreenLayout();
    design.fieldPreferences["S-Layout"] = {
      "screenItems.itemName": { label: "表示項目名", enabled: true },
      "screenItems.focusMessage": { label: "フォーカス案内", enabled: false },
    };
    const result = generateDesignPackage(design, "2026-07-29T08:50:00.000Z", { validate: false });
    const file = result.files.find((candidate) => candidate.path === "sheets/S-Layout.md");
    if (!file || file.kind !== "text") throw new Error("S-Layout.md was not generated.");
    expect(file.content).toContain("| No. | 表示項目名 | タイプ |");
    expect(file.content).not.toContain("フォーカス案内");
    expect(file.content).not.toContain("フォーカス時メッセージ");
  });

  it("exports a screen image beside the Markdown file", () => {
    const design = createDefaultDesignPackage();
    design.selectedDocuments = ["S-Layout"];
    const file = new File(["image"], "1st_screen.png", { type: "image/png" });
    design.documents["S-Layout"].screens[0].name = "第一画面";
    design.documents["S-Layout"].screens[0].image = {
      id: "image-1",
      originalFileName: file.name,
      outputFileName: file.name,
      mimeType: "image/png",
      size: file.size,
      title: "第一画面",
      alt: "第一画面",
      notes: "",
      order: 1,
      file,
    };
    const result = generateDesignPackage(design, "2026-07-29T08:50:00.000Z", { validate: false });
    const markdown = result.files.find((candidate) => candidate.path === "sheets/S-Layout.md");
    expect(markdown?.kind).toBe("text");
    if (markdown?.kind === "text") {
      expect(markdown.content).toContain("![第一画面](./S-Layout/1st_screen.png)");
    }
    expect(result.files.some((candidate) =>
      candidate.kind === "binary" && candidate.path === "sheets/S-Layout/1st_screen.png",
    )).toBe(true);
  });
});
