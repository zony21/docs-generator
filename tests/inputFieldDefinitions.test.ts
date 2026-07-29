import { describe, expect, it } from "vitest";
import {
  getInputFieldPreference,
  resetDocumentInputFields,
  resetInputFieldPreference,
  setInputFieldPreference,
} from "../src/inputFieldDefinitions";
import { createDefaultDesignPackage } from "../src/model";

describe("input field preferences", () => {
  it("uses default labels and visible state", () => {
    const design = createDefaultDesignPackage();
    expect(getInputFieldPreference(design, "Outline_A", "purpose")).toEqual({
      label: "目的",
      enabled: true,
    });
  });

  it("keeps custom labels and hidden state without deleting data", () => {
    const design = createDefaultDesignPackage();
    design.documents.Outline_A.text.purpose = "既存データ";
    setInputFieldPreference(design, "Outline_A", "purpose", {
      label: "この機能の目的",
      enabled: false,
    });
    expect(getInputFieldPreference(design, "Outline_A", "purpose")).toEqual({
      label: "この機能の目的",
      enabled: false,
    });
    expect(design.documents.Outline_A.text.purpose).toBe("既存データ");
  });

  it("can restore one field or the whole sheet", () => {
    const design = createDefaultDesignPackage();
    setInputFieldPreference(design, "Outline_A", "purpose", { label: "変更", enabled: false });
    setInputFieldPreference(design, "Outline_A", "scopeTarget", { label: "対象", enabled: false });
    resetInputFieldPreference(design, "Outline_A", "purpose");
    expect(getInputFieldPreference(design, "Outline_A", "purpose").label).toBe("目的");
    resetDocumentInputFields(design, "Outline_A");
    expect(getInputFieldPreference(design, "Outline_A", "scopeTarget")).toEqual({
      label: "対象範囲・対象ユーザー・対象処理",
      enabled: true,
    });
  });
});
