import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageMark } from "@/components/kit/languageMarks";

const read = (...p: string[]) =>
  readFileSync(join(__dirname, "..", "src", ...p), "utf8");
const globals = read("app", "globals.css");
/** A rule body from globals.css, by its exact selector line. */
const rule = (selector: string) => {
  const at = globals.indexOf(`\n${selector} {`);
  expect(at, `missing rule: ${selector}`).toBeGreaterThanOrEqual(0);
  return globals.slice(at, globals.indexOf("}", at));
};

describe("language marks", () => {
  it("renders a brand-coloured monogram for every language the course shows", () => {
    // Lesson code blocks are Python + TypeScript (280 tabs blocks, measured);
    // the sandbox editor is Python + JavaScript.
    const py = renderToStaticMarkup(<LanguageMark language="python" />);
    const ts = renderToStaticMarkup(<LanguageMark language="typescript" />);
    const js = renderToStaticMarkup(<LanguageMark language="javascript" />);
    expect(py).toMatch(/background:#3776AB[^>]*>Py</);
    expect(ts).toMatch(/background:#3178C6[^>]*>TS</);
    expect(js).toMatch(/background:#F7DF1E[^>]*>JS</);
    for (const mark of [py, ts, js])
      expect(mark).toContain('aria-hidden="true"');
  });

  it("renders nothing for a language it has no real mark for", () => {
    // A guessed badge would be worse than none (see languageMarks.tsx).
    expect(renderToStaticMarkup(<LanguageMark language="go" />)).toBe("");
  });
});

describe("code tabs match the editor's language tabs", () => {
  it("viz code panels and the sandbox editor render the same marks", () => {
    for (const rel of [
      ["components", "viz", "CodePanel.tsx"],
      ["components", "sandbox", "Sandbox.tsx"],
    ]) {
      const src = read(...rel);
      expect(src, rel.join("/")).toContain(
        'from "@/components/kit/languageMarks"',
      );
      expect(src, rel.join("/")).toMatch(/<LanguageMark language=\{/);
    }
  });

  it("shares one tab layout between code blocks and the editor", () => {
    // Mark + label, mono type, one gap — defined on the classes, so a tab
    // can't match in one place and drift in another.
    for (const selector of [".code-tab", ".editor-tab"]) {
      const body = rule(selector);
      expect(body, selector).toMatch(/display:\s*inline-flex/);
      expect(body, selector).toMatch(/align-items:\s*center/);
      expect(body, selector).toMatch(/gap:\s*0\.375rem/);
      expect(body, selector).toMatch(/font-family:\s*var\(--font-mono\)/);
    }
  });
});

describe("editor language tab hover", () => {
  it("recesses into the toolbar instead of borrowing the active tab's canvas", () => {
    // It used to paint --code-editor — the active tab's fill, inverted from
    // the page (a dark block in light, a pale block in dark: 16.46:1 and
    // 12.37:1 against the toolbar) — so a hover read as a second selection.
    // --tok-name ink is tuned for that canvas: 1.18:1 on the toolbar.
    const hover = rule(".editor-tab:hover");
    expect(hover).not.toContain("--code-editor");
    expect(hover).not.toContain("--tok-name");
    // The same hover as the Reset button beside it in that toolbar.
    expect(hover).toMatch(/background:\s*var\(--code\)/);
    expect(hover).toMatch(/color:\s*var\(--foreground\)/);
    // The active rule must still win while the active tab is hovered.
    expect(
      globals.indexOf('\n.editor-tab[aria-pressed="true"],'),
    ).toBeGreaterThan(globals.indexOf("\n.editor-tab:hover {"));
  });
});
