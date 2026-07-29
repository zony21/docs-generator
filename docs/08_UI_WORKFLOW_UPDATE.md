# UI Workflow Update

## Screen structure

The application uses the following page sequence.

1. Common settings
2. Table/resource settings
3. One page for each selected design sheet

The user can move with the top tabs or the Previous/Next buttons.

## Sheet summary

Each sheet starts with the extracted Excel summary values. The summary is read-only by default and becomes editable when the user presses Edit. The initial values can be restored at any time.

## Table/resource catalog

Tables, masters, views, interfaces, DTOs, and other resources can be registered before editing sheets. Registered resources are available as presets and input suggestions in Outline_B and Relation.

## Input field settings

Each sheet has an Input field settings panel.

- Change the displayed input label.
- Hide unnecessary fields.
- Restore one field to its initial setting.
- Restore every field in the sheet.
- Keep entered data while a field is hidden.

The setting changes the form only. The authoritative Markdown template structure remains unchanged.

## Preview modes

The preview panel has two modes.

- Rendered preview
- Markdown source

The user can switch modes without leaving the current sheet page.
