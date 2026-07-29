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
  functionId: string;
  functionName: string;
  summary: string;
  documentNumber: string;
  date: string;
  revision: string;
  author: string;
  notes: string;
}

export interface DocumentSummary {
  sheetTitle: string;
  screenComponentName: string;
  eventCheckFunctionName: string;
  timing: string;
  notes: string;
}

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

export interface DocumentData {
  summary: DocumentSummary;
  text: Record<string, string>;
  tables: Record<string, TableRow[]>;
  groups: Record<string, GroupItem[]>;
  images: LayoutImage[];
}

export type DocumentDataMap = Record<DocumentType, DocumentData>;

export interface DesignPackage {
  schemaVersion: "1.0.0";
  common: CommonMetadata;
  selectedDocuments: DocumentType[];
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

function localDateString(date = new Date()): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function createDocumentData(): DocumentData {
  return {
    summary: {
      sheetTitle: "",
      screenComponentName: "",
      eventCheckFunctionName: "",
      timing: "",
      notes: "",
    },
    text: {},
    tables: {},
    groups: {},
    images: [],
  };
}

export function createDefaultDesignPackage(): DesignPackage {
  return {
    schemaVersion: "1.0.0",
    common: {
      systemName: "",
      moduleName: "",
      moduleId: "",
      functionId: "",
      functionName: "",
      summary: "",
      documentNumber: "",
      date: localDateString(),
      revision: "0.1",
      author: "",
      notes: "",
    },
    selectedDocuments: [...BASIC_DOCUMENTS],
    documents: Object.fromEntries(
      DOCUMENT_TYPES.map((type) => [type, createDocumentData()]),
    ) as DocumentDataMap,
  };
}

export function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}
