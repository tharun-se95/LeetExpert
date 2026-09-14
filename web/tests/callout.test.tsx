import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Markdown } from "@/components/md/Markdown";

const render = (source: string) =>
  renderToStaticMarkup(
    <Markdown source={source} highlightedBlocks={{}} highlightedTabs={{}} />,
  );

/** The uppercase label a Callout draws above its body, or null when it has none. */
const labelOf = (html: string) =>
  /<blockquote[^>]*>[\s\S]*?<p class="[^"]*uppercase[^"]*">(?:<svg[\s\S]*?<\/svg>)?([^<]+)<\/p>/.exec(
    html,
  )?.[1] ?? null;

describe("callouts in lesson markdown (spec 2026-09-13)", () => {
  it.each([
    ["key", "Key idea"],
    ["brain", "Mental model"],
    ["warn", "Watch out"],
    ["tip", "Tip"],
    ["goal", "Goal"],
    ["constraint", "Constraints"],
  ])("a %s fence renders a callout labelled %s", (fence, label) => {
    const html = render(`\`\`\`${fence}\nThe body.\n\`\`\``);
    expect(labelOf(html)).toBe(label);
    expect(html).toContain("The body.");
  });

  it("a plain blockquote is unlabelled, even when it opens with a legacy emoji", () => {
    for (const source of ["> A quotation.", "> 💡 A quotation.", "> 🚀 A quotation."]) {
      const html = render(source);
      expect(html).toContain("<blockquote");
      expect(labelOf(html)).toBeNull();
    }
  });

  it("note is no longer a callout", () => {
    expect(render("```note\nPlain.\n```")).not.toContain("<blockquote");
  });
});
