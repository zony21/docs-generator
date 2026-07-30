import {
  createDefaultDesignPackage,
  createDocumentSection,
  createSectionForDocument,
  DOCUMENT_TYPES,
  type DesignPackage,
  type DocumentData,
  type DocumentSection,
  type DocumentType,
  type GroupItem,
  type ScreenLayoutSection,
} from "./model";

export const STORAGE_KEY = "docs-generator:draft:v1";

function cloneSection(section: DocumentSection): DocumentSection {
  return {
    ...section,
    fields: { ...section.fields },
    tables: structuredClone(section.tables),
    children: section.children.map(cloneSection),
  };
}

function serializableDesign(design: DesignPackage): DesignPackage {
  return {
    ...design,
    common: { ...design.common },
    selectedDocuments: [...design.selectedDocuments],
    tableCatalog: structuredClone(design.tableCatalog),
    fieldPreferences: structuredClone(design.fieldPreferences),
    documents: Object.fromEntries(DOCUMENT_TYPES.map((type) => {
      const data = design.documents[type];
      return [type, {
        ...data,
        summary: { ...data.summary },
        text: { ...data.text },
        tables: structuredClone(data.tables),
        groups: structuredClone(data.groups),
        images: [],
        screens: [],
        sections: data.sections.map(cloneSection),
      }];
    })) as unknown as DesignPackage["documents"],
  };
}

export function saveDraft(design: DesignPackage, storage: Storage = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(serializableDesign(design)));
}

function normalizeSection(section: Partial<DocumentSection>, index: number, fallback: DocumentSection): DocumentSection {
  return {
    ...fallback,
    ...section,
    id: section.id || fallback.id,
    name: section.name ?? fallback.name,
    order: index + 1,
    fields: { ...section.fields },
    tables: structuredClone(section.tables ?? {}),
    children: Array.isArray(section.children)
      ? section.children.map((child, childIndex) => normalizeSection(child, childIndex, createDocumentSection(`処理${childIndex + 1}`, childIndex)))
      : [],
  };
}

function lines(values: string[]): string {
  return values.map((value) => value.trim()).filter(Boolean).join("\n");
}

function migrateSLayout(saved: Partial<DocumentData>): DocumentSection[] {
  const screens = Array.isArray(saved.screens) ? saved.screens as ScreenLayoutSection[] : [];
  if (screens.length > 0) {
    return screens.map((screen, index) => {
      const section = createSectionForDocument("S-Layout", index);
      section.name = screen.name || section.name;
      section.fields.notes = screen.notes ?? "";
      section.tables.items = structuredClone(screen.items ?? []).map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => key !== "separator")));
      section.tables.footer = structuredClone(screen.footerItems ?? []).map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => key !== "separator")));
      return section;
    });
  }
  const section = createSectionForDocument("S-Layout");
  section.fields.notes = saved.text?.displayEditRules ?? "";
  section.tables.items = structuredClone(saved.tables?.controls ?? []).map((row) => ({
    itemName: row.controlName || row.controlId || "",
    type: row.type ?? "",
    io: "",
    length: "",
    required: "",
    screenMode1: "",
    screenMode2: "",
    screenMode3: "",
    notes: row.area ? `領域: ${row.area}` : "",
    focusMessage: "",
  }));
  return [section];
}

function migrateSections(type: DocumentType, saved: Partial<DocumentData>): DocumentSection[] {
  if (Array.isArray(saved.sections) && saved.sections.length > 0) {
    return saved.sections.map((section, index) => normalizeSection(section, index, createSectionForDocument(type, index)));
  }
  if (type === "S-Layout") return migrateSLayout(saved);
  if (type === "R-Layout") {
    const section = createSectionForDocument(type);
    section.name = saved.summary?.screenComponentName || section.name;
    section.fields.overview = saved.text?.outputBehaviorNotes ?? "";
    section.tables.items = structuredClone(saved.tables?.columns ?? saved.tables?.items ?? []);
    return [section];
  }
  if (type === "FuncSpec") {
    const section = createSectionForDocument(type);
    section.name = saved.text?.functionUnit || saved.summary?.screenComponentName || section.name;
    section.children = (saved.groups?.actions ?? []).map((item: GroupItem, index) => {
      const child = createDocumentSection(item.title || `処理${index + 1}`, index);
      child.fields.content = lines([
        item.intent ? `- **目的**\n  - ${item.intent}` : "",
        item.majorSteps ? `- **主な手順**\n${item.majorSteps.split(/\r?\n/).filter(Boolean).map((step) => `  - ${step}`).join("\n")}` : "",
        item.successPath ? `- **正常時の動作**\n  - ${item.successPath}` : "",
        item.errorPath ? `- **エラー・中断時の動作**\n  - ${item.errorPath}` : "",
      ]);
      return child;
    });
    return [section];
  }
  if (type === "Event") {
    const section = createSectionForDocument(type);
    section.name = saved.summary?.screenComponentName || section.name;
    section.tables.events = structuredClone(saved.tables?.events ?? []).map((row) => ({
      eventName: row.eventName ?? "",
      control: row.control ?? "",
      timing: row.trigger ?? row.timing ?? "",
      inheritedMethod: row.inheritedMethod ?? "",
      summary: row.remarks ?? row.summary ?? "",
    }));
    return [section];
  }
  if (type === "FuncDetail") {
    const section = createSectionForDocument(type);
    section.name = saved.summary?.screenComponentName || section.name;
    section.fields.overview = saved.summary?.notes ?? "";
    section.children = (saved.groups?.units ?? []).map((item: GroupItem, index) => {
      const child = createDocumentSection(item.processingName || `処理${index + 1}`, index);
      child.fields = {
        functionName: item.methodName ?? "",
        functionType: item.functionType ?? "",
        summary: item.summary ?? "",
        referenceSheet: item.relatedDocuments ?? "",
        notes: "",
        steps: lines([
          item.normalFlow ? `- **try**\n  - ${item.normalFlow}` : "",
          item.exceptionFlow ? `- **catch（すべての例外）**\n  - ${item.exceptionFlow}` : "",
          item.finallyFlow ? `- **finally**\n  - ${item.finallyFlow}` : "",
        ]),
      };
      return child;
    });
    return [section];
  }
  if (type === "Relation") {
    const relations = saved.groups?.relations ?? [];
    if (relations.length === 0) return [createSectionForDocument(type)];
    return relations.map((item: GroupItem, index) => {
      const section = createSectionForDocument(type, index);
      section.name = item.destinationName || item.sourceName || section.name;
      section.fields.condition = lines([item.sourceCondition ?? "", item.destinationCondition ?? ""]);
      section.fields.sql = item.sql ?? "";
      section.tables.mappings = [{
        sourceTable: item.sourceName ?? "",
        sourceColumn: "",
        sourceItem: "",
        destinationTable: item.destinationName ?? "",
        destinationColumn: "",
        destinationItem: "",
        notes: item.notes ?? "",
      }];
      return section;
    });
  }
  if (type === "Check") {
    const section = createSectionForDocument(type);
    section.name = saved.text?.screenName || section.name;
    section.fields.checkName = saved.text?.checkName ?? "";
    section.fields.timing = saved.text?.checkTimingTrigger ?? "";
    section.tables.checks = structuredClone(saved.tables?.checks ?? []).map((row) => ({ ...row, message: row.message ?? "" }));
    return [section];
  }
  if (type === "Others") {
    const sections: DocumentSection[] = [];
    if ((saved.tables?.constants ?? []).length > 0) {
      const section = createSectionForDocument(type, sections.length);
      section.name = "定数定義";
      section.fields.language = "text";
      section.fields.code = (saved.tables?.constants ?? []).map((row) => `${row.name ?? ""} = ${row.value ?? ""}${row.notes ? ` // ${row.notes}` : ""}`).join("\n");
      sections.push(section);
    }
    if ((saved.tables?.mappings ?? []).length > 0) {
      const section = createSectionForDocument(type, sections.length);
      section.name = "補助マッピング";
      section.fields.language = "text";
      section.fields.code = (saved.tables?.mappings ?? []).map((row) => `${row.category ?? ""}: ${row.mapping ?? ""}${row.notes ? ` // ${row.notes}` : ""}`).join("\n");
      sections.push(section);
    }
    return sections.length > 0 ? sections : [createSectionForDocument(type, 0), createSectionForDocument(type, 1)];
  }
  return [];
}

function migrateTopLevel(type: DocumentType, saved: Partial<DocumentData>, target: DocumentData): void {
  if (type === "Hist") {
    target.tables.history = (saved.tables?.history ?? []).map((row) => ({
      creationDate: row.creationDate ?? row.date ?? "",
      author: row.author ?? "",
      revision: row.revision ?? "",
      sheet: row.sheet ?? row.target ?? "",
      note: row.note ?? row.change ?? "",
      approvalDate: row.approvalDate ?? "",
      approvedBy: row.approvedBy ?? "",
    }));
  }
  if (type === "Outline_A") {
    target.text.overview = saved.text?.overview ?? saved.text?.purpose ?? "";
    target.text.scopeTarget = saved.text?.scopeTarget ?? "";
    target.text.scopeExcluded = saved.text?.scopeExcluded ?? "";
  }
  if (type === "Outline_B") {
    target.text.processOverview = saved.text?.processOverview ?? saved.text?.constraintsRemarks ?? "";
    target.text.processingStyle = saved.text?.processingStyle ?? "";
    target.text.executionMethod = saved.text?.executionMethod ?? "";
    target.tables.crud = (saved.tables?.crud ?? saved.tables?.resources ?? []).map((row) => ({
      logicalName: row.logicalName ?? row.name ?? "",
      physicalName: row.physicalName ?? "",
      category: row.category ?? row.type ?? "",
      select: row.select ?? "",
      insert: row.insert ?? "",
      update: row.update ?? "",
      delete: row.delete ?? "",
    }));
  }
  if (type === "Others") target.text.supplementalRules = saved.text?.supplementalRules ?? saved.text?.operationalNotes ?? "";
  if (type === "Footnote") {
    target.text.supplementalNotes = saved.text?.supplementalNotes ?? lines([
      ...(saved.tables?.terms ?? []).map((row) => `${row.term ?? ""}: ${row.description ?? ""}`),
      ...(saved.tables?.abbreviations ?? []).map((row) => `${row.code ?? ""}: ${row.definition ?? ""}`),
    ]);
  }
}

export function loadDraft(storage: Storage = localStorage): DesignPackage | null {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed.schemaVersion !== "1.0.0" && parsed.schemaVersion !== "2.0.0") return null;
    const defaults = createDefaultDesignPackage();
    const source = parsed as unknown as Partial<DesignPackage> & { documents?: Partial<Record<DocumentType, Partial<DocumentData>>> };
    const result: DesignPackage = {
      ...defaults,
      common: { ...defaults.common, ...source.common },
      selectedDocuments: Array.isArray(source.selectedDocuments)
        ? source.selectedDocuments.filter((type): type is DocumentType => DOCUMENT_TYPES.includes(type as DocumentType))
        : defaults.selectedDocuments,
      tableCatalog: Array.isArray(source.tableCatalog) ? source.tableCatalog : [],
      fieldPreferences: source.fieldPreferences ?? {},
      documents: defaults.documents,
      schemaVersion: "2.0.0",
    };
    if (!result.common.conversionDate) result.common.conversionDate = result.common.date;
    DOCUMENT_TYPES.forEach((type) => {
      const saved: Partial<DocumentData> = source.documents?.[type] ?? {};
      const target = result.documents[type];
      target.summary = { ...target.summary, ...saved.summary };
      target.text = { ...saved.text };
      target.tables = structuredClone(saved.tables ?? {});
      target.groups = structuredClone(saved.groups ?? {});
      target.images = [];
      target.screens = [];
      target.sections = migrateSections(type, saved);
      migrateTopLevel(type, saved, target);
    });
    return result;
  } catch {
    return null;
  }
}

export function clearDraft(storage: Storage = localStorage): void {
  storage.removeItem(STORAGE_KEY);
}
