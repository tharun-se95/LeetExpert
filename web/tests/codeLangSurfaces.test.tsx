import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { CodeTabs } from "@/components/course/CodeTabs";

const read = (...p: string[]) => readFileSync(join(__dirname, "..", "src", ...p), "utf8");
const globals = read("app", "globals.css");
const COURSE_ROOT = join(__dirname, "..", "..", "courses", "dsa");

function markdownFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? markdownFiles(full) : entry.endsWith(".md") ? [full] : [];
  });
}

describe("panel hide rules", () => {
  it("hide the unchosen language, keyed off an explicit js", () => {
    // No attribute (script blocked, first visit) must render as Python.
    expect(globals).toContain(
      'html[data-code-lang="js"] [data-code-lang-panel="python"],\nhtml:not([data-code-lang="js"]) [data-code-lang-panel="js"] {\n  display: none;\n}',
    );
  });
});

describe("tabs fences", () => {
  it("carry exactly python and typescript, so the switch never lands on a missing language", () => {
    const offenders: string[] = [];
    let blocks = 0;
    for (const file of markdownFiles(COURSE_ROOT)) {
      const text = readFileSync(file, "utf8");
      for (const match of text.matchAll(/(`{4,})tabs[^\n]*\n([\s\S]*?)\1/g)) {
        blocks++;
        const langs = [...match[2].matchAll(/```(\w+)\n/g)].map((m) => m[1]).sort();
        if (langs.join(",") !== "python,typescript") {
          offenders.push(`${file.slice(COURSE_ROOT.length + 1)}: ${langs.join(",") || "(none)"}`);
        }
      }
    }
    expect(blocks).toBeGreaterThan(0);
    expect(offenders).toEqual([]);
  });
});

describe("lesson code blocks", () => {
  const html = renderToStaticMarkup(
    <CodeTabs
      tabs={[
        { language: "python", label: "Python", code: "x = 1", html: null },
        { language: "typescript", label: "TypeScript", code: "let x = 1", html: null },
      ]}
    />,
  );

  it("have no language tabs", () => {
    expect(html).not.toContain('role="tablist"');
    expect(html).not.toContain('role="tab"');
  });

  it("render both languages as panels the hide rules can target", () => {
    expect(html).toMatch(/<pre data-code-lang-panel="python" class="code-body[^"]*">x = 1<\/pre>/);
    expect(html).toMatch(/<pre data-code-lang-panel="js" class="code-body[^"]*">let x = 1<\/pre>/);
  });

  it("label each panel with its mark and name, hidden with it", () => {
    expect(html).toMatch(
      /<span data-code-lang-panel="python" class="code-lang-label"><span aria-hidden="true"[^>]*>Py<\/span>Python<\/span>/,
    );
    expect(html).toMatch(
      /<span data-code-lang-panel="js" class="code-lang-label"><span aria-hidden="true"[^>]*>TS<\/span>TypeScript<\/span>/,
    );
  });

  it("ink the label for the inverted code canvas, not the page", () => {
    expect(globals).toMatch(/\n\.code-lang-label \{[^}]*color: var\(--tok-name\);/);
  });
});

describe("viz code panels", () => {
  const panel = read("components", "viz", "CodePanel.tsx");

  it("read the global language instead of owning tabs", () => {
    expect(panel).not.toContain('role="tablist"');
    expect(panel).not.toMatch(/useState<VizLang>/);
    expect(panel).toMatch(/const \[codeLang\] = useCodeLang\(\);/);
    expect(panel).toMatch(/const lang = readingLangFor\(codeLang\);/);
    expect(panel).toContain('className="code-lang-label"');
  });
});

describe("sandbox", () => {
  const sandbox = read("components", "sandbox", "Sandbox.tsx");

  it("runs the global language instead of owning tabs", () => {
    expect(sandbox).not.toMatch(/setLang\(/);
    expect(sandbox).not.toMatch(/useState<SandboxLang>/);
    expect(sandbox).toMatch(/const \[codeLang\] = useCodeLang\(\);/);
    expect(sandbox).toMatch(/const lang = sandboxLangFor\(codeLang\);/);
  });

  it("cancels an in-flight run when the language changes, like the old tab did", () => {
    expect(sandbox).toMatch(
      /if \(shownLang\.current === lang\) return;\s*shownLang\.current = lang;\s*reset\(\);/,
    );
  });
});

describe("dead tab styles", () => {
  it("are gone once no surface renders language tabs", () => {
    for (const cls of [".code-surface-tabs", ".code-tab", ".editor-tab"]) {
      expect(globals).not.toContain(`\n${cls} {`);
    }
    expect(globals).not.toContain("`.editor-tab`");
  });
});
