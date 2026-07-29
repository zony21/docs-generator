import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../src/markdownRenderer";

describe("markdown renderer", () => {
  it("renders headings, lists, tables, and code blocks", () => {
    const html = renderMarkdown([
      "# Title",
      "",
      "1. First",
      "2. Second",
      "",
      "| Name | Value |",
      "| --- | --- |",
      "| A | B |",
      "",
      "```sql",
      "SELECT * FROM T",
      "```",
    ].join("\n"));
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<ol><li>First</li><li>Second</li></ol>");
    expect(html).toContain("<th>Name</th>");
    expect(html).toContain("SELECT * FROM T");
  });

  it("escapes HTML and resolves local images", () => {
    const html = renderMarkdown(
      "<script>alert(1)</script>\n\n![画面](./S-Layout/screen.png)",
      (path) => path.includes("screen.png") ? "blob:screen" : undefined,
    );
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain('src="blob:screen"');
  });
});
