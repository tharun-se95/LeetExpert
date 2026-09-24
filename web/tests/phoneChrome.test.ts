import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (...p: string[]) => readFileSync(join(__dirname, "..", "src", ...p), "utf8");
const sheet = read("components", "layout", "MobileLessonsSheet.tsx");
const panel = read("components", "layout", "CourseNavPanel.tsx");

describe("the phone lessons sheet's left edge (owner, 2026-09-24)", () => {
  it("paints no accent strip down the edge: in dark it read as a white line", () => {
    expect(sheet).not.toMatch(/before:bg-accent|before:w-1/);
  });

  it("gives the back row's hanging caret room inside the screen at the phone's 13px root", () => {
    const caret = Number(panel.match(/left-\[-(\d+)px\]/)?.[1]);
    const pad = Number(sheet.match(/<CourseNavTree[^>]*className="[^"]*\bpx-(\d+)\b/)?.[1]);
    expect(caret, "caret offset").toBeGreaterThan(0);
    // Tailwind spacing is 0.25rem a step; the phone root is 13px (globals.css).
    expect(pad * 0.25 * 13).toBeGreaterThan(caret);
  });
});

describe("the headers' theme toggle on phones (owner, 2026-09-24)", () => {
  it("is one shared class set, hidden below sm, used by both headers", () => {
    const chrome = read("components", "layout", "headerChrome.ts");
    const cls = chrome.match(/export const THEME_TOGGLE = "([^"]+)"/)?.[1] ?? "";
    expect(cls.split(" ")).toContain("max-sm:hidden");
    for (const file of [read("components", "layout", "Header.tsx"), read("components", "landing", "LandingHeader.tsx")]) {
      expect(file).toContain("<ThemeToggle className={THEME_TOGGLE} />");
    }
  });
});
