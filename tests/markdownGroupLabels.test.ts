import { describe, expect, it } from "vitest";
import { setInputFieldPreference } from "../src/inputFieldDefinitions";
import { generateDesignPackage } from "../src/markdownGenerator";
import { createDefaultDesignPackage, type DocumentType } from "../src/model";

function designFor(type: DocumentType) {
  const design = createDefaultDesignPackage();
  Object.assign(design.common, {
    systemName: "TEST",
    functionId: "FN01",
    functionName: "テスト機能",
    author: "担当者",
  });
  design.selectedDocuments = [type];
  return design;
}

function contentFor(type: DocumentType, configure: (design: ReturnType<typeof designFor>) => void): string {
  const design = designFor(type);
  configure(design);
  const file = generateDesignPackage(design).files.find((candidate) => candidate.path === `sheets/${type}.md`);
  expect(file?.kind).toBe("text");
  return file?.kind === "text" ? file.content : "";
}

describe("configurable group heading labels", () => {
  it("uses the edited action-name label", () => {
    const content = contentFor("FuncSpec", (design) => {
      design.documents.FuncSpec.groups.actions = [{
        title: "検索",
        intent: "一覧を取得する",
        majorSteps: "条件を入力する\n検索する",
        successPath: "一覧を表示する",
        errorPath: "エラーを表示する",
      }];
      setInputFieldPreference(design, "FuncSpec", "actions.title", { label: "操作名", enabled: true });
    });
    expect(content).toContain("#### 4.3.1 操作名: 検索");
  });

  it("uses the edited processing-name label in both detail sections", () => {
    const content = contentFor("FuncDetail", (design) => {
      design.documents.FuncDetail.groups.units = [{
        processingName: "受信処理",
        methodName: "receive",
        functionType: "service",
        summary: "受信する",
        normalFlow: "通常処理",
        exceptionFlow: "例外処理",
        finallyFlow: "終了処理",
        relatedDocuments: "",
      }];
      setInputFieldPreference(design, "FuncDetail", "units.processingName", { label: "処理タイトル", enabled: true });
    });
    expect(content.match(/処理タイトル: 受信処理/g)).toHaveLength(2);
  });

  it("uses the edited transfer source and destination labels", () => {
    const content = contentFor("Relation", (design) => {
      design.documents.Relation.groups.relations = [{
        sourceName: "T_SOURCE",
        sourceCondition: "有効データ",
        destinationName: "OutputDto",
        destinationCondition: "返却対象",
        sql: "SELECT 1",
        notes: "",
      }];
      setInputFieldPreference(design, "Relation", "relations.sourceName", { label: "入力元", enabled: true });
      setInputFieldPreference(design, "Relation", "relations.destinationName", { label: "出力先", enabled: true });
    });
    expect(content).toContain("入力元: T_SOURCE");
    expect(content).toContain("出力先: OutputDto");
  });
});
