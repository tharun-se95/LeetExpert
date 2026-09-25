import { describe, expect, it } from "vitest";
import { CODE_DARK } from "../src/lib/content/codePalette";
import { highlightCode } from "../src/lib/content/highlight";
import { tokenizeVizCode, vizTokenStyle } from "../src/lib/viz/highlightVizCode";

// CLAUDE.md §4, "Code colour has one source": the code well is dark in both
// themes, so Shiki paints one ink set, inline, and it is codePalette's.
const PALETTE = new Set(Object.values(CODE_DARK).map((hex) => hex.toLowerCase()));
const SAMPLE = "def pair(nums):\n    seen = {}  # value -> index\n    return None\n";

describe("code highlighting", () => {
  it("handbook blocks paint the palette's ink inline, with no theme variants", async () => {
    const html = await highlightCode(SAMPLE, "python");
    expect(html).not.toBeNull();
    expect(html, "no CSS variable for a stylesheet to choose between").not.toMatch(/--shiki-/);
    const colours = [...html!.matchAll(/(?<![-\w])color:(#[0-9a-f]{6})(?![0-9a-f])/gi)].map((m) => m[1].toLowerCase());
    expect(colours.length).toBeGreaterThan(3);
    for (const c of colours) expect(PALETTE, `${c} is not a codePalette ink`).toContain(c);
    expect(colours).toContain(CODE_DARK.keyword.toLowerCase());
    expect(colours).toContain(CODE_DARK.comment.toLowerCase());
  });

  it("viz panels get the same ink per token, and comments stay italic", async () => {
    const lines = await tokenizeVizCode(SAMPLE, "python");
    const tokens = lines.flat().filter((t) => t.content.trim());
    for (const t of tokens) {
      const style = vizTokenStyle(t);
      expect(PALETTE, `${t.content}: ${String(style.color)}`).toContain(String(style.color).toLowerCase());
    }
    const comment = tokens.find((t) => t.content.includes("value -> index"));
    expect(vizTokenStyle(comment!)).toEqual({ color: expect.stringMatching(/^#/i), fontStyle: "italic" });
    const keyword = tokens.find((t) => t.content.trim() === "def");
    expect(vizTokenStyle(keyword!).fontStyle).toBeUndefined();
  });
});
