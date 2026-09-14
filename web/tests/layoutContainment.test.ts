import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (...p: string[]) => readFileSync(join(__dirname, "..", "src", ...p), "utf8");
const shell = read("components", "layout", "AppShell.tsx");
const globals = read("app", "globals.css");

/** The head of the `@media ... {` block that encloses `index`, or null. */
function enclosingMedia(css: string, index: number): string | null {
  let depth = 0;
  for (let i = index; i >= 0; i--) {
    if (css[i] === "}") depth++;
    else if (css[i] === "{") {
      if (depth === 0) {
        const head = css.slice(css.lastIndexOf("\n", i) + 1, i).trim();
        if (head.startsWith("@media")) return head;
      } else depth--;
    }
  }
  return null;
}

describe("app shell scroll containment", () => {
  it("makes <main> the containing block for everything positioned inside a page", () => {
    // The shell is h-dvh + overflow-hidden and only <main> scrolls. An
    // absolutely positioned element with no positioned ancestor (the Cheatsheet
    // complexity table's sr-only <caption>) resolved against the initial
    // containing block instead, escaped the shell's clip, and made the document
    // 577px taller than the viewport: Page Down then scrolled the document and
    // dragged the shell up over blank background. A positioned <main> contains
    // that whole class of element, not just this one caption.
    const main = shell.match(/<main\s+className=\{cn\(\s*"([^"]*)"/)?.[1];
    expect(main, "<main> base classes").toBeDefined();
    expect(main).toMatch(/\brelative\b/);
  });
});

describe("module card flip", () => {
  it("only flips where the flip layout exists (hover-capable devices)", () => {
    // On (hover: none) the faces stack in flow with visible backfaces. The flip
    // trigger out-ranked that block's transform:none (a media query adds no
    // specificity), so a tap's sticky :hover rotated the stacked card 180deg
    // and showed its front mirrored.
    const selector =
      ".module-card:hover .module-card-inner,\n  .module-card:focus-visible .module-card-inner";
    const flat =
      ".module-card:hover .module-card-inner,\n.module-card:focus-visible .module-card-inner";
    const at = Math.max(globals.indexOf(selector), globals.indexOf(flat));
    expect(at, "flip trigger rule").toBeGreaterThanOrEqual(0);
    expect(enclosingMedia(globals, at)).toBe("@media (hover: hover)");
  });
});
