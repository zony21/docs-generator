import type { DocumentType } from "./model";
import type { UiActions, UiState } from "./uiContext";
import { renderAuthoritativeEditor } from "./uiAuthoritativeEditors";

export function renderSpecificEditor(type: DocumentType, container: HTMLElement, state: UiState, actions: UiActions): void {
  renderAuthoritativeEditor(type, container, state, actions);
}
