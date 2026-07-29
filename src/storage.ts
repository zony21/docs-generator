import {
  createDefaultDesignPackage,
  createScreenLayoutSection,
  DOCUMENT_TYPES,
  type DesignPackage,
  type DocumentData,
  type LayoutImage,
  type ScreenLayoutSection,
  type TableRow,
} from "./model";

export const STORAGE_KEY = "docs-generator:draft:v1";

function imageWithoutFile(image: LayoutImage): LayoutImage {
  const { file: _file, previewUrl: _previewUrl, ...metadata } = image;
  return metadata;
}

function screenWithoutImageFile(screen: ScreenLayoutSection): ScreenLayoutSection {
  return {
    ...screen,
    items: structuredClone(screen.items),
    footerItems: structuredClone(screen.footerItems),
    image: screen.image ? imageWithoutFile(screen.image) : undefined,
  };
}

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
          screens: design.documents[type].screens.map(screenWithoutImageFile),
        },
      ]),
    ) as unknown as DesignPackage["documents"],
  };
}

export function saveDraft(design: DesignPackage, storage: Storage = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(withoutImageFiles(design)));
}

function migrateLegacyScreenRows(saved: DocumentData | undefined): TableRow[] {
  const controls = saved?.tables?.controls ?? [];
  const properties = saved?.tables?.properties ?? [];
  return controls.map((control) => {
    const property = properties.find((candidate) =>
      (candidate.controlId ?? "") === (control.controlId ?? ""),
    );
    const notes = [
      control.area ? `領域: ${control.area}` : "",
      property?.remarks ?? "",
    ].filter(Boolean).join(" / ");
    return {
      itemName: control.controlName || control.controlId || "",
      type: control.type ?? "",
      io: "",
      length: property?.lengthFormat ?? "",
      required: property?.required ?? "",
      screenMode1: "",
      screenMode2: "",
      screenMode3: "",
      separator: "",
      notes,
      focusMessage: "",
    };
  });
}

function normalizeScreen(screen: Partial<ScreenLayoutSection>, index: number): ScreenLayoutSection {
  const fallback = createScreenLayoutSection(index);
  return {
    ...fallback,
    ...screen,
    id: screen.id || fallback.id,
    name: screen.name ?? fallback.name,
    notes: screen.notes ?? "",
    order: index + 1,
    image: screen.image ? imageWithoutFile(screen.image) : undefined,
    items: Array.isArray(screen.items) ? structuredClone(screen.items) : [],
    footerItems: Array.isArray(screen.footerItems) ? structuredClone(screen.footerItems) : [],
  };
}

function loadScreenLayouts(saved: DocumentData | undefined): ScreenLayoutSection[] {
  if (Array.isArray(saved?.screens) && saved.screens.length > 0) {
    return saved.screens.map((screen, index) => normalizeScreen(screen, index));
  }
  const screen = createScreenLayoutSection();
  screen.notes = saved?.text?.displayEditRules ?? "";
  screen.items = migrateLegacyScreenRows(saved);
  return [screen];
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
              screens: type === "S-Layout" ? loadScreenLayouts(saved) : [],
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
