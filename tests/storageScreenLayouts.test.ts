import { describe, expect, it } from "vitest";
import { createDefaultDesignPackage } from "../src/model";
import { loadDraft, saveDraft, STORAGE_KEY } from "../src/storage";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

describe("authoritative draft storage", () => {
  it("saves and restores nested document sections", () => {
    const storage = new MemoryStorage();
    const design = createDefaultDesignPackage();
    const process = design.documents.FuncDetail.sections[0].children[0];
    process.name = "検索処理";
    process.fields.functionName = "Search";
    saveDraft(design, storage);
    const loaded = loadDraft(storage);
    expect(loaded?.schemaVersion).toBe("2.0.0");
    expect(loaded?.documents.FuncDetail.sections[0].children[0].name).toBe("検索処理");
    expect(loaded?.documents.FuncDetail.sections[0].children[0].fields.functionName).toBe("Search");
  });

  it("migrates v1 S-Layout screens and removes the obsolete spacer field", () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({
      schemaVersion: "1.0.0",
      common: { systemName: "TEST", moduleName: "画面", moduleId: "SC", date: "2026-07-30", revision: "v1.0", author: "担当" },
      selectedDocuments: ["S-Layout"],
      documents: {
        "S-Layout": {
          screens: [{ id: "1", name: "旧第一画面", notes: "旧備考", order: 1, items: [{ itemName: "項目", separator: "-" }], footerItems: [] }],
        },
      },
    }));
    const loaded = loadDraft(storage);
    expect(loaded?.documents["S-Layout"].sections[0].name).toBe("旧第一画面");
    expect(loaded?.documents["S-Layout"].sections[0].fields.notes).toBe("旧備考");
    expect(loaded?.documents["S-Layout"].sections[0].tables.items[0].separator).toBeUndefined();
  });

  it("migrates v1 action groups into FuncSpec child processes", () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({
      schemaVersion: "1.0.0",
      documents: { FuncSpec: { text: { functionUnit: "一覧画面" }, groups: { actions: [{ title: "検索", majorSteps: "条件入力\n一覧表示" }] } } },
    }));
    const loaded = loadDraft(storage);
    expect(loaded?.documents.FuncSpec.sections[0].name).toBe("一覧画面");
    expect(loaded?.documents.FuncSpec.sections[0].children[0].name).toBe("検索");
    expect(loaded?.documents.FuncSpec.sections[0].children[0].fields.content).toContain("条件入力");
  });
});
