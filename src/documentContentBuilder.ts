import { getInputFieldPreference } from "./inputFieldDefinitions";
import { markdownImagePath } from "./imageAssets";
import type {
  DesignPackage,
  DocumentData,
  DocumentType,
  GroupItem,
  LayoutImage,
  TableRow,
} from "./model";
import { escapeMarkdownCell, numberedList, sqlCodeBlock } from "./markdownUtils";

interface TableColumn {
  preferenceKey: string;
  dataKey: string;
}

class MainContentBuilder {
  private readonly sections: string[] = [];

  add(title: string, content: string | ((sectionNumber: number) => string)): void {
    const sectionNumber = this.sections.length + 1;
    const resolved = typeof content === "function" ? content(sectionNumber) : content;
    const body = resolved.trim();
    this.sections.push(`### 4.${sectionNumber} ${headingText(title)}${body ? `\n\n${body}` : ""}`);
  }

  toString(): string {
    return this.sections.join("\n\n");
  }
}

function headingText(value: string): string {
  return value.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim() || "項目";
}

function preference(design: DesignPackage, type: DocumentType, key: string) {
  return getInputFieldPreference(design, type, key);
}

function enabled(design: DesignPackage, type: DocumentType, key: string): boolean {
  return preference(design, type, key).enabled;
}

function label(design: DesignPackage, type: DocumentType, key: string): string {
  return preference(design, type, key).label;
}

function text(data: DocumentData, key: string): string {
  return data.text[key] ?? "";
}

function tableRows(data: DocumentData, key: string): TableRow[] {
  return data.tables[key] ?? [];
}

function groupItems(data: DocumentData, key: string): GroupItem[] {
  return data.groups[key] ?? [];
}

function renderTable(
  design: DesignPackage,
  type: DocumentType,
  data: DocumentData,
  tableKey: string,
  columns: readonly TableColumn[],
  includeNumber = false,
): string | null {
  const active = columns.filter((column) => enabled(design, type, column.preferenceKey));
  if (active.length === 0) return null;

  const headers = active.map((column) => escapeMarkdownCell(label(design, type, column.preferenceKey)));
  if (includeNumber) headers.unshift("No.");
  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
  ];

  tableRows(data, tableKey).forEach((row, index) => {
    const cells = active.map((column) => escapeMarkdownCell(row[column.dataKey] ?? ""));
    if (includeNumber) cells.unshift(String(index + 1));
    lines.push(`| ${cells.join(" | ")} |`);
  });
  return lines.join("\n");
}

function addTextSection(
  builder: MainContentBuilder,
  design: DesignPackage,
  type: DocumentType,
  data: DocumentData,
  key: string,
  transform: (value: string) => string = (value) => value,
): void {
  if (!enabled(design, type, key)) return;
  builder.add(label(design, type, key), transform(text(data, key)));
}

function addTableSection(
  builder: MainContentBuilder,
  design: DesignPackage,
  type: DocumentType,
  data: DocumentData,
  title: string,
  tableKey: string,
  columns: readonly TableColumn[],
  includeNumber = false,
): void {
  const markdown = renderTable(design, type, data, tableKey, columns, includeNumber);
  if (markdown !== null) builder.add(title, markdown);
}

function optionalBullet(customLabel: string, value: string): string {
  return value.trim() ? `- ${headingText(customLabel)}: ${value}` : "";
}

function renderActionBlocks(
  design: DesignPackage,
  data: DocumentData,
  sectionNumber: number,
): string {
  const type: DocumentType = "FuncSpec";
  const fieldKeys = [
    "actions.title",
    "actions.intent",
    "actions.majorSteps",
    "actions.successPath",
    "actions.errorPath",
  ] as const;
  if (!fieldKeys.some((key) => enabled(design, type, key))) return "";

  return groupItems(data, "actions").map((item, index) => {
    const title = enabled(design, type, "actions.title")
      ? item.title?.trim() || `アクション ${index + 1}`
      : `アクション ${index + 1}`;
    const lines = [`#### 4.${sectionNumber}.${index + 1} ${headingText(title)}`];

    if (enabled(design, type, "actions.intent")) {
      const bullet = optionalBullet(label(design, type, "actions.intent"), item.intent ?? "");
      if (bullet) lines.push(bullet);
    }
    if (enabled(design, type, "actions.majorSteps")) {
      const steps = numberedList(item.majorSteps ?? "");
      if (steps) lines.push("", `**${headingText(label(design, type, "actions.majorSteps"))}**`, "", steps);
    }
    if (enabled(design, type, "actions.successPath") && (item.successPath ?? "").trim()) {
      lines.push("", `**${headingText(label(design, type, "actions.successPath"))}**`, "", item.successPath ?? "");
    }
    if (enabled(design, type, "actions.errorPath") && (item.errorPath ?? "").trim()) {
      lines.push("", `**${headingText(label(design, type, "actions.errorPath"))}**`, "", item.errorPath ?? "");
    }
    return lines.join("\n");
  }).join("\n\n");
}

function renderProcessingUnits(
  design: DesignPackage,
  data: DocumentData,
  sectionNumber: number,
): string {
  const type: DocumentType = "FuncDetail";
  const details = [
    ["units.methodName", "methodName"],
    ["units.functionType", "functionType"],
    ["units.summary", "summary"],
    ["units.relatedDocuments", "relatedDocuments"],
  ] as const;

  return groupItems(data, "units").map((item, index) => {
    const title = enabled(design, type, "units.processingName")
      ? item.processingName?.trim() || `処理 ${index + 1}`
      : `処理 ${index + 1}`;
    const lines = [`#### 4.${sectionNumber}.${index + 1} ${headingText(title)}`];
    for (const [preferenceKey, dataKey] of details) {
      if (!enabled(design, type, preferenceKey)) continue;
      const bullet = optionalBullet(label(design, type, preferenceKey), item[dataKey] ?? "");
      if (bullet) lines.push(bullet);
    }
    return lines.join("\n");
  }).join("\n\n");
}

function renderInternalFlows(
  design: DesignPackage,
  data: DocumentData,
  sectionNumber: number,
): string {
  const type: DocumentType = "FuncDetail";
  const flows = [
    ["units.normalFlow", "normalFlow"],
    ["units.exceptionFlow", "exceptionFlow"],
    ["units.finallyFlow", "finallyFlow"],
  ] as const;

  return groupItems(data, "units").map((item, index) => {
    const title = enabled(design, type, "units.processingName")
      ? item.processingName?.trim() || `処理 ${index + 1}`
      : `処理 ${index + 1}`;
    const lines = [`#### 4.${sectionNumber}.${index + 1} ${headingText(title)}`];
    for (const [preferenceKey, dataKey] of flows) {
      if (!enabled(design, type, preferenceKey) || !(item[dataKey] ?? "").trim()) continue;
      lines.push("", `**${headingText(label(design, type, preferenceKey))}**`, "", item[dataKey] ?? "");
    }
    return lines.join("\n");
  }).join("\n\n");
}

function renderRelationBlocks(
  design: DesignPackage,
  data: DocumentData,
  sectionNumber: number,
  mode: "source" | "destination",
): string {
  const type: DocumentType = "Relation";
  const namePreference = mode === "source" ? "relations.sourceName" : "relations.destinationName";
  const nameKey = mode === "source" ? "sourceName" : "destinationName";
  const conditionPreference = mode === "source" ? "relations.sourceCondition" : "relations.destinationCondition";
  const conditionKey = mode === "source" ? "sourceCondition" : "destinationCondition";
  const fallback = mode === "source" ? "転送元" : "転送先";

  return groupItems(data, "relations").map((item, index) => {
    const title = enabled(design, type, namePreference)
      ? item[nameKey]?.trim() || `${fallback} ${index + 1}`
      : `${fallback} ${index + 1}`;
    const lines = [`#### 4.${sectionNumber}.${index + 1} ${headingText(title)}`];
    if (enabled(design, type, conditionPreference)) {
      const bullet = optionalBullet(label(design, type, conditionPreference), item[conditionKey] ?? "");
      if (bullet) lines.push(bullet);
    }
    if (enabled(design, type, "relations.notes")) {
      const bullet = optionalBullet(label(design, type, "relations.notes"), item.notes ?? "");
      if (bullet) lines.push(bullet);
    }
    return lines.join("\n");
  }).join("\n\n");
}

function renderSqlBlocks(design: DesignPackage, data: DocumentData, sectionNumber: number): string {
  const type: DocumentType = "Relation";
  return groupItems(data, "relations").map((item, index) => {
    const block = sqlCodeBlock(item.sql ?? "");
    return block
      ? `#### 4.${sectionNumber}.${index + 1} ${headingText(label(design, type, "relations.sql"))} ${index + 1}\n\n${block}`
      : "";
  }).filter(Boolean).join("\n\n");
}

function renderLayoutImages(
  type: "S-Layout" | "R-Layout",
  images: readonly LayoutImage[],
  sectionNumber: number,
): string {
  return images.filter((image) => image.file).sort((a, b) => a.order - b.order).map((image, index) => {
    const title = image.title.trim() || image.outputFileName.replace(/\.[^.]+$/, "");
    const alt = image.alt.trim() || title;
    const notes = image.notes.trim() ? `\n- 備考: ${image.notes}` : "";
    return [
      `#### 4.${sectionNumber}.${index + 1} ${headingText(title)}`,
      "",
      `![${alt}](${markdownImagePath(type, image)})`,
      "",
      `- ファイル: \`${type}/${image.outputFileName}\`${notes}`,
    ].join("\n");
  }).join("\n\n");
}

export function buildDocumentMainContent(
  design: DesignPackage,
  type: DocumentType,
  data: DocumentData,
): string {
  const builder = new MainContentBuilder();

  switch (type) {
    case "Hist":
      addTableSection(builder, design, type, data, "改訂履歴", "history", [
        { preferenceKey: "history.date", dataKey: "date" },
        { preferenceKey: "history.author", dataKey: "author" },
        { preferenceKey: "history.revision", dataKey: "revision" },
        { preferenceKey: "history.target", dataKey: "target" },
        { preferenceKey: "history.change", dataKey: "change" },
        { preferenceKey: "history.approvalDate", dataKey: "approvalDate" },
        { preferenceKey: "history.approvedBy", dataKey: "approvedBy" },
      ]);
      addTextSection(builder, design, type, data, "additionalNotes");
      break;
    case "Outline_A":
      addTextSection(builder, design, type, data, "purpose");
      addTextSection(builder, design, type, data, "scopeTarget");
      addTextSection(builder, design, type, data, "operationFlow", numberedList);
      addTextSection(builder, design, type, data, "preconditions");
      addTextSection(builder, design, type, data, "postconditions");
      break;
    case "Outline_B":
      addTextSection(builder, design, type, data, "processingStyle");
      addTableSection(builder, design, type, data, "CRUD・操作区分", "crud", [
        { preferenceKey: "crud.category", dataKey: "category" },
        { preferenceKey: "crud.description", dataKey: "description" },
      ]);
      addTableSection(builder, design, type, data, "関連テーブル・マスタ・インターフェース", "resources", [
        { preferenceKey: "resources.type", dataKey: "type" },
        { preferenceKey: "resources.name", dataKey: "name" },
        { preferenceKey: "resources.notes", dataKey: "notes" },
      ]);
      addTextSection(builder, design, type, data, "constraintsRemarks");
      break;
    case "S-Layout":
      addTableSection(builder, design, type, data, "画面領域", "areas", [
        { preferenceKey: "areas.area", dataKey: "area" },
        { preferenceKey: "areas.description", dataKey: "description" },
      ]);
      addTableSection(builder, design, type, data, "コントロール一覧", "controls", [
        { preferenceKey: "controls.controlId", dataKey: "controlId" },
        { preferenceKey: "controls.controlName", dataKey: "controlName" },
        { preferenceKey: "controls.type", dataKey: "type" },
        { preferenceKey: "controls.area", dataKey: "area" },
      ]);
      addTableSection(builder, design, type, data, "コントロール属性", "properties", [
        { preferenceKey: "properties.controlId", dataKey: "controlId" },
        { preferenceKey: "properties.lengthFormat", dataKey: "lengthFormat" },
        { preferenceKey: "properties.required", dataKey: "required" },
        { preferenceKey: "properties.defaultValue", dataKey: "defaultValue" },
        { preferenceKey: "properties.remarks", dataKey: "remarks" },
      ]);
      addTextSection(builder, design, type, data, "displayEditRules");
      if (enabled(design, type, "images") && data.images.some((image) => image.file)) {
        builder.add(label(design, type, "images"), (sectionNumber) => renderLayoutImages(type, data.images, sectionNumber));
      }
      break;
    case "R-Layout":
      addTableSection(builder, design, type, data, "レイアウトブロック", "blocks", [
        { preferenceKey: "blocks.block", dataKey: "block" },
        { preferenceKey: "blocks.description", dataKey: "description" },
      ]);
      addTableSection(builder, design, type, data, "出力項目", "items", [
        { preferenceKey: "items.item", dataKey: "item" },
        { preferenceKey: "items.description", dataKey: "description" },
      ]);
      addTableSection(builder, design, type, data, "列定義", "columns", [
        { preferenceKey: "columns.item", dataKey: "item" },
        { preferenceKey: "columns.type", dataKey: "type" },
        { preferenceKey: "columns.width", dataKey: "width" },
        { preferenceKey: "columns.alignment", dataKey: "alignment" },
        { preferenceKey: "columns.format", dataKey: "format" },
        { preferenceKey: "columns.notes", dataKey: "notes" },
      ]);
      addTextSection(builder, design, type, data, "outputBehaviorNotes");
      if (enabled(design, type, "images") && data.images.some((image) => image.file)) {
        builder.add(label(design, type, "images"), (sectionNumber) => renderLayoutImages(type, data.images, sectionNumber));
      }
      break;
    case "FuncSpec":
      addTextSection(builder, design, type, data, "functionUnit");
      addTextSection(builder, design, type, data, "triggerTiming");
      if (["actions.title", "actions.intent", "actions.majorSteps", "actions.successPath", "actions.errorPath"]
        .some((key) => enabled(design, type, key))) {
        builder.add("アクション詳細", (sectionNumber) => renderActionBlocks(design, data, sectionNumber));
      }
      break;
    case "Event":
      addTableSection(builder, design, type, data, "イベント一覧", "events", [
        { preferenceKey: "events.eventName", dataKey: "eventName" },
        { preferenceKey: "events.trigger", dataKey: "trigger" },
        { preferenceKey: "events.target", dataKey: "target" },
        { preferenceKey: "events.remarks", dataKey: "remarks" },
      ]);
      addTextSection(builder, design, type, data, "eventNotes");
      break;
    case "FuncDetail": {
      const unitKeys = ["units.processingName", "units.methodName", "units.functionType", "units.summary", "units.relatedDocuments"];
      if (unitKeys.some((key) => enabled(design, type, key))) {
        builder.add("処理単位", (sectionNumber) => renderProcessingUnits(design, data, sectionNumber));
      }
      const flowKeys = ["units.normalFlow", "units.exceptionFlow", "units.finallyFlow"];
      if (flowKeys.some((key) => enabled(design, type, key))) {
        builder.add("内部フロー", (sectionNumber) => renderInternalFlows(design, data, sectionNumber));
      }
      const references = [
        ["Check", "Check.md"],
        ["Others", "Others.md"],
        ["Relation", "Relation.md"],
      ].filter(([document]) => design.selectedDocuments.includes(document as DocumentType));
      if (references.length > 0) {
        builder.add("関連設計書", references.map(([document, path]) => `- ${document}: [${path}](${path})`).join("\n"));
      }
      break;
    }
    case "Relation": {
      const sourceKeys = ["relations.sourceName", "relations.sourceCondition", "relations.notes"];
      if (sourceKeys.some((key) => enabled(design, type, key))) {
        builder.add("転送元", (sectionNumber) => renderRelationBlocks(design, data, sectionNumber, "source"));
      }
      const destinationKeys = ["relations.destinationName", "relations.destinationCondition", "relations.notes"];
      if (destinationKeys.some((key) => enabled(design, type, key))) {
        builder.add("転送先", (sectionNumber) => renderRelationBlocks(design, data, sectionNumber, "destination"));
      }
      if (enabled(design, type, "relations.sql")) {
        builder.add(label(design, type, "relations.sql"), (sectionNumber) => renderSqlBlocks(design, data, sectionNumber));
      }
      break;
    }
    case "Check": {
      const contextKeys = ["screenName", "checkName", "checkTimingTrigger"];
      const contextLines = contextKeys.filter((key) => enabled(design, type, key)).map((key) =>
        `- ${headingText(label(design, type, key))}: ${text(data, key)}`,
      );
      if (contextLines.length > 0) builder.add("チェック対象", contextLines.join("\n"));
      addTableSection(builder, design, type, data, "チェック一覧", "checks", [
        { preferenceKey: "checks.checkItem", dataKey: "checkItem" },
        { preferenceKey: "checks.type", dataKey: "type" },
        { preferenceKey: "checks.detail", dataKey: "detail" },
        { preferenceKey: "checks.messageId", dataKey: "messageId" },
        { preferenceKey: "checks.messageArguments", dataKey: "messageArguments" },
      ], true);
      break;
    }
    case "Others":
      addTableSection(builder, design, type, data, "共通定数・定義", "constants", [
        { preferenceKey: "constants.name", dataKey: "name" },
        { preferenceKey: "constants.value", dataKey: "value" },
        { preferenceKey: "constants.notes", dataKey: "notes" },
      ]);
      addTableSection(builder, design, type, data, "選択肢・ファンクションキー・補助マッピング", "mappings", [
        { preferenceKey: "mappings.category", dataKey: "category" },
        { preferenceKey: "mappings.mapping", dataKey: "mapping" },
        { preferenceKey: "mappings.notes", dataKey: "notes" },
      ]);
      addTextSection(builder, design, type, data, "operationalNotes");
      break;
    case "Footnote":
      addTableSection(builder, design, type, data, "用語・注釈", "terms", [
        { preferenceKey: "terms.term", dataKey: "term" },
        { preferenceKey: "terms.description", dataKey: "description" },
      ]);
      addTableSection(builder, design, type, data, "略称・コード", "abbreviations", [
        { preferenceKey: "abbreviations.code", dataKey: "code" },
        { preferenceKey: "abbreviations.definition", dataKey: "definition" },
      ]);
      addTextSection(builder, design, type, data, "supplementalNotes");
      break;
  }

  return builder.toString();
}
