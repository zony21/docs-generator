export interface FieldOptions {
  type?: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  compact?: boolean;
}

export interface ColumnDefinition {
  key: string;
  label: string;
  textarea?: boolean;
  placeholder?: string;
}

export function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
  text = "",
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function button(label: string, className: string, onClick: () => void): HTMLButtonElement {
  const node = element("button", className, label);
  node.type = "button";
  node.addEventListener("click", onClick);
  return node;
}

export function field(
  labelText: string,
  value: string,
  onInput: (value: string) => void,
  onChanged: () => void,
  options: FieldOptions = {},
): HTMLElement {
  const wrapper = element("label", options.compact ? "field field--compact" : "field");
  const label = element("span", "field__label", labelText);
  if (options.required) label.append(element("span", "required-mark", " *"));
  wrapper.append(label);

  if (options.rows) {
    const textarea = element("textarea") as HTMLTextAreaElement;
    textarea.value = value;
    textarea.rows = options.rows;
    textarea.placeholder = options.placeholder ?? "";
    textarea.addEventListener("input", () => { onInput(textarea.value); onChanged(); });
    wrapper.append(textarea);
  } else {
    const input = element("input") as HTMLInputElement;
    input.type = options.type ?? "text";
    input.value = value;
    input.placeholder = options.placeholder ?? "";
    input.addEventListener("input", () => { onInput(input.value); onChanged(); });
    wrapper.append(input);
  }
  return wrapper;
}

export function sectionHeader(number: string, title: string, description: string): HTMLElement {
  const header = element("div", "section-heading");
  const text = element("div");
  text.append(element("h2", "", title), element("p", "", description));
  header.append(element("span", "section-heading__number", number), text);
  return header;
}

export function moveItem<T>(items: T[], index: number, delta: -1 | 1): void {
  const destination = index + delta;
  if (destination < 0 || destination >= items.length) return;
  [items[index], items[destination]] = [items[destination], items[index]];
}
