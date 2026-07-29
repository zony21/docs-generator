import type { DocumentData, DocumentType } from "./model";
import {
  actionBlocks,
  internalFlowBlocks,
  layoutImageSection,
  processingUnitBlocks,
  relationDestinationBlocks,
  relationSourceBlocks,
  relationSqlBlocks,
} from "./markdownBlocks";
import { groupItems, markdownTableRows, numberedList, tableRows, textValue } from "./markdownUtils";

export function documentSpecificTokens(type: DocumentType, data: DocumentData): Record<string, string> {
  const rows = (key: string) => tableRows(data, key);
  const text = (key: string) => textValue(data, key);
  const groups = (key: string) => groupItems(data, key);
  switch (type) {
    case "Hist":
      return {
        HIST_ROWS: markdownTableRows(rows("history"), ["date", "author", "revision", "target", "change", "approvalDate", "approvedBy"]),
        ADDITIONAL_NOTES: text("additionalNotes"),
      };
    case "Outline_A":
      return {
        PURPOSE: text("purpose"),
        SCOPE_TARGET: text("scopeTarget"),
        OPERATION_FLOW: numberedList(text("operationFlow")),
        PRECONDITIONS: text("preconditions"),
        POSTCONDITIONS: text("postconditions"),
      };
    case "Outline_B":
      return {
        PROCESSING_STYLE: text("processingStyle"),
        CRUD_ROWS: markdownTableRows(rows("crud"), ["category", "description"]),
        RELATED_RESOURCE_ROWS: markdownTableRows(rows("resources"), ["type", "name", "notes"]),
        CONSTRAINTS_REMARKS: text("constraintsRemarks"),
      };
    case "S-Layout":
      return {
        SCREEN_AREA_ROWS: markdownTableRows(rows("areas"), ["area", "description"]),
        CONTROL_ROWS: markdownTableRows(rows("controls"), ["controlId", "controlName", "type", "area"]),
        CONTROL_PROPERTY_ROWS: markdownTableRows(rows("properties"), ["controlId", "lengthFormat", "required", "defaultValue", "remarks"]),
        DISPLAY_EDIT_RULES: text("displayEditRules"),
        LAYOUT_IMAGE_SECTION: layoutImageSection("S-Layout", data.images),
      };
    case "R-Layout":
      return {
        LAYOUT_BLOCK_ROWS: markdownTableRows(rows("blocks"), ["block", "description"]),
        OUTPUT_ITEM_ROWS: markdownTableRows(rows("items"), ["item", "description"]),
        COLUMN_DEFINITION_ROWS: markdownTableRows(rows("columns"), ["item", "type", "width", "alignment", "format", "notes"]),
        OUTPUT_BEHAVIOR_NOTES: text("outputBehaviorNotes"),
        LAYOUT_IMAGE_SECTION: layoutImageSection("R-Layout", data.images),
      };
    case "FuncSpec":
      return {
        FUNCTION_UNIT: text("functionUnit"),
        TRIGGER_TIMING: text("triggerTiming"),
        ACTION_DETAIL_BLOCKS: actionBlocks(groups("actions")),
      };
    case "Event":
      return {
        EVENT_ROWS: markdownTableRows(rows("events"), ["eventName", "trigger", "target", "remarks"]),
        EVENT_NOTES: text("eventNotes"),
      };
    case "FuncDetail":
      return {
        PROCESSING_UNIT_BLOCKS: processingUnitBlocks(groups("units")),
        INTERNAL_FLOW_BLOCKS: internalFlowBlocks(groups("units")),
      };
    case "Relation":
      return {
        TRANSFER_SOURCE_BLOCKS: relationSourceBlocks(groups("relations")),
        TRANSFER_DESTINATION_BLOCKS: relationDestinationBlocks(groups("relations")),
        SQL_BLOCKS: relationSqlBlocks(groups("relations")),
      };
    case "Check":
      return {
        SCREEN_NAME: text("screenName"),
        CHECK_NAME: text("checkName"),
        CHECK_TIMING_TRIGGER: text("checkTimingTrigger"),
        CHECK_ROWS: markdownTableRows(rows("checks"), ["checkItem", "type", "detail", "messageId", "messageArguments"], true),
      };
    case "Others":
      return {
        CONSTANT_ROWS: markdownTableRows(rows("constants"), ["name", "value", "notes"]),
        MAPPING_ROWS: markdownTableRows(rows("mappings"), ["category", "mapping", "notes"]),
        OPERATIONAL_NOTES: text("operationalNotes"),
      };
    case "Footnote":
      return {
        TERM_ROWS: markdownTableRows(rows("terms"), ["term", "description"]),
        ABBREVIATION_ROWS: markdownTableRows(rows("abbreviations"), ["code", "definition"]),
        SUPPLEMENTAL_NOTES: text("supplementalNotes"),
      };
  }
}
