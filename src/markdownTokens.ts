import { buildDocumentMainContent } from "./documentContentBuilder";
import { getInputFieldPreference } from "./inputFieldDefinitions";
import type { DesignPackage, DocumentData, DocumentType, GroupItem } from "./model";
import { buildScreenLayoutMainContent } from "./screenLayoutMarkdown";

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function headingLabel(value: string): string {
  return value.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
}

function prefixGroupHeading(
  content: string,
  index: number,
  value: string,
  customLabel: string,
): string {
  const pattern = new RegExp(`^(#### 4\\.\\d+\\.${index + 1} )${escapeRegularExpression(value)}$`, "gm");
  return content.replace(pattern, `$1${headingLabel(customLabel)}: ${value}`);
}

function preference(design: DesignPackage, type: DocumentType, key: string) {
  return getInputFieldPreference(design, type, key);
}

function prefixConfiguredGroupHeadings(
  design: DesignPackage,
  type: DocumentType,
  data: DocumentData,
  content: string,
): string {
  let result = content;

  if (type === "FuncSpec") {
    const titlePreference = preference(design, type, "actions.title");
    if (!titlePreference.enabled) return result;
    (data.groups.actions ?? []).forEach((item: GroupItem, index) => {
      const value = item.title?.trim() || `アクション ${index + 1}`;
      result = prefixGroupHeading(result, index, value, titlePreference.label);
    });
    return result;
  }

  if (type === "FuncDetail") {
    const namePreference = preference(design, type, "units.processingName");
    if (!namePreference.enabled) return result;
    (data.groups.units ?? []).forEach((item: GroupItem, index) => {
      const value = item.processingName?.trim() || `処理 ${index + 1}`;
      result = prefixGroupHeading(result, index, value, namePreference.label);
    });
    return result;
  }

  if (type === "Relation") {
    const sourcePreference = preference(design, type, "relations.sourceName");
    const destinationPreference = preference(design, type, "relations.destinationName");
    (data.groups.relations ?? []).forEach((item: GroupItem, index) => {
      if (sourcePreference.enabled) {
        const value = item.sourceName?.trim() || `転送元 ${index + 1}`;
        result = prefixGroupHeading(result, index, value, sourcePreference.label);
      }
      if (destinationPreference.enabled) {
        const value = item.destinationName?.trim() || `転送先 ${index + 1}`;
        result = prefixGroupHeading(result, index, value, destinationPreference.label);
      }
    });
  }

  return result;
}

export function documentSpecificTokens(
  design: DesignPackage,
  type: DocumentType,
  data: DocumentData,
): Record<string, string> {
  const mainContent = type === "S-Layout"
    ? buildScreenLayoutMainContent(design, data)
    : buildDocumentMainContent(design, type, data);
  return {
    MAIN_CONTENT: type === "S-Layout"
      ? mainContent
      : prefixConfiguredGroupHeadings(design, type, data, mainContent),
  };
}
