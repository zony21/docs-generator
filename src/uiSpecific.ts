import type { DocumentType } from "./model";
import type { UiActions, UiState } from "./uiContext";
import { renderAdditionalEditor } from "./uiSpecificAdditional";
import { renderBasicEditor } from "./uiSpecificBasic";

export function renderSpecificEditor(type: DocumentType, container: HTMLElement, state: UiState, actions: UiActions): void {
  const data = state.design.documents[type];
  if (!renderBasicEditor(type, container, data, state, actions)) {
    renderAdditionalEditor(type, container, data, state, actions);
  }
}
