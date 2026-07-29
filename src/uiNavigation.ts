import { getDocumentDefinition, sortDocumentTypes } from "./documentDefinitions";
import type { DocumentType } from "./model";
import type { PageId, UiActions, UiState } from "./uiContext";
import { button, element } from "./uiPrimitives";

export function pageSequence(state: UiState): PageId[] {
  return ["common", "tables", ...sortDocumentTypes(state.design.selectedDocuments)];
}

function pageLabel(page: PageId): string {
  if (page === "common") return "基本設定";
  if (page === "tables") return "テーブル設定";
  return page;
}

function pageDescription(page: PageId): string {
  if (page === "common") return "共通情報・作成対象";
  if (page === "tables") return "テーブル・関連資源";
  return getDocumentDefinition(page as DocumentType).displayName;
}

export function renderPageTabs(state: UiState, actions: UiActions): HTMLElement {
  const nav = element("nav", "page-tabs");
  nav.setAttribute("aria-label", "入力画面切り替え");
  for (const page of pageSequence(state)) {
    const active = state.currentPage === page;
    const tab = button(pageLabel(page), `page-tab${active ? " page-tab--active" : ""}`, () => actions.navigate(page));
    tab.setAttribute("aria-current", active ? "page" : "false");
    tab.title = pageDescription(page);
    const text = element("span");
    text.append(element("strong", "", pageLabel(page)), element("small", "", pageDescription(page)));
    tab.replaceChildren(text);
    nav.append(tab);
  }
  return nav;
}

export function renderPageStepper(state: UiState, actions: UiActions): HTMLElement {
  const pages = pageSequence(state);
  const currentIndex = Math.max(0, pages.indexOf(state.currentPage));
  const previous = pages[currentIndex - 1];
  const next = pages[currentIndex + 1];
  const footer = element("div", "page-stepper");
  const position = element("span", "page-stepper__position", `${currentIndex + 1} / ${pages.length}`);
  const controls = element("div", "page-stepper__actions");
  const previousButton = button(previous ? `← ${pageLabel(previous)}` : "← 前へ", "button button--ghost", () => {
    if (previous) actions.navigate(previous);
  });
  previousButton.disabled = !previous;
  const nextButton = button(next ? `${pageLabel(next)} →` : "次へ →", "button button--primary", () => {
    if (next) actions.navigate(next);
  });
  nextButton.disabled = !next;
  controls.append(previousButton, nextButton);
  footer.append(position, controls);
  return footer;
}
