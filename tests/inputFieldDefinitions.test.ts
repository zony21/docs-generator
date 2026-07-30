import { describe, expect, it } from "vitest";
import { getInputFieldPreference, resetDocumentInputFields, resetInputFieldPreference, setInputFieldPreference } from "../src/inputFieldDefinitions";
import { createDefaultDesignPackage } from "../src/model";

describe("input field preferences", () => {
  it("uses authoritative default labels", () => {
    const design = createDefaultDesignPackage();
    expect(getInputFieldPreference(design, "S-Layout", "items.screenMode1")).toEqual({ label: "画面モード①", enabled: true });
    expect(getInputFieldPreference(design, "Check", "checks.message").label).toBe("メッセージ");
  });

  it("keeps custom labels and hidden state without deleting section data", () => {
    const design = createDefaultDesignPackage();
    design.documents.Relation.sections[0].fields.sql = "SELECT 1";
    setInputFieldPreference(design, "Relation", "section.sql", { label: "照会SQL", enabled: false });
    expect(getInputFieldPreference(design, "Relation", "section.sql")).toEqual({ label: "照会SQL", enabled: false });
    expect(design.documents.Relation.sections[0].fields.sql).toBe("SELECT 1");
  });

  it("can restore one field or the whole sheet", () => {
    const design = createDefaultDesignPackage();
    setInputFieldPreference(design, "Outline_A", "overview", { label: "概要説明", enabled: false });
    setInputFieldPreference(design, "Outline_A", "scopeTarget", { label: "対象業務", enabled: false });
    resetInputFieldPreference(design, "Outline_A", "overview");
    expect(getInputFieldPreference(design, "Outline_A", "overview").label).toBe("機能概要");
    resetDocumentInputFields(design, "Outline_A");
    expect(getInputFieldPreference(design, "Outline_A", "scopeTarget")).toEqual({ label: "対象", enabled: true });
  });
});
