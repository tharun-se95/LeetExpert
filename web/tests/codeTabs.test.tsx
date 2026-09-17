import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageMark } from "@/components/kit/languageMarks";

const read = (...p: string[]) =>
  readFileSync(join(__dirname, "..", "src", ...p), "utf8");

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

describe("every code surface uses the same marks", () => {
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
});
