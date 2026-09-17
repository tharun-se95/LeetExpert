import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { CodeTabs } from "@/components/course/CodeTabs";
import { CodeLangSwitchView, CodeLangToggleView } from "@/components/layout/CodeLangSwitch";

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

describe("header code-language controls", () => {
  const pill = (value: "python" | "js") =>
    renderToStaticMarkup(<CodeLangSwitchView value={value} onChange={() => {}} />);
  const toggle = (value: "python" | "js") =>
    renderToStaticMarkup(<CodeLangToggleView value={value} onChange={() => {}} />);

  it("is a named radio group with both choices, as one round hairline pill", () => {
    const html = pill("python");
    const group = html.match(/<div[^>]*role="radiogroup"[^>]*>/)![0];
    expect(group).toContain('aria-label="Code language"');
    for (const c of ["rounded-full", "border", "border-border", "h-10", "hidden", "sm:inline-flex"]) {
      expect(group).toMatch(new RegExp(`\\b${c.replace(":", "\\:")}(?=[\\s"])`));
    }
    expect(html.match(/role="radio"/g)).toHaveLength(2);
    expect(html).toContain(">Python</button>");
    expect(html).toContain(">JS/TS</button>");
    expect(html).not.toMatch(/focus-visible:ring/);
  });

  it("marks the chosen option, gives it the only tab stop, and fills only that side", () => {
    const html = pill("js");
    const python = html.match(/<button[^>]*>[\s\S]*?Python<\/button>/)![0];
    const js = html.match(/<button[^>]*>[\s\S]*?JS\/TS<\/button>/)![0];
    expect(python).toMatch(/aria-checked="false"[^>]*tabindex="-1"/);
    expect(js).toMatch(/aria-checked="true"[^>]*tabindex="0"/);
    expect(js).toMatch(/\bbg-surface\b/);
    expect(python).not.toMatch(/\bbg-surface\b/);
  });

  it("offers phones one round toggle that names the current and next language", () => {
    const btn = toggle("python").match(/<button[^>]*>/)![0];
    expect(btn).toContain('aria-label="Code language: Python. Switch to JS/TS"');
    for (const c of ["rounded-full", "h-11", "w-11", "sm:hidden"]) expect(btn).toContain(c);
    expect(toggle("js")).toContain('aria-label="Code language: JS/TS. Switch to Python"');
  });

  it("puts the pill after Practice and the toggle before search, in both headers, never on the Next.js course", () => {
    const header = read("components", "layout", "Header.tsx");
    const practice = header.indexOf("Practice\n");
    expect(header.indexOf("<CodeLangSwitch />")).toBeGreaterThan(practice);
    expect(header.indexOf("<CodeLangToggle />")).toBeLessThan(header.indexOf('aria-label="Search lessons and problems"'));
    expect(header).toMatch(/\{showCodeLang \? <CodeLangSwitch \/> : null\}/);
    expect(header).toMatch(/\{showCodeLang \? <CodeLangToggle \/> : null\}/);
    const landing = read("components", "landing", "LandingHeader.tsx");
    expect(landing.indexOf("<CodeLangSwitch />")).toBeGreaterThan(landing.indexOf("NAV.map"));
    expect(landing.indexOf("<CodeLangToggle />")).toBeLessThan(landing.indexOf('aria-label="Search lessons and problems"'));
  });

  it("tightens both headers below sm so the toggle fits a 320px phone", () => {
    // Measured 2026-09-15 by injecting the toggle into the live header: without
    // these, a lesson header overflowed 26.5px at 320px and the landing 39.5px.
    const header = read("components", "layout", "Header.tsx").match(/<header className="([^"]*)"/)![1];
    for (const c of ["grid-cols-[auto_minmax(0,1fr)_auto]", "sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]", "gap-1.5", "px-2", "sm:px-4"]) {
      expect(header.split(/\s+/), c).toContain(c);
    }
    const landing = read("components", "landing", "LandingHeader.tsx").match(/className="(mx-auto grid[^"]*)"/)![1];
    for (const c of ["grid-cols-[auto_minmax(0,1fr)_auto]", "sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]", "gap-1.5", "sm:gap-3", "px-6"]) {
      expect(landing.split(/\s+/), c).toContain(c);
    }
  });
});
