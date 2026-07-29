import { getInputFieldPreference } from "./inputFieldDefinitions";
import { markdownImagePath } from "./imageAssets";
import {
  defaultScreenLayoutName,
  type DesignPackage,
  type DocumentData,
  type ScreenLayoutSection,
  type TableRow,
} from "./model";
import { escapeMarkdownCell } from "./markdownUtils";

interface ScreenTableColumn {
  preferenceKey: string;
  dataKey: string;
}

const SCREEN_COLUMNS: readonly ScreenTableColumn[] = [
  { preferenceKey: "screenItems.itemName", dataKey: "itemName" },
  { preferenceKey: "screenItems.type", dataKey: "type" },
  { preferenceKey: "screenItems.io", dataKey: "io" },
  { preferenceKey: "screenItems.length", dataKey: "length" },
  { preferenceKey: "screenItems.required", dataKey: "required" },
  { preferenceKey: "screenItems.screenMode1", dataKey: "screenMode1" },
  { preferenceKey: "screenItems.screenMode2", dataKey: "screenMode2" },
  { preferenceKey: "screenItems.screenMode3", dataKey: "screenMode3" },
  { preferenceKey: "screenItems.separator", dataKey: "separator" },
  { preferenceKey: "screenItems.notes", dataKey: "notes" },
  { preferenceKey: "screenItems.focusMessage", dataKey: "focusMessage" },
];

function headingText(value: string): string {
  return value.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim() || "項目";
}

function preference(design: DesignPackage, key: string) {
  return getInputFieldPreference(design, "S-Layout", key);
}

function enabled(design: DesignPackage, key: string): boolean {
  return preference(design, key).enabled;
}

function label(design: DesignPackage, key: string): string {
  return preference(design, key).label;
}

function renderScreenTable(design: DesignPackage, rows: readonly TableRow[]): string | null {
  const columns = SCREEN_COLUMNS.filter((column) => enabled(design, column.preferenceKey));
  if (columns.length === 0) return null;

  const headers = ["No.", ...columns.map((column) => escapeMarkdownCell(label(design, column.preferenceKey)))];
  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
  ];
  rows.forEach((row, index) => {
    const cells = [
      String(index + 1),
      ...columns.map((column) => escapeMarkdownCell(row[column.dataKey] ?? "")),
    ];
    lines.push(`| ${cells.join(" | ")} |`);
  });
  return lines.join("\n");
}

function renderScreenImage(design: DesignPackage, screen: ScreenLayoutSection, screenName: string): string {
  if (!enabled(design, "screens.image") || !screen.image?.file) return "";
  const alt = screen.image.alt.trim() || screenName;
  return `![${alt}](${markdownImagePath("S-Layout", screen.image)})`;
}

function renderScreenNotes(design: DesignPackage, screen: ScreenLayoutSection): string {
  if (!enabled(design, "screens.notes") || !screen.notes.trim()) return "";
  return `#### ${headingText(label(design, "screens.notes"))}\n\n${screen.notes.trim()}`;
}

function renderScreen(
  design: DesignPackage,
  screen: ScreenLayoutSection,
  index: number,
): string {
  const configuredName = enabled(design, "screens.name") ? screen.name.trim() : "";
  const screenName = configuredName || defaultScreenLayoutName(index);
  const blocks = [`### 4.${index + 1} ${headingText(screenName)}`];

  const image = renderScreenImage(design, screen, screenName);
  if (image) blocks.push(image);

  const notes = renderScreenNotes(design, screen);
  if (notes) blocks.push(notes);

  const items = renderScreenTable(design, screen.items);
  if (items) blocks.push(items);

  if (enabled(design, "screens.footer")) {
    const footer = renderScreenTable(design, screen.footerItems);
    if (footer) {
      blocks.push(`#### ${headingText(label(design, "screens.footer"))}\n\n${footer}`);
    }
  }

  return blocks.join("\n\n");
}

export function buildScreenLayoutMainContent(
  design: DesignPackage,
  data: DocumentData,
): string {
  return [...data.screens]
    .sort((left, right) => left.order - right.order)
    .map((screen, index) => renderScreen(design, screen, index))
    .join("\n\n");
}
