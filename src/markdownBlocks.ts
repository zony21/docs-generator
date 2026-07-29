import { markdownImagePath } from "./imageAssets";
import type { GroupItem, LayoutImage } from "./model";
import { numberedList, optionalBullet, sqlCodeBlock } from "./markdownUtils";

export function actionBlocks(items: readonly GroupItem[]): string {
  return items.map((item, index) => {
    const title = item.title?.trim() || `Action ${index + 1}`;
    const lines = [`#### 4.3.${index + 1} ${title}`, optionalBullet("Intent", item.intent ?? "")];
    const steps = numberedList(item.majorSteps ?? "");
    if (steps) lines.push("", "**Major steps**", "", steps);
    if ((item.successPath ?? "").trim()) lines.push("", "**Success path**", "", item.successPath);
    if ((item.errorPath ?? "").trim()) lines.push("", "**Error/interruption path**", "", item.errorPath);
    return lines.filter((line, position, source) => line !== "" || source[position - 1] !== "").join("\n");
  }).join("\n\n");
}

export function processingUnitBlocks(items: readonly GroupItem[]): string {
  return items.map((item, index) => [
    `#### 4.1.${index + 1} ${item.processingName?.trim() || `Processing unit ${index + 1}`}`,
    optionalBullet("Function / method", item.methodName ?? ""),
    optionalBullet("Type", item.functionType ?? ""),
    optionalBullet("Summary", item.summary ?? ""),
    optionalBullet("Related documents", item.relatedDocuments ?? ""),
  ].filter(Boolean).join("\n")).join("\n\n");
}

export function internalFlowBlocks(items: readonly GroupItem[]): string {
  return items.map((item, index) => {
    const sections = [`#### 4.2.${index + 1} ${item.processingName?.trim() || `Processing unit ${index + 1}`}`];
    if ((item.normalFlow ?? "").trim()) sections.push("", "**try**", "", item.normalFlow);
    if ((item.exceptionFlow ?? "").trim()) sections.push("", "**catch**", "", item.exceptionFlow);
    if ((item.finallyFlow ?? "").trim()) sections.push("", "**finally**", "", item.finallyFlow);
    return sections.join("\n");
  }).join("\n\n");
}

export function relationSourceBlocks(items: readonly GroupItem[]): string {
  return items.map((item, index) => [
    `#### 4.1.${index + 1} ${item.sourceName?.trim() || `Source ${index + 1}`}`,
    optionalBullet("Condition", item.sourceCondition ?? ""),
    optionalBullet("Notes", item.notes ?? ""),
  ].filter(Boolean).join("\n")).join("\n\n");
}

export function relationDestinationBlocks(items: readonly GroupItem[]): string {
  return items.map((item, index) => [
    `#### 4.2.${index + 1} ${item.destinationName?.trim() || `Destination ${index + 1}`}`,
    optionalBullet("Condition", item.destinationCondition ?? ""),
    optionalBullet("Notes", item.notes ?? ""),
  ].filter(Boolean).join("\n")).join("\n\n");
}

export function relationSqlBlocks(items: readonly GroupItem[]): string {
  return items.map((item, index) => {
    const block = sqlCodeBlock(item.sql ?? "");
    return block ? `#### 4.3.${index + 1} SQL ${index + 1}\n\n${block}` : "";
  }).filter(Boolean).join("\n\n");
}

export function layoutImageSection(type: "S-Layout" | "R-Layout", images: readonly LayoutImage[]): string {
  const available = images.filter((image) => image.file).sort((a, b) => a.order - b.order);
  if (available.length === 0) return "";
  const blocks = available.map((image, index) => {
    const title = image.title.trim() || image.outputFileName.replace(/\.[^.]+$/, "");
    const alt = image.alt.trim() || title;
    const notes = image.notes.trim() ? `\n- Notes: ${image.notes}` : "";
    return [
      `#### 4.5.${index + 1} ${title}`,
      "",
      `![${alt}](${markdownImagePath(type, image)})`,
      "",
      `- File: \`${type}/${image.outputFileName}\`${notes}`,
    ].join("\n");
  });
  return `### 4.5 Layout images\n\n${blocks.join("\n\n")}`;
}
