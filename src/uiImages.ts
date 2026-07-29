import { createLayoutImages, revokeImagePreview } from "./imageAssets";
import type { LayoutImage } from "./model";
import type { UiActions, UiState } from "./uiContext";
import { button, element, field, moveItem } from "./uiPrimitives";

function updateOrders(images: LayoutImage[]): void {
  images.forEach((image, index) => { image.order = index + 1; });
}

function refresh(actions: UiActions): void {
  actions.render();
  actions.changed();
}

export function renderImageEditor(
  type: "S-Layout" | "R-Layout",
  container: HTMLElement,
  state: UiState,
  actions: UiActions,
): void {
  const data = state.design.documents[type];
  const subsection = element("div", "subsection");
  const heading = element("div", "subsection__heading");
  heading.append(element("h3", "", "レイアウト画像"));
  const label = element("label", "button button--small button--secondary file-button", "画像を選択");
  const input = element("input") as HTMLInputElement;
  input.type = "file";
  input.multiple = true;
  input.accept = ".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp";
  input.addEventListener("change", () => {
    const result = createLayoutImages([...(input.files ?? [])], data.images);
    data.images.push(...result.images);
    actions.setMessages(result.errors);
    refresh(actions);
  });
  label.append(input);
  heading.append(label);
  subsection.append(
    heading,
    element("p", "helper-text", "PNG・JPEG・WebP、1枚10MB以下、最大10枚。画像は対象Markdownと同名のフォルダへ出力します。"),
  );
  if (data.images.length === 0) subsection.append(element("p", "empty-state", "画像はまだ選択されていません。"));

  data.images.forEach((image, index) => {
    const card = element("div", "image-card");
    const preview = element("div", "image-card__preview");
    if (image.previewUrl) {
      const img = element("img") as HTMLImageElement;
      img.src = image.previewUrl;
      img.alt = image.alt || image.title;
      preview.append(img);
    } else {
      preview.append(element("span", "", "再選択が必要です"));
    }
    const content = element("div", "image-card__content");
    const header = element("div", "row-card__header");
    header.append(element("strong", "", `${index + 1}. ${image.outputFileName}`));
    const controls = element("div", "row-actions");
    controls.append(
      button("↑", "icon-button", () => { moveItem(data.images, index, -1); updateOrders(data.images); refresh(actions); }),
      button("↓", "icon-button", () => { moveItem(data.images, index, 1); updateOrders(data.images); refresh(actions); }),
      button("削除", "icon-button icon-button--danger icon-button--text", () => {
        revokeImagePreview(image);
        data.images.splice(index, 1);
        updateOrders(data.images);
        refresh(actions);
      }),
    );
    header.append(controls);
    const grid = element("div", "form-grid");
    grid.append(
      field("表示名", image.title, (value) => { image.title = value; }, actions.changed, { compact: true }),
      field("代替テキスト", image.alt, (value) => { image.alt = value; }, actions.changed, { compact: true }),
    );
    content.append(
      header,
      grid,
      field("備考", image.notes, (value) => { image.notes = value; }, actions.changed, { rows: 2, compact: true }),
    );
    card.append(preview, content);
    subsection.append(card);
  });
  container.append(subsection);
}
