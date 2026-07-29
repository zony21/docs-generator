import { buildDocumentMainContent } from "./documentContentBuilder";
import type { DesignPackage, DocumentData, DocumentType } from "./model";

export function documentSpecificTokens(
  design: DesignPackage,
  type: DocumentType,
  data: DocumentData,
): Record<string, string> {
  return {
    MAIN_CONTENT: buildDocumentMainContent(design, type, data),
  };
}
