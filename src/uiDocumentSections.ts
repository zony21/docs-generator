import { getDocumentDefinition, sortDocumentTypes } from "./documentDefinitions";
import type { DocumentType } from "./model";
import type { UiActions, UiState } from "./uiContext";
import { renderSummaryEditor } from "./uiEditors";
import { element, sectionHeader } from "./uiPrimitives";
import { renderSpecificEditor } from "./uiSpecific";

function renderDocumentEditor(type: DocumentType, state: UiState, actions: UiActions): HTMLElement {
  const definition = getDocumentDefinition(type);
  const details = element("details", "document-editor") as HTMLDetailsElement;
  details.open = true;
  const summary = element("summary");
  const text = element("span");
  text.append(element("strong", "", type), element("small", "", definition.displayName));
  summary.append(text, element("span", "document-editor__path", definition.outputPath));
  details.append(summary);
  const body = element("div", "document-editor__body");
  renderSummaryEditor(state.design.documents[type], body, actions);
  renderSpecificEditor(type, body, state, actions);
  details.append(body);
  return details;
}

export function renderDocumentEditors(state: UiState, actions: UiActions): HTMLElement {
  const section = element("section", "panel");
  section.append(sectionHeader("3", "設計内容", "選択済みの設計書だけ表示します。入力していない内容は補完しません。"));
  const selected = sortDocumentTypes(state.design.selectedDocuments);
  if (selected.length === 0) {
    section.append(element("p", "empty-state empty-state--large", "設計書が選択されていません。上の一覧から選択してください。"));
    return section;
  }
  const stack = element("div", "document-stack");
  for (const type of selected) stack.append(renderDocumentEditor(type, state, actions));
  section.append(stack);
  return section;
}
