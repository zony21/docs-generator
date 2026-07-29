import {
  getInputFieldPreference,
  INPUT_FIELD_DEFINITIONS,
  resetDocumentInputFields,
  resetInputFieldPreference,
  setInputFieldPreference,
} from "./inputFieldDefinitions";
import type { DesignPackage, DocumentType } from "./model";
import type { UiActions, UiState } from "./uiContext";
import { button, element, type ColumnDefinition } from "./uiPrimitives";

export function isInputFieldEnabled(design: DesignPackage, type: DocumentType, key: string): boolean {
  return getInputFieldPreference(design, type, key).enabled;
}

export function inputFieldLabel(
  design: DesignPackage,
  type: DocumentType,
  key: string,
  fallback: string,
): string {
  const preference = getInputFieldPreference(design, type, key);
  return preference.label || fallback;
}

export function configuredColumns(
  design: DesignPackage,
  type: DocumentType,
  scope: string,
  columns: readonly ColumnDefinition[],
): ColumnDefinition[] {
  return columns
    .filter((column) => isInputFieldEnabled(design, type, `${scope}.${column.key}`))
    .map((column) => ({
      ...column,
      label: inputFieldLabel(design, type, `${scope}.${column.key}`, column.label),
    }));
}

export function renderFieldSettings(type: DocumentType, state: UiState, actions: UiActions): HTMLElement {
  const panel = element("section", "field-settings");
  const heading = element("div", "subsection__heading");
  const title = element("div");
  title.append(
    element("h3", "", "入力項目設定"),
    element("p", "helper-text", "項目名を変更したり、不要な項目を非表示にできます。非表示にしても入力済みデータは保持されます。"),
  );
  const controls = element("div", "button-row button-row--compact");
  controls.append(
    button("すべて初期状態へ", "button button--small button--ghost", () => {
      if (!window.confirm("このシートの項目名と表示状態をすべて初期設定へ戻しますか？")) return;
      resetDocumentInputFields(state.design, type);
      actions.changed();
      actions.render();
    }),
    button("設定を閉じる", "button button--small button--secondary", () => {
      state.editingFields = null;
      actions.render();
    }),
  );
  heading.append(title, controls);
  panel.append(heading);

  const list = element("div", "field-settings__list");
  for (const definition of INPUT_FIELD_DEFINITIONS[type]) {
    const preference = getInputFieldPreference(state.design, type, definition.key);
    const row = element("div", "field-setting-row");
    const visibleLabel = element("label", "field-setting-row__toggle");
    const checkbox = element("input") as HTMLInputElement;
    checkbox.type = "checkbox";
    checkbox.checked = preference.enabled;
    checkbox.addEventListener("change", () => {
      setInputFieldPreference(state.design, type, definition.key, {
        label: nameInput.value,
        enabled: checkbox.checked,
      });
      actions.changed();
    });
    visibleLabel.append(checkbox, element("span", "", checkbox.checked ? "表示" : "非表示"));

    const nameInput = element("input") as HTMLInputElement;
    nameInput.value = preference.label;
    nameInput.placeholder = definition.defaultLabel;
    nameInput.addEventListener("input", () => {
      setInputFieldPreference(state.design, type, definition.key, {
        label: nameInput.value,
        enabled: checkbox.checked,
      });
      actions.changed();
    });

    const reset = button("初期値", "icon-button icon-button--text", () => {
      resetInputFieldPreference(state.design, type, definition.key);
      actions.changed();
      actions.render();
    });
    row.append(
      visibleLabel,
      element("code", "field-setting-row__key", definition.key),
      nameInput,
      reset,
    );
    list.append(row);
  }
  panel.append(list);
  return panel;
}
