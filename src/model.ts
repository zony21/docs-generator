export const DOCUMENT_TYPES = [
  "Hist",
  "Outline_A",
  "Outline_B",
  "S-Layout",
  "R-Layout",
  "FuncSpec",
  "Event",
  "FuncDetail",
  "Relation",
  "Check",
  "Others",
  "Footnote",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export interface CommonMetadata {
  systemName: string;
  moduleName: string;
  moduleId: string;
  sourceExcelFile: string;
  conversionDate: string;
  date: string;
  revision: string;
  author: string;
  // Legacy fields are retained so v1 drafts can be migrated without data loss.
  functionId: string;
  functionName: string;
  summary: string;
  documentNumber: string;
  notes: string;
}

export interface DocumentSummary {
  sheetTitle: string;
  screenComponentName: string;
  eventCheckFunctionName: string;
  timing: string;
  notes: string;
}

export const DOCUMENT_SUMMARY_DEFAULTS: Readonly<Record<DocumentType, DocumentSummary>> = Object.fromEntries(
  DOCUMENT_TYPES.map((type) => [type, {
    sheetTitle: "",
    screenComponentName: "",
    eventCheckFunctionName: "",
    timing: "",
    notes: "",
  }]),
) as Record<DocumentType, DocumentSummary>;

export interface TableCatalogItem {
  id: string;
  category: string;
  physicalName: string;
  logicalName: string;
  description: string;
}

export interface InputFieldPreference {
  label: string;
  enabled: boolean;
}

export type InputFieldPreferenceMap = Partial<
  Record<DocumentType, Record<string, InputFieldPreference>>
>;

export type TableRow = Record<string, string>;
export type GroupItem = Record<string, string>;

export interface LayoutImage {
  id: string;
  originalFileName: string;
  outputFileName: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  size: number;
  title: string;
  alt: string;
  notes: string;
  order: number;
  file?: File;
  previewUrl?: string;
}

/** Legacy S-Layout structure retained for v1 draft migration. */
export interface ScreenLayoutSection {
  id: string;
  name: string;
  notes: string;
  order: number;
  image?: LayoutImage;
  items: TableRow[];
  footerItems: TableRow[];
}

export interface DocumentSection {
  id: string;
  name: string;
  order: number;
  fields: Record<string, string>;
  tables: Record<string, TableRow[]>;
  children: DocumentSection[];
}

export interface DocumentData {
  summary: DocumentSummary;
  text: Record<string, string>;
  tables: Record<string, TableRow[]>;
  groups: Record<string, GroupItem[]>;
  images: LayoutImage[];
  screens: ScreenLayoutSection[];
  sections: DocumentSection[];
}

export type DocumentDataMap = Record<DocumentType, DocumentData>;

export interface DesignPackage {
  schemaVersion: "2.0.0";
  common: CommonMetadata;
  selectedDocuments: DocumentType[];
  tableCatalog: TableCatalogItem[];
  fieldPreferences: InputFieldPreferenceMap;
  documents: DocumentDataMap;
}

export const BASIC_DOCUMENTS: readonly DocumentType[] = [
  "Hist",
  "Outline_A",
  "Outline_B",
  "FuncSpec",
  "FuncDetail",
  "Relation",
];

const JAPANESE_SCREEN_ORDINALS = [
  "第一画面",
  "第二画面",
  "第三画面",
  "第四画面",
  "第五画面",
  "第六画面",
  "第七画面",
  "第八画面",
  "第九画面",
  "第十画面",
] as const;

function localDateString(date = new Date()): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function getDocumentSummary(type: DocumentType): DocumentSummary {
  return { ...DOCUMENT_SUMMARY_DEFAULTS[type] };
}

export function defaultScreenLayoutName(index: number): string {
  return JAPANESE_SCREEN_ORDINALS[index] ?? `第${index + 1}画面`;
}

export function createScreenLayoutSection(index = 0): ScreenLayoutSection {
  return {
    id: createId(),
    name: defaultScreenLayoutName(index),
    notes: "",
    order: index + 1,
    items: [],
    footerItems: [],
  };
}

export function createDocumentSection(name: string, index = 0): DocumentSection {
  return {
    id: createId(),
    name,
    order: index + 1,
    fields: {},
    tables: {},
    children: [],
  };
}

export function defaultSectionName(type: DocumentType, index: number): string {
  switch (type) {
    case "S-Layout":
    case "FuncSpec":
    case "Event":
    case "FuncDetail":
    case "Check":
      return defaultScreenLayoutName(index);
    case "R-Layout":
      return `帳票${index + 1}`;
    case "Relation":
      return `移送${index + 1}`;
    case "Others":
      return index === 0 ? "Function配列名" : `定数名または補助説明名${index > 1 ? index : ""}`;
    default:
      return `セクション${index + 1}`;
  }
}

export function createSectionForDocument(type: DocumentType, index = 0): DocumentSection {
  const section = createDocumentSection(defaultSectionName(type, index), index);
  if (type === "FuncSpec") {
    section.children = [createDocumentSection("起動時")];
  }
  if (type === "FuncDetail") {
    section.children = [createDocumentSection("処理名称")];
  }
  if (type === "Others") {
    section.fields.language = "csharp";
  }
  return section;
}

function defaultSections(type: DocumentType): DocumentSection[] {
  if (["S-Layout", "R-Layout", "FuncSpec", "Event", "FuncDetail", "Relation", "Check"].includes(type)) {
    return [createSectionForDocument(type)];
  }
  if (type === "Others") {
    return [createSectionForDocument(type, 0), createSectionForDocument(type, 1)];
  }
  return [];
}

function createDocumentData(type: DocumentType): DocumentData {
  return {
    summary: getDocumentSummary(type),
    text: {},
    tables: {},
    groups: {},
    images: [],
    screens: [],
    sections: defaultSections(type),
  };
}

export function createDefaultDesignPackage(): DesignPackage {
  const today = localDateString();
  return {
    schemaVersion: "2.0.0",
    common: {
      systemName: "",
      moduleName: "",
      moduleId: "",
      sourceExcelFile: "",
      conversionDate: today,
      date: today,
      revision: "v1.0",
      author: "",
      functionId: "",
      functionName: "",
      summary: "",
      documentNumber: "",
      notes: "",
    },
    selectedDocuments: [...BASIC_DOCUMENTS],
    tableCatalog: [],
    fieldPreferences: {},
    documents: Object.fromEntries(
      DOCUMENT_TYPES.map((type) => [type, createDocumentData(type)]),
    ) as DocumentDataMap,
  };
}

export function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}
