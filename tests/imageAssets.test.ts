import { describe, expect, it } from "vitest";
import {
  imageAssetPath,
  markdownImagePath,
  normalizeImageFileName,
  validateImageFile,
} from "../src/imageAssets";
import type { LayoutImage } from "../src/model";

function image(outputFileName: string): LayoutImage {
  return {
    id: "1",
    originalFileName: outputFileName,
    outputFileName,
    mimeType: "image/png",
    size: 100,
    title: "画面全体",
    alt: "画面全体",
    notes: "",
    order: 1,
  };
}

describe("image assets", () => {
  it("normalizes forbidden characters and extension case", () => {
    expect(normalizeImageFileName(" 画面/全体.PNG ")).toBe("画面_全体.png");
    expect(normalizeImageFileName("../screen.png")).toBe("screen.png");
  });

  it("adds suffixes for duplicate names", () => {
    expect(normalizeImageFileName("screen.png", ["screen.png"])).toBe("screen-2.png");
    expect(normalizeImageFileName("screen.png", ["screen.png", "screen-2.png"])).toBe("screen-3.png");
  });

  it("creates the specified ZIP and Markdown paths", () => {
    const value = image("screen.png");
    expect(imageAssetPath("S-Layout", value)).toBe("sheets/S-Layout/screen.png");
    expect(markdownImagePath("S-Layout", value)).toBe("./S-Layout/screen.png");
  });

  it("rejects unsupported images and files over 10MB", () => {
    const svg = new File(["<svg />"], "screen.svg", { type: "image/svg+xml" });
    const large = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "large.png", { type: "image/png" });
    expect(validateImageFile(svg).join("\n")).toContain("PNG、JPEG、WebP");
    expect(validateImageFile(large).join("\n")).toContain("10MB以下");
  });
});
