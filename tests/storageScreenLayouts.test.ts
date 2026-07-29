import { describe, expect, it } from "vitest";
import { createDefaultDesignPackage } from "../src/model";
import { loadDraft, saveDraft, STORAGE_KEY } from "../src/storage";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("S-Layout storage", () => {
  it("keeps screen metadata while removing image file handles", () => {
    const storage = new MemoryStorage();
    const design = createDefaultDesignPackage();
    const file = new File(["image"], "screen.png", { type: "image/png" });
    const screen = design.documents["S-Layout"].screens[0];
    screen.name = "第一画面";
    screen.items = [{ itemName: "品目コード", type: "txt" }];
    screen.image = {
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
      previewUrl: "blob:screen",
    };

    saveDraft(design, storage);
    const raw = storage.getItem(STORAGE_KEY) ?? "";
    expect(raw).not.toContain("blob:screen");
    const loaded = loadDraft(storage);
    expect(loaded?.documents["S-Layout"].screens[0].name).toBe("第一画面");
    expect(loaded?.documents["S-Layout"].screens[0].items[0].itemName).toBe("品目コード");
    expect(loaded?.documents["S-Layout"].screens[0].image?.outputFileName).toBe("screen.png");
    expect(loaded?.documents["S-Layout"].screens[0].image?.file).toBeUndefined();
  });

  it("migrates the old control and property tables into the first screen", () => {
    const storage = new MemoryStorage();
    const legacy = createDefaultDesignPackage() as unknown as Record<string, unknown>;
    const documents = legacy.documents as Record<string, Record<string, unknown>>;
    const screenLayout = documents["S-Layout"];
    delete screenLayout.screens;
    screenLayout.text = { displayEditRules: "CSV取込は作業中に実施不可" };
    screenLayout.tables = {
      controls: [{ controlId: "txtItem", controlName: "品目コード", type: "txt", area: "検索条件" }],
      properties: [{ controlId: "txtItem", lengthFormat: "10", required: "", remarks: "半角入力" }],
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(legacy));

    const loaded = loadDraft(storage);
    const screen = loaded?.documents["S-Layout"].screens[0];
    expect(screen?.notes).toBe("CSV取込は作業中に実施不可");
    expect(screen?.items[0]).toMatchObject({
      itemName: "品目コード",
      type: "txt",
      length: "10",
      notes: "領域: 検索条件 / 半角入力",
    });
  });
});
