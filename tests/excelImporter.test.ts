import { describe, expect, it } from "vitest";
import { applyWorkbookSheets } from "../src/excelImporter";
import { createDefaultDesignPackage } from "../src/model";

describe("Excel workbook mapping", () => {
  it("merges recognized data without clearing unrelated input", () => {
    const design = createDefaultDesignPackage();
    design.documents.Footnote.text.supplementalNotes = "既存の補足";
    const result = applyWorkbookSheets([
      {
        name: "基本情報",
        rows: [
          ["システム名", "販売管理"],
          ["モジュール名", "受注登録"],
          ["モジュールID", "ORD01"],
          ["作成者", "久野"],
        ],
      },
      {
        name: "Outline_A",
        rows: [
          ["機能概要", "受注を登録する"],
          ["対象", "営業担当者"],
          ["対象外", "請求処理"],
        ],
      },
      {
        name: "Outline_B",
        rows: [
          ["処理概要", "受注情報を保存する"],
          [],
          ["論理テーブル名", "物理テーブル名（短縮名）", "種別", "S", "I", "U", "D"],
          ["受注", "T_ORDER", "Table", "○", "○", "○", ""],
        ],
      },
      {
        name: "S-Layout",
        rows: [
          ["画面名", "受注登録画面"],
          ["備考", "新規登録用"],
          [],
          ["項目名称", "タイプ", "I/O", "桁数", "必須", "画面モード①", "画面モード②", "画面モード③", "備考", "フォーカス時メッセージ"],
          ["受注番号", "Text", "O", "10", "必須", "表示", "表示", "表示", "", ""],
        ],
      },
    ], "sample.xlsx", design);

    expect(result.importedDocuments).toEqual(["Outline_A", "Outline_B", "S-Layout"]);
    expect(result.design.common.systemName).toBe("販売管理");
    expect(result.design.common.sourceExcelFile).toBe("sample.xlsx");
    expect(result.design.documents.Outline_A.text.overview).toBe("受注を登録する");
    expect(result.design.documents["S-Layout"].sections[0].name).toBe("受注登録画面");
    expect(result.design.documents["S-Layout"].sections[0].tables.items[0].itemName).toBe("受注番号");
    expect(result.design.documents.Footnote.text.supplementalNotes).toBe("既存の補足");
    expect(result.design.tableCatalog).toEqual(expect.arrayContaining([
      expect.objectContaining({ physicalName: "T_ORDER", logicalName: "受注" }),
    ]));
  });
});
