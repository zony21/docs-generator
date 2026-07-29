import { createDefaultDesignPackage, DOCUMENT_TYPES, type DesignPackage } from "./model";

export const STORAGE_KEY = "docs-generator:draft:v1";

function withoutImageFiles(design: DesignPackage): DesignPackage {
  return {
    ...design,
    common: { ...design.common },
    selectedDocuments: [...design.selectedDocuments],
    tableCatalog: structuredClone(design.tableCatalog),
    fieldPreferences: structuredClone(design.fieldPreferences),
    documents: Object.fromEntries(
      DOCUMENT_TYPES.map((type) => [
        type,
        {
          ...design.documents[type],
          summary: { ...design.documents[type].summary },
          text: { ...design.documents[type].text },
          tables: structuredClone(design.documents[type].tables),
          groups: structuredClone(design.documents[type].groups),
          images: [],
        },
      ]),
    ) as unknown as DesignPackage["documents"],
  };
}

export function saveDraft(design: DesignPackage, storage: Storage = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(withoutImageFiles(design)));
}

export function loadDraft(storage: Storage = localStorage): DesignPackage | null {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DesignPackage>;
    if (parsed.schemaVersion !== "1.0.0") return null;
    const defaults = createDefaultDesignPackage();
    return {
      ...defaults,
      ...parsed,
      common: { ...defaults.common, ...parsed.common },
      selectedDocuments: Array.isArray(parsed.selectedDocuments)
        ? parsed.selectedDocuments.filter((type): type is DesignPackage["selectedDocuments"][number] =>
            DOCUMENT_TYPES.includes(type as DesignPackage["selectedDocuments"][number]),
          )
        : defaults.selectedDocuments,
      tableCatalog: Array.isArray(parsed.tableCatalog) ? parsed.tableCatalog : [],
      fieldPreferences: parsed.fieldPreferences ?? {},
      documents: Object.fromEntries(
        DOCUMENT_TYPES.map((type) => {
          const saved = parsed.documents?.[type];
          return [
            type,
            {
              ...defaults.documents[type],
              ...saved,
              summary: { ...defaults.documents[type].summary, ...saved?.summary },
              text: { ...saved?.text },
              tables: saved?.tables ?? {},
              groups: saved?.groups ?? {},
              images: [],
            },
          ];
        }),
      ) as unknown as DesignPackage["documents"],
    };
  } catch {
    return null;
  }
}

export function clearDraft(storage: Storage = localStorage): void {
  storage.removeItem(STORAGE_KEY);
}
