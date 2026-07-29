import { getDocumentDefinition } from "./documentDefinitions";
import type { DocumentType } from "./model";
import type { UiActions, UiState } from "./uiContext";
import { renderSummaryEditor } from "./uiEditors";
import { renderFieldSettings } from "./uiFieldSettings";
import { renderPageStepper } from "./uiNavigation";
import { button, element, sectionHeader } from "./uiPrimitives";
import { renderSpecificEditor } from "./uiSpecific";

export function renderDocumentPage(type: DocumentType, state: UiState, actions: UiActions): HTMLElement {
  const definition = getDocumentDefinition(type);
  const section = element("section", "panel editor-panel sheet-page");
  const headingRow = element("div", "sheet-page__heading");
  headingRow.append(
    sectionHeader("3", `${type} — ${definition.displayName}`, "このシートの入力だけを表示しています。右側で生成結果を確認できます。"),
  );
  const controls = element("div", "sheet-page__controls");
  controls.append(
    element("code", "document-editor__path", definition.outputPath),
    button(
      state.editingFields === type ? "項目設定を閉じる" : "入力項目を設定",
      "button button--small button--secondary",
      () => {
        state.editingFields = state.editingFields === type ? null : type;
        actions.render();
      },
    ),
  );
  headingRow.append(controls);
  section.append(headingRow);

  if (state.editingFields === type) {
    section.append(renderFieldSettings(type, state, actions));
  }

  const body = element("div", "document-editor__body document-editor__body--page");
  renderSummaryEditor(type, state.design.documents[type], body, state, actions);
  renderSpecificEditor(type, body, state, actions);
  section.append(body, renderPageStepper(state, actions));
  return section;
}
