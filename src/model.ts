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

export const DOCUMENT_SUMMARY_DEFAULTS: Readonly<Record<DocumentType, DocumentSummary>> = {
  Hist: {
    sheetTitle: "改版履歴 History",
    screenComponentName: "",
    eventCheckFunctionName: "",
    timing: "",
    notes: "The history shows the document was created as a receive-side design and later updated to v1.0.",
  },
  Outline_A: {
    sheetTitle: "モジュール概要 Module outline",
    screenComponentName: "",
    eventCheckFunctionName: "",
    timing: "",
    notes: "The sheet frames the module and the overall data flow at a high level.",
  },
  Outline_B: {
    sheetTitle: "機能概要 Functiona outline",
    screenComponentName: "",
    eventCheckFunctionName: "",
    timing: "",
    notes: "The sheet highlights the process flow and the CRUD pattern used by the module.",
  },
  "S-Layout": {
    sheetTitle: "画面レイアウト仕様 Screen layout specifications",
    screenComponentName: "",
    eventCheckFunctionName: "",
    timing: "",
    notes: "",
  },
  "R-Layout": {
    sheetTitle: "",
    screenComponentName: "",
    eventCheckFunctionName: "",
    timing: "",
    notes: "",
  },
  FuncSpec: {
    sheetTitle: "機能（操作/処理）仕様 Function specifications",
    screenComponentName: "",
    eventCheckFunctionName: "",
    timing: "",
    notes: "",
  },
  Event: {
    sheetTitle: "イベント一覧 Event list",
    screenComponentName: "",
    eventCheckFunctionName: "",
    timing: "",
    notes: "The workbook provides a table frame, but the event rows are blank in the extracted content.",
  },
  FuncDetail: {
    sheetTitle: "機能詳細説明 Explanation of Function detail",
    screenComponentName: "",
    eventCheckFunctionName: "",
    timing: "WebAPI reception",
    notes: "The design describes the validation flow, state transition logic, and response payload patterns in detail.",
  },
  Relation: {
    sheetTitle: "項目相関図（DB I/O定義） Data relationship diagram",
    screenComponentName: "",
    eventCheckFunctionName: "Data transfer / I/O mapping",
    timing: "During processing of inbound messages",
    notes: "The sheet is about field-level relationships rather than UI behavior.",
  },
  Check: {
    sheetTitle: "画面チェック仕様 Validate check specifications",
    screenComponentName: "",
    eventCheckFunctionName: "",
    timing: "",
    notes: "The source sheet contains repeated header sections for screen-level checks and numbered rows, but the detailed check criteria are not explicitly written.",
  },
  Others: {
    sheetTitle: "その他の説明 Explanation of others",
    screenComponentName: "",
    eventCheckFunctionName: "",
    timing: "During insert/update processing",
    notes: "The sheet contains field-level mapping and state-setting rules.",
  },
  Footnote: {
    sheetTitle: "補足説明 Footnote",
    screenComponentName: "",
    eventCheckFunctionName: "",
    timing: "",
    notes: "No meaningful notes were populated in the extracted content.",
  },
};

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

function localDateString(date = new Date()): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function getDocumentSummary(type: DocumentType): DocumentSummary {
  return { ...DOCUMENT_SUMMARY_DEFAULTS[type] };
}

function createDocumentData(type: DocumentType): DocumentData {
  return {
    summary: getDocumentSummary(type),
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
