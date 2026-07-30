import { describe, expect, it } from "vitest";
import { setInputFieldPreference } from "../src/inputFieldDefinitions";
import { generateDesignPackage } from "../src/markdownGenerator";
import { createDefaultDesignPackage } from "../src/model";

function contentFor(type: "Relation" | "FuncDetail" | "Event") {
  const design = createDefaultDesignPackage();
  Object.assign(design.common, { systemName: "TEST", moduleName: "機能", moduleId: "M01", author: "担当" });
  design.selectedDocuments = [type];
  return { design, get: () => {
    const file = generateDesignPackage(design).files.find((candidate) => candidate.path === `${type}.md`);
    return file?.kind === "text" ? file.content : "";
  } };
}

describe("authoritative configurable labels", () => {
  it("uses edited Relation metadata labels", () => {
    const { design, get } = contentFor("Relation");
    design.documents.Relation.sections[0].fields.transferType = "Select";
    setInputFieldPreference(design, "Relation", "section.transferType", { label: "処理区分", enabled: true });
    expect(get()).toContain("| 処理区分 | Select |");
  });

  it("uses edited FuncDetail metadata labels", () => {
    const { design, get } = contentFor("FuncDetail");
    design.documents.FuncDetail.sections[0].children[0].fields.functionName = "Run";
    setInputFieldPreference(design, "FuncDetail", "processes.functionName", { label: "メソッド", enabled: true });
    expect(get()).toContain("| メソッド | Run |");
  });

  it("omits disabled Event columns", () => {
    const { design, get } = contentFor("Event");
    design.documents.Event.sections[0].tables.events = [{ eventName: "起動", control: "画面", timing: "起動時", inheritedMethod: "Load", summary: "初期化" }];
    setInputFieldPreference(design, "Event", "events.inheritedMethod", { label: "継承メソッド", enabled: false });
    expect(get()).not.toContain("継承メソッド");
    expect(get()).not.toContain("Load");
  });
});
