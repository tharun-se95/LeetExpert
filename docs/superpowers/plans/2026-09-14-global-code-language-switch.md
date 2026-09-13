# Global Code-Language Switch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One Python | JS/TS switch in the header replaces the per-surface language tabs in lesson code blocks, viz code panels and the sandbox.

**Architecture:** A `beforeInteractive` inline script copies the stored choice onto `<html data-code-lang>` before paint. Lesson code blocks server-render both languages and CSS hides the unchosen one (pages stay static, no flash). Interactive surfaces (viz panels, sandbox, the switch itself) read one `useSyncExternalStore` store in `src/lib/codeLang.ts`.

**Tech Stack:** Next.js 16.2 App Router (Turbopack), React 19, Tailwind v4, Vitest 4 (node by default; jsdom per file via `// @vitest-environment jsdom`), Playwright MCP for browser checks.

**Spec:** `docs/superpowers/specs/2026-09-14-global-code-language-switch-design.md`

## Global Constraints

- Values are exactly `"python"` and `"js"`; default `"python"`.
- Storage key `dsa-code-lang`; attribute `data-code-lang` on `<html>`; panel attribute `data-code-lang-panel`.
- `js` shows TypeScript in lesson blocks and viz panels, JavaScript in the sandbox.
- Every hide rule keys off an explicit `js`, so no attribute renders exactly like `python`.
- Pages stay statically generated: no cookies, headers or other request data in any page or layout.
- The switch shows wherever Lessons / Practice shows; it is hidden on the Next.js course branch of `Header`.
- Phone toggle target ≥ 24×24px; visible `focus-visible` ring on every control.
- All colour through tokens; the only hex allowed is brand colour in `src/components/kit/languageMarks.tsx`.
- Comments explain why, not what. Match surrounding conventions.
- Every new test is seen failing before it passes (CLAUDE.md §2).
- `npx tsc --noEmit`, `npm run lint` (0 errors), `npx vitest run`, `npm run build` all pass, and behaviour is confirmed in the browser.
- Commits end with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- Work only inside `/Users/tharunk/leetExpert/.worktrees/code-lang-switch`. Other sessions commit to `main` in the shared checkout; never switch branches there.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `web/src/lib/codeLang.ts` (create) | The preference: type, parsing, fence/sandbox/viz mappings, the store and `useCodeLang`. |
| `web/src/lib/codeLangScript.ts` (create) | The pre-paint script as a string, so tests can execute it. |
| `web/src/app/layout.tsx` (modify) | Mounts the pre-paint script with `next/script` `beforeInteractive`. |
| `web/src/app/globals.css` (modify) | The two panel hide rules; later, deletion of the dead tab CSS. |
| `web/src/components/md/CodeBlock.tsx` (modify) | `CodeBody` gains an optional `panel` prop. |
| `web/src/components/course/CodeTabs.tsx` (modify) | Both languages as panels, labels, copy follows the choice. |
| `web/src/components/viz/CodePanel.tsx` (modify) | Follows the store; label instead of tabs. |
| `web/src/components/sandbox/Sandbox.tsx` (modify) | Follows the store; label instead of tabs; reset on change. |
| `web/src/components/layout/CodeLangSwitch.tsx` (create) | The header control: segmented radio group ≥ 640px, one toggle below. |
| `web/src/components/layout/Header.tsx` (modify) | Renders the switch after Practice; phone layout budget. |
| `web/tests/codeLang.test.ts` (create) | Store, mappings, pre-paint script executed. |
| `web/tests/codeLangSurfaces.test.tsx` (create) | CSS rules, content invariant, CodeTabs render, source guards, switch render. |
| `web/tests/codeTabs.test.tsx` (modify) | Drops tab-only assertions. |
| `CLAUDE.md` (modify) | Design doctrine entry. |

---

### Task 1: The preference store and the pre-paint script

**Files:**
- Create: `web/src/lib/codeLang.ts`
- Create: `web/src/lib/codeLangScript.ts`
- Modify: `web/src/app/layout.tsx`
- Test: `web/tests/codeLang.test.ts`

**Interfaces:**
- Consumes: `SandboxLang` from `web/src/components/sandbox/types.ts` (`"python" | "javascript"`), `VizLang` from `web/src/lib/viz/highlightVizCode.ts` (`"python" | "typescript"`).
- Produces:
  - `type CodeLang = "python" | "js"`
  - `CODE_LANG_STORAGE_KEY = "dsa-code-lang"`, `CODE_LANG_ATTRIBUTE = "data-code-lang"`
  - `parseCodeLang(value: unknown): CodeLang`
  - `codeLangForFence(fenceLanguage: string): CodeLang | null`
  - `sandboxLangFor(lang: CodeLang): SandboxLang`
  - `readingLangFor(lang: CodeLang): VizLang`
  - `readCodeLang(): CodeLang`, `subscribeCodeLang(listener: () => void): () => void`, `setCodeLang(next: CodeLang): void`
  - `useCodeLang(): [CodeLang, (next: CodeLang) => void]`
  - `CODE_LANG_INIT_SCRIPT: string`

- [ ] **Step 1: Prepare the worktree (dependencies, route types, dev server entry)**

```bash
cd /Users/tharunk/leetExpert/.worktrees/code-lang-switch/web
# APFS clone: near-instant, no extra disk. Turbopack rejects a symlinked node_modules.
cp -Rc /Users/tharunk/leetExpert/web/node_modules ./node_modules
npx next typegen
```

Add a temporary dev-server entry (removed in Task 7) to `/Users/tharunk/leetExpert/.claude/launch.json`, inside `"configurations"`:

```json
{
  "name": "web-dev-codelang",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["--prefix", "/Users/tharunk/leetExpert/.worktrees/code-lang-switch/web", "run", "dev", "--", "--port", "3005"],
  "port": 3005
}
```

- [ ] **Step 2: Write the failing tests**

Create `web/tests/codeLang.test.ts`:

```ts
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CODE_LANG_ATTRIBUTE,
  CODE_LANG_STORAGE_KEY,
  codeLangForFence,
  parseCodeLang,
  readCodeLang,
  readingLangFor,
  sandboxLangFor,
  setCodeLang,
  subscribeCodeLang,
} from "@/lib/codeLang";
import { CODE_LANG_INIT_SCRIPT } from "@/lib/codeLangScript";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute(CODE_LANG_ATTRIBUTE);
});
afterEach(() => vi.restoreAllMocks());

describe("parsing and mapping", () => {
  it("accepts only js as the alternative; everything else is python", () => {
    expect(parseCodeLang("js")).toBe("js");
    expect(parseCodeLang("python")).toBe("python");
    for (const junk of [null, undefined, "", "JS", "javascript", "typescript", 1]) {
      expect(parseCodeLang(junk)).toBe("python");
    }
  });

  it("maps fence languages onto the two choices", () => {
    expect(codeLangForFence("python")).toBe("python");
    expect(codeLangForFence("typescript")).toBe("js");
    expect(codeLangForFence("javascript")).toBe("js");
    expect(codeLangForFence("go")).toBeNull();
  });

  it("runs JavaScript in the sandbox and reads TypeScript in viz panels", () => {
    expect(sandboxLangFor("js")).toBe("javascript");
    expect(sandboxLangFor("python")).toBe("python");
    expect(readingLangFor("js")).toBe("typescript");
    expect(readingLangFor("python")).toBe("python");
  });
});

describe("the store", () => {
  it("reads python when no attribute is set", () => {
    expect(readCodeLang()).toBe("python");
  });

  it("writes the attribute and storage, and notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeCodeLang(listener);
    setCodeLang("js");
    expect(document.documentElement.getAttribute(CODE_LANG_ATTRIBUTE)).toBe("js");
    expect(localStorage.getItem(CODE_LANG_STORAGE_KEY)).toBe("js");
    expect(readCodeLang()).toBe("js");
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    setCodeLang("python");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("still switches for the session when storage throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const listener = vi.fn();
    const unsubscribe = subscribeCodeLang(listener);
    setCodeLang("js");
    expect(readCodeLang()).toBe("js");
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("follows a change made in another tab", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeCodeLang(listener);
    window.dispatchEvent(
      new StorageEvent("storage", { key: CODE_LANG_STORAGE_KEY, newValue: "js" }),
    );
    expect(readCodeLang()).toBe("js");
    expect(listener).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new StorageEvent("storage", { key: "unrelated", newValue: "x" }));
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});

describe("the pre-paint script", () => {
  const run = (storage: { getItem: (key: string) => string | null }) => {
    const attrs = new Map<string, string>();
    const fakeDocument = {
      documentElement: { setAttribute: (k: string, v: string) => attrs.set(k, v) },
    };
    // Executed, not string-matched: the script is what the browser runs.
    new Function("document", "localStorage", CODE_LANG_INIT_SCRIPT)(fakeDocument, storage);
    return attrs;
  };

  it("sets js before paint when js is stored", () => {
    expect(run({ getItem: () => "js" }).get(CODE_LANG_ATTRIBUTE)).toBe("js");
  });

  it("sets nothing for python, junk or an empty store", () => {
    for (const stored of ["python", "JS", null]) {
      expect(run({ getItem: () => stored }).size).toBe(0);
    }
  });

  it("survives storage that throws", () => {
    expect(
      run({
        getItem: () => {
          throw new Error("blocked");
        },
      }).size,
    ).toBe(0);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `cd /Users/tharunk/leetExpert/.worktrees/code-lang-switch/web && npx vitest run tests/codeLang.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/codeLang"`.

- [ ] **Step 4: Implement the store**

Create `web/src/lib/codeLang.ts`:

```ts
import { useSyncExternalStore } from "react";
import type { SandboxLang } from "@/components/sandbox/types";
import type { VizLang } from "@/lib/viz/highlightVizCode";

/**
 * The learner's code language, chosen once in the header.
 *
 * "js" means TypeScript wherever code is read (lesson blocks, viz panels)
 * and JavaScript wherever it runs (the sandbox runs JavaScript). The source
 * of truth is the `data-code-lang` attribute on <html>: a pre-paint script
 * sets it from storage before hydration, CSS hides the unchosen language in
 * server-rendered blocks, and this store reads the same attribute so client
 * components agree with what is already on screen.
 */
export type CodeLang = "python" | "js";

export const CODE_LANG_STORAGE_KEY = "dsa-code-lang";
export const CODE_LANG_ATTRIBUTE = "data-code-lang";

export function parseCodeLang(value: unknown): CodeLang {
  return value === "js" ? "js" : "python";
}

/** Which choice a `tabs` fence language belongs to; null for any other language. */
export function codeLangForFence(fenceLanguage: string): CodeLang | null {
  if (fenceLanguage === "python") return "python";
  if (fenceLanguage === "typescript" || fenceLanguage === "javascript") return "js";
  return null;
}

export function sandboxLangFor(lang: CodeLang): SandboxLang {
  return lang === "js" ? "javascript" : "python";
}

export function readingLangFor(lang: CodeLang): VizLang {
  return lang === "js" ? "typescript" : "python";
}

const listeners = new Set<() => void>();

export function readCodeLang(): CodeLang {
  return parseCodeLang(document.documentElement.getAttribute(CODE_LANG_ATTRIBUTE));
}

export function setCodeLang(next: CodeLang): void {
  document.documentElement.setAttribute(CODE_LANG_ATTRIBUTE, next);
  try {
    localStorage.setItem(CODE_LANG_STORAGE_KEY, next);
  } catch {
    // Private mode or a full quota: the choice still holds for this session.
  }
  for (const listener of listeners) listener();
}

export function subscribeCodeLang(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab changed the choice: adopt it so every open tab agrees.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== CODE_LANG_STORAGE_KEY) return;
    document.documentElement.setAttribute(CODE_LANG_ATTRIBUTE, parseCodeLang(event.newValue));
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * The server snapshot is python: static pages render Python markup, and
 * server-rendered code blocks are corrected by CSS before paint, so only
 * interactive surfaces re-render once hydration reads the real attribute.
 */
export function useCodeLang(): [CodeLang, (next: CodeLang) => void] {
  const lang = useSyncExternalStore(subscribeCodeLang, readCodeLang, () => "python" as const);
  return [lang, setCodeLang];
}
```

Create `web/src/lib/codeLangScript.ts`:

```ts
import { CODE_LANG_ATTRIBUTE, CODE_LANG_STORAGE_KEY } from "@/lib/codeLang";

/**
 * Runs before first paint (next/script, beforeInteractive). Only "js" needs
 * the attribute: every hide rule keys off an explicit js, so no attribute
 * and "python" render identically — and a blocked script degrades to Python.
 */
export const CODE_LANG_INIT_SCRIPT = `(function(){try{if(localStorage.getItem(${JSON.stringify(
  CODE_LANG_STORAGE_KEY,
)})==="js"){document.documentElement.setAttribute(${JSON.stringify(
  CODE_LANG_ATTRIBUTE,
)},"js")}}catch(e){}})();`;
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run tests/codeLang.test.ts`
Expected: PASS (10 tests).

- [ ] **Step 6: Mount the script in the root layout**

In `web/src/app/layout.tsx`, add the imports:

```tsx
import Script from "next/script";
import { CODE_LANG_INIT_SCRIPT } from "@/lib/codeLangScript";
```

and insert as the first child of `<body>`, before the `JsonLd` comment:

```tsx
        {/* Sets <html data-code-lang> from storage before paint, so lesson
            code blocks show the learner's language with no flash. Next
            injects beforeInteractive scripts into <head> wherever they sit. */}
        <Script id="code-lang-init" strategy="beforeInteractive">
          {CODE_LANG_INIT_SCRIPT}
        </Script>
```

- [ ] **Step 7: Typecheck, lint, commit**

Run: `npx tsc --noEmit && npx eslint src/lib/codeLang.ts src/lib/codeLangScript.ts src/app/layout.tsx tests/codeLang.test.ts`
Expected: no output from tsc; eslint 0 problems.

```bash
git add web/src/lib/codeLang.ts web/src/lib/codeLangScript.ts web/src/app/layout.tsx web/tests/codeLang.test.ts
git commit -m "feat(code-lang): preference store and pre-paint attribute

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Panel hide rules and the tabs content invariant

**Files:**
- Modify: `web/src/app/globals.css` (append after the `.code-body` rules)
- Test: `web/tests/codeLangSurfaces.test.tsx` (create)

**Interfaces:**
- Consumes: `CODE_LANG_ATTRIBUTE` from Task 1.
- Produces: CSS contract — an element with `data-code-lang-panel="python"` is hidden when `<html data-code-lang="js">`; an element with `data-code-lang-panel="js"` is hidden otherwise.

- [ ] **Step 1: Write the failing tests**

Create `web/tests/codeLangSurfaces.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

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
  it("hides the unchosen language, keyed off an explicit js", () => {
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
```

- [ ] **Step 2: Run to verify the CSS test fails**

Run: `npx vitest run tests/codeLangSurfaces.test.tsx`
Expected: FAIL on "hides the unchosen language"; the content test PASSES (all 278 blocks conform today). Prove the content test can fail: temporarily change `"python,typescript"` to `"python,javascript"` in the test, run, see it FAIL listing every block, then restore.

- [ ] **Step 3: Add the rules**

Append to `web/src/app/globals.css`, directly after the last `.code-body` rule:

```css
/*
  Global code language (lib/codeLang.ts). Lesson code blocks server-render
  both languages; the pre-paint script sets <html data-code-lang> and these
  rules hide the other one before first paint, so statically generated pages
  never flash. Both rules key off an explicit "js": with no attribute — a
  first visit, or a blocked script — Python shows, the same as choosing it.
  display:none also keeps the hidden language out of find-in-page and the
  accessibility tree.
*/
html[data-code-lang="js"] [data-code-lang-panel="python"],
html:not([data-code-lang="js"]) [data-code-lang-panel="js"] {
  display: none;
}
```

- [ ] **Step 4: Run to verify both pass**

Run: `npx vitest run tests/codeLangSurfaces.test.tsx tests/design-tokens.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/src/app/globals.css web/tests/codeLangSurfaces.test.tsx
git commit -m "feat(code-lang): hide the unchosen language before paint

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Lesson code blocks render both languages, no tabs

**Files:**
- Modify: `web/src/components/md/CodeBlock.tsx` (`CodeBody`)
- Modify: `web/src/components/course/CodeTabs.tsx`
- Modify: `web/tests/codeTabs.test.tsx` (the CodeTabs render test)
- Test: `web/tests/codeLangSurfaces.test.tsx` (append)

**Interfaces:**
- Consumes: `CodeLang`, `codeLangForFence`, `useCodeLang` (Task 1); the CSS contract (Task 2).
- Produces: `CodeBody({ code, html, panel? }: { code: string; html: string | null; panel?: CodeLang })` — sets `data-code-lang-panel` on its root when `panel` is given.

- [ ] **Step 1: Write the failing test**

Append to `web/tests/codeLangSurfaces.test.tsx` (add these imports at the top of the file):

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { CodeTabs } from "@/components/course/CodeTabs";
```

```tsx
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

  it("label each panel with its mark and name", () => {
    expect(html).toMatch(/data-code-lang-panel="python"[^>]*>[\s\S]*?>Py<\/span>Python<\/span>/);
    expect(html).toMatch(/data-code-lang-panel="js"[^>]*>[\s\S]*?>TS<\/span>TypeScript<\/span>/);
  });
});
```

In `web/tests/codeTabs.test.tsx`, delete the test `"lesson code blocks show each tab's mark beside its label"` (its tab markup no longer exists; the new tests above replace it).

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/codeLangSurfaces.test.tsx`
Expected: FAIL on "have no language tabs" (current markup has `role="tablist"`).

- [ ] **Step 3: Implement**

In `web/src/components/md/CodeBlock.tsx`, add the import and replace `CodeBody`:

```tsx
import type { CodeLang } from "@/lib/codeLang";
```

```tsx
export function CodeBody({
  code,
  html,
  panel,
}: {
  code: string;
  html: string | null;
  /** Marks this body as one language of a tabs block (see globals.css). */
  panel?: CodeLang;
}) {
  return html ? (
    <div
      data-code-lang-panel={panel}
      className="code-body [&_code]:font-mono [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-0"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : (
    <pre data-code-lang-panel={panel} className="code-body px-4 font-mono whitespace-pre-wrap">
      {code}
    </pre>
  );
}
```

Replace the whole of `web/src/components/course/CodeTabs.tsx`:

```tsx
"use client";

import { CodeBody, CopyButton } from "@/components/md/CodeBlock";
import { LanguageMark } from "@/components/kit/languageMarks";
import { codeLangForFence, useCodeLang } from "@/lib/codeLang";
import type { TabBlock } from "@/lib/content/highlightBlocks";

/**
 * A lesson's code in both languages. The header's global switch picks the
 * language; both panels render on the server and CSS shows one before paint
 * (globals.css), so a static page never flashes the wrong language. Copy
 * follows the store, which agrees with the attribute once hydrated.
 */
export function CodeTabs({ tabs }: { tabs: TabBlock[] }) {
  const [lang] = useCodeLang();
  if (tabs.length === 0) {
    return null;
  }
  const visible = tabs.find((tab) => codeLangForFence(tab.language) === lang) ?? tabs[0];

  return (
    <div className="code-surface group my-5">
      <div className="code-surface-header">
        <span className="font-mono text-xs text-muted">
          {tabs.map((tab) => (
            <span
              key={tab.language}
              data-code-lang-panel={codeLangForFence(tab.language) ?? undefined}
              className="inline-flex items-center gap-1.5"
            >
              <LanguageMark language={tab.language} />
              {tab.label}
            </span>
          ))}
        </span>
        <CopyButton code={visible.code} />
      </div>
      {tabs.map((tab) => (
        <CodeBody
          key={tab.language}
          code={tab.code}
          html={tab.html}
          panel={codeLangForFence(tab.language) ?? undefined}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run tests/codeLangSurfaces.test.tsx tests/codeTabs.test.tsx`
Expected: PASS.

- [ ] **Step 5: Browser check**

`preview_start` with name `web-dev-codelang`, open `http://localhost:3005/courses/dsa/strings/valid-palindrome` (Solution tab) and a concept lesson with a tabs block. Confirm: no language tabs; Python shows; in devtools-by-JS set `document.documentElement.setAttribute("data-code-lang","js")` and the TypeScript panel and TS label show while Python hides; Copy copies the visible language after `localStorage.setItem("dsa-code-lang","js")` and reload. If styles look stale, curl the served CSS chunk for `data-code-lang-panel` before trusting it (Turbopack stale-cache trap).

- [ ] **Step 6: Commit**

```bash
git add web/src/components/md/CodeBlock.tsx web/src/components/course/CodeTabs.tsx web/tests/codeLangSurfaces.test.tsx web/tests/codeTabs.test.tsx
git commit -m "feat(code-lang): lesson code blocks follow the global language

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Viz code panels follow the store

**Files:**
- Modify: `web/src/components/viz/CodePanel.tsx`
- Test: `web/tests/codeLangSurfaces.test.tsx` (append)

**Interfaces:**
- Consumes: `useCodeLang`, `readingLangFor` (Task 1).
- Produces: nothing new.

- [ ] **Step 1: Write the failing test**

Append to `web/tests/codeLangSurfaces.test.tsx`:

```tsx
describe("viz code panels", () => {
  const panel = read("components", "viz", "CodePanel.tsx");

  it("read the global language instead of owning tabs", () => {
    expect(panel).not.toContain('role="tablist"');
    expect(panel).not.toMatch(/useState<VizLang>/);
    expect(panel).toMatch(/const \[codeLang\] = useCodeLang\(\);/);
    expect(panel).toMatch(/readingLangFor\(codeLang\)/);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/codeLangSurfaces.test.tsx -t "viz code panels"`
Expected: FAIL.

- [ ] **Step 3: Implement**

In `web/src/components/viz/CodePanel.tsx`:

1. Add `import { readingLangFor, useCodeLang } from "@/lib/codeLang";`
2. Replace the `TABS` constant with:

```tsx
const LABEL: Record<VizLang, string> = {
  python: "Python",
  typescript: "TypeScript",
};
```

3. Replace `const [lang, setLang] = useState<VizLang>("python");` with:

```tsx
  // The header's global switch picks the language. Tokens are computed on
  // the client either way, so a JS/TS reader sees the panel settle to
  // TypeScript just after hydration (spec §5.2).
  const [codeLang] = useCodeLang();
  const lang = readingLangFor(codeLang);
```

4. Replace the whole `<div className="code-surface-tabs" role="tablist" aria-label="Language">…</div>` block with:

```tsx
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
          <LanguageMark language={lang} />
          {LABEL[lang]}
        </span>
```

- [ ] **Step 4: Run to verify it passes, typecheck**

Run: `npx vitest run tests/codeLangSurfaces.test.tsx tests/codeTabs.test.tsx && npx tsc --noEmit`
Expected: PASS; no tsc output.

- [ ] **Step 5: Browser check**

Open `http://localhost:3005/courses/dsa/prefix-sum/prefix-sum-basics`. With no stored choice the viz panel shows Python and the line highlight tracks the step; set `localStorage.setItem("dsa-code-lang","js")`, reload: the panel shows TypeScript with its label, and stepping still highlights the matching TypeScript line.

- [ ] **Step 6: Commit**

```bash
git add web/src/components/viz/CodePanel.tsx web/tests/codeLangSurfaces.test.tsx
git commit -m "feat(code-lang): viz code panels follow the global language

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: The sandbox follows the store; dead tab CSS removed

**Files:**
- Modify: `web/src/components/sandbox/Sandbox.tsx`
- Modify: `web/src/app/globals.css` (delete `.code-surface-tabs`, `.code-tab`, `.editor-tab` and their comments; fix one `:root` comment)
- Modify: `web/tests/codeTabs.test.tsx` (delete the two tab-CSS describes)
- Test: `web/tests/codeLangSurfaces.test.tsx` (append)

**Interfaces:**
- Consumes: `useCodeLang`, `sandboxLangFor` (Task 1).
- Produces: nothing new.

- [ ] **Step 1: Write the failing tests**

Append to `web/tests/codeLangSurfaces.test.tsx`:

```tsx
describe("sandbox", () => {
  const sandbox = read("components", "sandbox", "Sandbox.tsx");

  it("runs the global language instead of owning tabs", () => {
    expect(sandbox).not.toMatch(/setLang\(/);
    expect(sandbox).not.toMatch(/useState<SandboxLang>/);
    expect(sandbox).toMatch(/const \[codeLang\] = useCodeLang\(\);/);
    expect(sandbox).toMatch(/const lang = sandboxLangFor\(codeLang\);/);
  });

  it("cancels an in-flight run when the language changes, like the old tab did", () => {
    expect(sandbox).toMatch(/if \(shownLang\.current === lang\) return;\s*shownLang\.current = lang;\s*reset\(\);/);
  });
});

describe("dead tab styles", () => {
  it("are gone once no surface renders language tabs", () => {
    for (const cls of [".code-surface-tabs", ".code-tab", ".editor-tab"]) {
      expect(globals).not.toContain(`\n${cls} {`);
    }
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run tests/codeLangSurfaces.test.tsx -t "sandbox|dead tab styles"`
Expected: FAIL.

- [ ] **Step 3: Implement the sandbox change**

In `web/src/components/sandbox/Sandbox.tsx`:

1. Add `import { sandboxLangFor, useCodeLang } from "@/lib/codeLang";`
2. Replace `  const [lang, setLang] = useState<SandboxLang>("python");` with:

```tsx
  // The header's global switch picks the language (lib/codeLang.ts).
  const [codeLang] = useCodeLang();
  const lang = sandboxLangFor(codeLang);
```

3. Directly after `  const { state, run, reset } = useRunner(spec);` insert:

```tsx
  // A switch mid-run cancels the run and clears results for the old
  // language, exactly as the per-sandbox tab used to. Drafts are stored per
  // language, so nothing typed is lost.
  const shownLang = useRef(lang);
  useEffect(() => {
    if (shownLang.current === lang) return;
    shownLang.current = lang;
    reset();
  }, [lang, reset]);
```

4. Replace this exact block (the old tab strip):

```tsx
      {/*
        `-mb-px` pulls the strip over the toolbar's bottom border so the
        active tab's top-accent rule meets the editor with no line between
        them — the tab reads as the top edge of the buffer rather than a
        control above it. `-ml-3` cancels the toolbar's own left px-3 for
        the ide variant only: a real editor's tab bar starts flush at the
        window edge, and the container's padding — correct for centering
        the card variant's tabs — reads as dead margin in front of a bar
        that's otherwise full-bleed chrome. Both variants share the same
        flush tab styling (.code-tab === .editor-tab's look, see globals.css)
        now; only these edge margins are ide-specific.
      */}
      <div
        className={cn(
          "code-surface-tabs inline-flex",
          variant === "ide" && "-mb-px -ml-3",
        )}
      >
        {LANGS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => {
              setLang(l);
              reset();
            }}
            aria-pressed={lang === l}
            data-active={lang === l ? "true" : "false"}
            className={variant === "ide" ? "editor-tab" : "code-tab"}
          >
            <LanguageMark language={l} />
            {LANG_LABEL[l]}
          </button>
        ))}
      </div>
```

with:

```tsx
      {/*
        The header's global switch picks the language; this only says which
        one the editor is in, so a learner never runs code wondering.
      */}
      <span className="inline-flex items-center gap-1.5 font-mono text-[0.72rem] font-semibold text-muted">
        <LanguageMark language={lang} />
        {LANG_LABEL[lang]}
      </span>
```

5. In the comment just below that block, replace `Mirrors the tab strip's own flush treatment:` with `Flush with the bar:` and replace `the same way -ml-3 does\n        for the tabs on the left.` with `as a real editor's\n        toolbar actions sit.`

- [ ] **Step 4: Delete the dead tab CSS**

Run from `web/`:

```bash
python3 - <<'PY'
import pathlib
p = pathlib.Path("src/app/globals.css")
s = p.read_text()
start = s.index("/*\n  Stretch + flush, not centered")
end = s.index("/*\n  @uiw/react-codemirror wraps")
assert ".editor-tab[data-active" in s[start:end] and ".code-body" not in s[start:end]
s = s[:start] + s[end:]
old = "see `.code-surface`, `.editor-tab`, and every `bg-code-editor` site."
assert s.count(old) == 1
s = s.replace(old, "see `.code-surface` and every `bg-code-editor` site.")
p.write_text(s)
PY
```

In `web/tests/codeTabs.test.tsx`, delete the test `"shares one tab layout between code blocks and the editor"` and the whole `describe("editor language tab hover", …)` block, and delete the now-unused `globals` and `rule` constants at the top if nothing else uses them. Keep the language-mark tests and `"viz code panels and the sandbox editor render the same marks"`.

- [ ] **Step 5: Run the tests, typecheck, lint**

Run: `npx vitest run tests/codeLangSurfaces.test.tsx tests/codeTabs.test.tsx tests/design-tokens.test.ts && npx tsc --noEmit && npm run lint`
Expected: PASS; no tsc output; lint 0 errors (unused `LANGS` stays used by the draft-restore loop; if lint flags `cn` or others as unused, remove only those imports).

- [ ] **Step 6: Browser check**

Open `http://localhost:3005/courses/dsa/problems/valid-anagram`. The toolbar shows "Py Python" with no tabs. Type `# marker` into the editor. Set JS/TS via `localStorage.setItem("dsa-code-lang","js")` and dispatch it by reloading: the editor shows JavaScript starter code and the label reads JavaScript. Switch back to Python: `# marker` is still there. Start a run and switch language during it: the run stops and results clear. Also check the inline sandbox in a lesson and the landing page demo.

- [ ] **Step 7: Commit**

```bash
git add web/src/components/sandbox/Sandbox.tsx web/src/app/globals.css web/tests/codeLangSurfaces.test.tsx web/tests/codeTabs.test.tsx
git commit -m "feat(code-lang): the sandbox follows the global language

Removes the last language tab and the tab CSS nothing renders any more.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: The header switch

**Files:**
- Create: `web/src/components/layout/CodeLangSwitch.tsx`
- Modify: `web/src/components/layout/Header.tsx`
- Test: `web/tests/codeLangSurfaces.test.tsx` (append)

**Interfaces:**
- Consumes: `CodeLang`, `useCodeLang` (Task 1); `LanguageMark` from `web/src/components/kit/languageMarks.tsx`.
- Produces: `CodeLangSwitchView({ value, onChange }: { value: CodeLang; onChange: (next: CodeLang) => void })` (props-only, testable) and `CodeLangSwitch()` (wired to the store).

- [ ] **Step 1: Write the failing tests**

Append to `web/tests/codeLangSurfaces.test.tsx` (add `import { CodeLangSwitchView } from "@/components/layout/CodeLangSwitch";` at the top):

```tsx
describe("header code-language switch", () => {
  const render = (value: "python" | "js") =>
    renderToStaticMarkup(<CodeLangSwitchView value={value} onChange={() => {}} />);

  it("is a named radio group with both choices", () => {
    const html = render("python");
    expect(html).toMatch(/role="radiogroup"[^>]*aria-label="Code language"/);
    expect(html.match(/role="radio"/g)).toHaveLength(2);
    expect(html).toContain(">Python</button>");
    expect(html).toContain(">JS/TS</button>");
  });

  it("marks the chosen option and gives it the only tab stop", () => {
    const html = render("js");
    expect(html).toMatch(/role="radio" aria-checked="false" tabindex="-1"[^>]*>[\s\S]*?Python<\/button>/);
    expect(html).toMatch(/role="radio" aria-checked="true" tabindex="0"[^>]*>[\s\S]*?JS\/TS<\/button>/);
  });

  it("offers phones one toggle that names the current and next language", () => {
    expect(render("python")).toContain('aria-label="Code language: Python. Switch to JS/TS"');
    expect(render("js")).toContain('aria-label="Code language: JS/TS. Switch to Python"');
  });

  it("sits after Practice, and not on the Next.js course", () => {
    const header = read("components", "layout", "Header.tsx");
    const practice = header.indexOf("Practice\n            </Link>");
    const switchAt = header.indexOf("<CodeLangSwitch />");
    expect(practice).toBeGreaterThan(0);
    expect(switchAt).toBeGreaterThan(practice);
    expect(switchAt).toBeGreaterThan(header.indexOf("Curriculum"));
    expect(header.indexOf("<CodeLangSwitch />", switchAt + 1)).toBe(-1);
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run tests/codeLangSurfaces.test.tsx -t "header code-language switch"`
Expected: FAIL — cannot resolve `@/components/layout/CodeLangSwitch`.

- [ ] **Step 3: Implement the switch**

Create `web/src/components/layout/CodeLangSwitch.tsx`:

```tsx
"use client";

import { useRef, type KeyboardEvent } from "react";
import { LanguageMark } from "@/components/kit/languageMarks";
import { useCodeLang, type CodeLang } from "@/lib/codeLang";
import { cn } from "@/lib/utils";

const OPTIONS: { value: CodeLang; label: string; mark: string }[] = [
  { value: "python", label: "Python", mark: "python" },
  { value: "js", label: "JS/TS", mark: "javascript" },
];

/**
 * Props-only view, so it renders in tests without the store. At ≥ 640px a
 * two-option radio group; below, one toggle — the phone header has room for
 * a single 26px control beside Practice and no more (measured at 320px).
 */
export function CodeLangSwitchView({
  value,
  onChange,
}: {
  value: CodeLang;
  onChange: (next: CodeLang) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = OPTIONS.find((option) => option.value === value) ?? OPTIONS[0];
  const other = OPTIONS.find((option) => option.value !== current.value) ?? OPTIONS[1];

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = OPTIONS.indexOf(current);
    let next: number;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % OPTIONS.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + OPTIONS.length) % OPTIONS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = OPTIONS.length - 1;
    else return;
    event.preventDefault();
    onChange(OPTIONS[next].value);
    refs.current[next]?.focus();
  };

  return (
    <>
      <div
        role="radiogroup"
        aria-label="Code language"
        onKeyDown={onKeyDown}
        className="hidden items-center gap-0.5 rounded-[length:var(--radius-md)] border border-border p-0.5 sm:inline-flex"
      >
        {OPTIONS.map((option, index) => {
          const checked = option.value === current.value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => onChange(option.value)}
              className={cn(
                "inline-flex min-h-8 items-center gap-1.5 rounded-[length:var(--radius-xs)] px-2 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                checked ? "bg-pop font-semibold text-on-pop" : "text-muted hover:bg-surface hover:text-foreground",
              )}
            >
              <LanguageMark language={option.mark} />
              {option.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onChange(other.value)}
        aria-label={`Code language: ${current.label}. Switch to ${other.label}`}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] border border-border text-muted transition hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:hidden"
      >
        <LanguageMark language={current.mark} />
      </button>
    </>
  );
}

export function CodeLangSwitch() {
  const [value, setValue] = useCodeLang();
  return <CodeLangSwitchView value={value} onChange={setValue} />;
}
```

- [ ] **Step 4: Wire it into the header, with the phone layout budget**

In `web/src/components/layout/Header.tsx`:

1. Add `import { CodeLangSwitch } from "@/components/layout/CodeLangSwitch";`
2. In `modeLinkClass`, replace `px-2 py-1.5` with `px-1.5 py-1.5 sm:px-2`.
3. Replace the `<header className=…>` class string `grid h-14 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-border bg-elevated px-3 sm:gap-3 sm:px-4` with `grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 border-b border-border bg-elevated px-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-3 sm:px-4`, and add this comment directly above `<header`:

```tsx
    // Below 640px the row holds menu, logo, Lessons, Practice, the language
    // toggle, search and theme: ~328px of content at the old spacing, more
    // than a 320px phone. The middle column fills and the nav centres inside
    // it (≈2.5px off true centre at 375px), padding and gaps tighten a step,
    // and the nav links drop to px-1.5 — measured to fit 320px with slack.
```

4. Directly after the Practice `</Link>` (inside the DSA fragment, before `</>`), add:

```tsx
            <CodeLangSwitch />
```

- [ ] **Step 5: Run the tests, typecheck, lint**

Run: `npx vitest run tests/codeLangSurfaces.test.tsx && npx tsc --noEmit && npx eslint src/components/layout/CodeLangSwitch.tsx src/components/layout/Header.tsx`
Expected: PASS; no tsc output; eslint 0 problems.

- [ ] **Step 6: Browser check — layout at every width**

Run this Playwright snippet (`browser_run_code_unsafe`) against `http://localhost:3005/courses/dsa/strings/valid-anagram` and `http://localhost:3005/`:

```js
async (page) => {
  const browser = page.context().browser();
  const out = [];
  for (const width of [320, 375, 640, 768, 1024]) {
    const ctx = await browser.newContext({ viewport: { width, height: 800 }, isMobile: width < 640, hasTouch: width < 640 });
    const p = await ctx.newPage();
    await p.goto("http://localhost:3005/courses/dsa/strings/valid-anagram");
    await p.waitForTimeout(2000);
    out.push(await p.evaluate((w) => {
      const [left, nav, right] = [...document.querySelector("body header").children];
      const r = (e) => e.getBoundingClientRect();
      return {
        width: w,
        overlapLeftNav: r(left).right > r(nav).left + 0.5,
        overlapNavRight: r(nav).right > r(right).left + 0.5,
        headerOverflows: document.querySelector("body header").scrollWidth > w,
        toggleVisible: [...nav.querySelectorAll("button")].some((b) => b.getAttribute("aria-label")?.startsWith("Code language:") && r(b).width > 0),
        groupVisible: !!nav.querySelector('[role="radiogroup"]') && r(nav.querySelector('[role="radiogroup"]')).width > 0,
      };
    }, width));
    await ctx.close();
  }
  return out;
}
```

Expected: no overlap and no overflow at every width; `toggleVisible` true only below 640; `groupVisible` true at 640 and up. Then click each option, confirm lesson blocks, a viz panel and a sandbox update live, and operate the radio group with Tab + arrow keys (visible ring, selection follows). Check both themes.

- [ ] **Step 7: Commit**

```bash
git add web/src/components/layout/CodeLangSwitch.tsx web/src/components/layout/Header.tsx web/tests/codeLangSurfaces.test.tsx
git commit -m "feat(code-lang): global language switch in the header

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Doctrine, full verification, cleanup

**Files:**
- Modify: `CLAUDE.md` (§4 Design system)
- Modify: `/Users/tharunk/leetExpert/.claude/launch.json` (remove the temporary entry)

**Interfaces:**
- Consumes: everything above.
- Produces: the finished branch.

- [ ] **Step 1: Record the doctrine**

In `CLAUDE.md` §4, after the "lessons drawer's tabs" bullet, add:

```markdown
- **Code language is one global choice.** The header's switch
  (`CodeLangSwitch`) picks `python` or `js`; `js` means TypeScript where code
  is read (lesson blocks, viz panels) and JavaScript where it runs (the
  sandbox). No surface owns language tabs. `lib/codeLang.ts` is the store;
  a `beforeInteractive` script (`lib/codeLangScript.ts`) sets
  `<html data-code-lang>` from `localStorage` (`dsa-code-lang`) before paint,
  and lesson code blocks server-render both languages with
  `data-code-lang-panel` so CSS hides the other one — pages stay static and
  never flash. Hide rules key off an explicit `js`, so no attribute reads as
  Python. Every `tabs` fence must carry exactly `python` and `typescript`
  (content test). Guarded in `codeLang.test.ts` and
  `codeLangSurfaces.test.tsx`.
```

- [ ] **Step 2: Full gate**

Run from `web/`: `npx tsc --noEmit && npm run lint && npx vitest run && npm run build`
Expected: tsc silent; lint 0 errors; all test files pass; "Compiled successfully".

- [ ] **Step 3: Prove no flash at first paint**

Playwright (`browser_run_code_unsafe`): block Next's JavaScript so hydration never runs, then check what CSS alone shows.

```js
async (page) => {
  const ctx = await page.context().browser().newContext();
  await ctx.addInitScript(() => localStorage.setItem("dsa-code-lang", "js"));
  const p = await ctx.newPage();
  await p.route("**/_next/static/chunks/**/*.js", (route) => route.abort());
  await p.goto("http://localhost:3005/courses/dsa/problems/valid-palindrome");
  const result = await p.evaluate(() => ({
    attribute: document.documentElement.getAttribute("data-code-lang"),
    panels: [...document.querySelectorAll("[data-code-lang-panel]")].map((el) => ({
      panel: el.getAttribute("data-code-lang-panel"),
      display: getComputedStyle(el).display,
    })),
  }));
  await ctx.close();
  return result;
}
```

Expected: `attribute` is `"js"`; every `python` panel has `display: "none"`; `js` panels do not. (If the page shows no tabs blocks before a tab is opened, use a concept lesson that has a `tabs` block in its body.)

- [ ] **Step 4: Cross-tab and reload checks**

Open two pages in one Playwright context on a lesson with a tabs block; switch in the first; the second's `<html>` attribute and visible panel follow within a second. Reload the first: the choice persists.

- [ ] **Step 5: Clean up the scaffolding**

Remove the `web-dev-codelang` entry from `/Users/tharunk/leetExpert/.claude/launch.json` and stop that dev server (`preview_stop`). Move any `.playwright-mcp/` folder out of the repo.

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): record the global code-language rule

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

Then use superpowers:finishing-a-development-branch to decide how to land `feat/code-lang-switch`.
