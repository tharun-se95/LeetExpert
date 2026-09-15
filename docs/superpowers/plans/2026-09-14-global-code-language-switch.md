# Global Code-Language Switch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One Python | JS/TS switch in the header replaces the per-surface language tabs in lesson code blocks, viz code panels and the sandbox.

**Architecture:** A plain inline script, at the top of `<body>`, after the lamp's boot script, copies the stored choice onto `<html data-code-lang>` while the HTML parses. Lesson code blocks server-render both languages and CSS hides the unchosen one, so pages stay static with no flash. Interactive surfaces (viz panels, the sandbox, the switch itself) read one `useSyncExternalStore` store in `src/lib/codeLang.ts`.

**Tech Stack:** Next.js 16.2.10 App Router (Turbopack), React 19.2, Tailwind v4, Vitest 4 (node by default; jsdom per file via `// @vitest-environment jsdom`), Playwright MCP for browser checks.

**Spec:** `docs/superpowers/specs/2026-09-14-global-code-language-switch-design.md`

## Global Constraints

- Values are exactly `"python"` and `"js"`; default `"python"`.
- Storage key `dsa-code-lang`; attribute `data-code-lang` on `<html>`; panel attribute `data-code-lang-panel`.
- `js` shows TypeScript in lesson blocks and viz panels, JavaScript in the sandbox.
- Every hide rule keys off an explicit `js`, so no attribute renders exactly like `python`.
- The pre-paint script is a plain inline `<script>` in the root layout, **never** `next/script` `beforeInteractive`. In this Next version the App Router queues `beforeInteractive` in `self.__next_s` and `appBootstrap` runs it after the JS chunks load (`node_modules/next/dist/client/app-bootstrap.js:54`), which is after first paint.
- Pages stay statically generated: no cookies, headers or other request data in any page or layout.
- The switch shows wherever Lessons / Practice shows; it is hidden on the Next.js course branch of `Header`.
- Header controls (owner, 2026-09-15): ≥ 640px a round hairline pill after Practice (`rounded-full border border-border h-10`, chosen side `bg-surface` + ink); < 640px a `ROUND_CONTROL` toggle at `h-11 w-11` first in the right cluster. Focus is the global `:focus-visible` outline — no ring utilities.
- Labels on `.code-surface` headers use `--tok-name` ink: that header sits on `--code-editor`, whose brightness is inverted from the page, so `--muted` is wrong there.
- All colour through tokens; the only hex allowed is brand colour in `src/components/kit/languageMarks.tsx`.
- Comments explain why, not what. Match surrounding conventions. Do not run Prettier (not a project dependency; it reformats unrelated lines).
- Every new test is seen failing before it passes (CLAUDE.md §2).
- `npx tsc --noEmit`, `npm run lint` (0 errors), `npx vitest run`, `npm run build` all pass, and behaviour is confirmed in the browser.
- Commits end with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- Work only inside `/Users/tharunk/leetExpert/.worktrees/code-lang-switch`. Other sessions commit to `main` in the shared checkout; never switch branches there, never bare `git stash`.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `web/src/lib/codeLang.ts` (create) | The preference: type, parsing, fence/sandbox/viz mappings, the store and `useCodeLang`. |
| `web/src/lib/codeLangScript.ts` (create) | The pre-paint script as a string, so tests can execute it. |
| `web/src/app/layout.tsx` (modify) | Renders the pre-paint script as the first child of `<body>`. |
| `web/src/app/globals.css` (modify) | Panel hide rules and `.code-lang-label`; later, deletion of the dead tab CSS. |
| `web/src/components/md/CodeBlock.tsx` (modify) | `CodeBody` gains an optional `panel` prop. |
| `web/src/components/course/CodeTabs.tsx` (modify) | Both languages as panels, labels, copy follows the choice. |
| `web/src/components/viz/CodePanel.tsx` (modify) | Follows the store; label instead of tabs. |
| `web/src/components/sandbox/Sandbox.tsx` (modify) | Follows the store; label instead of tabs; reset on change. |
| `web/src/components/kit/languageMarks.tsx` (modify) | Doc comment only (no more "tabs"). |
| `web/src/components/layout/CodeLangSwitch.tsx` (create) | The header control: radio group ≥ 640px, one toggle below. |
| `web/src/components/layout/Header.tsx` (modify) | Renders the switch after Practice; phone layout budget. |
| `web/tests/codeLang.test.ts` (create) | Store, mappings, pre-paint script executed, layout placement. |
| `web/tests/codeLangSurfaces.test.tsx` (create) | CSS rules, content invariant, CodeTabs render, source guards, switch render. |
| `web/tests/codeTabs.test.tsx` (modify) | Drops tab-only assertions. |
| `CLAUDE.md` (modify) | Design doctrine entry. |

---

### Task 1: The preference store and the pre-paint script

**Files:**
- Create: `web/src/lib/codeLang.ts`
- Create: `web/src/lib/codeLangScript.ts`
- Modify: `web/src/app/layout.tsx:93` (first child of `<body>`)
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

Add a temporary dev-server entry (removed in Task 7) to the `"configurations"` array of the `.claude/launch.json` that `preview_start` reads:

```json
{
  "name": "web-dev-codelang",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["--prefix", "/Users/tharunk/leetExpert/.worktrees/code-lang-switch/web", "run", "dev", "--", "--port", "3005"],
  "port": 3005
}
```

Never commit that entry.

- [ ] **Step 2: Write the failing tests**

Create `web/tests/codeLang.test.ts`:

```ts
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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

  it("sets js when js is stored", () => {
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

  it("runs while the HTML parses, right after the lamp's boot script, not from Next's bootstrap", () => {
    const layout = readFileSync(join(__dirname, "..", "src", "app", "layout.tsx"), "utf8");
    expect(layout).toMatch(
      /<script dangerouslySetInnerHTML=\{\{ __html: LAMP_BOOT_SCRIPT \}\} \/>\s*\{\/\*[\s\S]*?\*\/\}\s*<script\s+id="code-lang-init"\s+dangerouslySetInnerHTML=\{\{ __html: CODE_LANG_INIT_SCRIPT \}\}\s*\/>/,
    );
    expect(layout).not.toContain("beforeInteractive");
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `cd /Users/tharunk/leetExpert/.worktrees/code-lang-switch/web && npx vitest run tests/codeLang.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/codeLang"`.

- [ ] **Step 4: Implement the store, the script and the layout mount**

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
 * of truth is the `data-code-lang` attribute on <html>: an inline script sets
 * it from storage while the page parses, CSS hides the unchosen language in
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
 * Rendered as a plain inline <script> at the top of <body>, so it runs while
 * the HTML parses — before any code block below it paints. Only "js" needs
 * the attribute: every hide rule keys off an explicit js, so no attribute and
 * "python" render identically, and a blocked script degrades to Python.
 */
export const CODE_LANG_INIT_SCRIPT = `(function(){try{if(localStorage.getItem(${JSON.stringify(
  CODE_LANG_STORAGE_KEY,
)})==="js"){document.documentElement.setAttribute(${JSON.stringify(
  CODE_LANG_ATTRIBUTE,
)},"js")}}catch(e){}})();`;
```

In `web/src/app/layout.tsx`, add the import beside the other `@/` imports:

```tsx
import { CODE_LANG_INIT_SCRIPT } from "@/lib/codeLangScript";
```

and replace

```tsx
        <script dangerouslySetInnerHTML={{ __html: LAMP_BOOT_SCRIPT }} />
        {/* Site-wide entity graph.
```

with

```tsx
        <script dangerouslySetInnerHTML={{ __html: LAMP_BOOT_SCRIPT }} />
        {/* Sets <html data-code-lang> from storage while the HTML still
            parses, so the lesson code blocks below paint in the learner's
            language. After the lamp's boot script, which must stay first.
            Deliberately not next/script beforeInteractive: the App Router
            queues that and runs it from Next's bootstrap once the JS chunks
            load, after first paint. */}
        <script
          id="code-lang-init"
          dangerouslySetInnerHTML={{ __html: CODE_LANG_INIT_SCRIPT }}
        />
        {/* Site-wide entity graph.
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run tests/codeLang.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 6: Typecheck, lint, commit**

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
- Modify: `web/src/app/globals.css` (insert after the `.code-surface-header` rule, line ~743)
- Test: `web/tests/codeLangSurfaces.test.tsx` (create)

**Interfaces:**
- Consumes: the attribute name from Task 1.
- Produces: CSS contract. An element with `data-code-lang-panel="python"` is hidden when `<html data-code-lang="js">`; an element with `data-code-lang-panel="js"` is hidden otherwise.

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
```

- [ ] **Step 2: Run to verify the CSS test fails, and prove the content test can fail**

Run: `npx vitest run tests/codeLangSurfaces.test.tsx`
Expected: FAIL on "hide the unchosen language". The content test PASSES, because all tabs blocks conform today. To prove it can fail, temporarily change `"python,typescript"` to `"python,javascript"` in the test and run it. It should FAIL and list every block. Then restore the original value.

- [ ] **Step 3: Add the rules**

In `web/src/app/globals.css`, insert directly after the `.code-surface-header { … }` rule (before the `/*\n  Stretch + flush, not centered` comment):

```css
/*
  Global code language (lib/codeLang.ts). Lesson code blocks server-render
  both languages; an inline script sets <html data-code-lang> while the page
  parses and these rules hide the other one before first paint, so statically
  generated pages never flash. Both rules key off an explicit "js": with no
  attribute — a first visit, or a blocked script — Python shows, the same as
  choosing it. display:none also keeps the hidden language out of
  find-in-page and the accessibility tree.
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
- Modify: `web/src/app/globals.css` (add `.code-lang-label` after the Task 2 rules)
- Modify: `web/src/components/md/CodeBlock.tsx:35-44` (`CodeBody`)
- Modify: `web/src/components/course/CodeTabs.tsx` (whole file)
- Modify: `web/tests/codeTabs.test.tsx` (remove the tab render test)
- Test: `web/tests/codeLangSurfaces.test.tsx` (append)

**Interfaces:**
- Consumes: `CodeLang`, `codeLangForFence`, `useCodeLang` (Task 1); the CSS contract (Task 2).
- Produces:
  - `CodeBody({ code, html, panel? }: { code: string; html: string | null; panel?: CodeLang })`, which sets `data-code-lang-panel` on its root when `panel` is given.
  - CSS class `.code-lang-label` (mark + name on a code-surface header), used again in Task 4.

- [ ] **Step 1: Write the failing tests**

Add these imports at the top of `web/tests/codeLangSurfaces.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { CodeTabs } from "@/components/course/CodeTabs";
```

Append:

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
```

In `web/tests/codeTabs.test.tsx`, delete the whole test `it("lesson code blocks show each tab's mark beside its label", …)` (lines 39–58), and delete the now-unused `import { CodeTabs } from "@/components/course/CodeTabs";`. The new tests above replace it.

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run tests/codeLangSurfaces.test.tsx`
Expected: FAIL on "have no language tabs" (current markup has `role="tablist"`) and on the label tests.

- [ ] **Step 3: Implement**

In `web/src/app/globals.css`, directly after the Task 2 hide rules, add:

```css
/*
  The language a code surface is showing (lesson blocks, viz panels). The
  header sits on --code-editor, whose brightness is inverted from the page,
  so the ink is --tok-name — the old active language tab's ink — never
  --muted. The hide rules above outrank this display on specificity.
*/
.code-lang-label {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-family: var(--font-mono), ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--tok-name);
}
```

In `web/src/components/md/CodeBlock.tsx`, add the import beside the others:

```tsx
import type { CodeLang } from "@/lib/codeLang";
```

and replace `CodeBody` (lines 35–44) with:

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
        <span className="inline-flex items-center">
          {tabs.map((tab) => (
            <span
              key={tab.language}
              data-code-lang-panel={codeLangForFence(tab.language) ?? undefined}
              className="code-lang-label"
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

- [ ] **Step 4: Run to verify they pass**

Run: `npx vitest run tests/codeLangSurfaces.test.tsx tests/codeTabs.test.tsx tests/design-tokens.test.ts && npx tsc --noEmit`
Expected: PASS; no tsc output.

- [ ] **Step 5: Browser check**

1. Run `preview_start` with name `web-dev-codelang` and open `http://localhost:3005/courses/dsa/arrays/dynamic-arrays`. It has `tabs` blocks in the body.
2. Confirm there are no language tabs, and that Python and its label show.
3. Run `document.documentElement.setAttribute("data-code-lang","js")` through the JS tool. The TypeScript panel and TS label should show, and Python should hide.
4. Run `localStorage.setItem("dsa-code-lang","js")`, reload, and click Copy. The clipboard should hold the TypeScript code.
5. Check the label in both themes.

If styles look stale, curl the served CSS chunk for `data-code-lang-panel` before trusting what you see (Turbopack's stale dev cache). If the chunk is stale, stop the server, `rm -rf web/.next/dev`, and restart.

- [ ] **Step 6: Commit**

```bash
git add web/src/app/globals.css web/src/components/md/CodeBlock.tsx web/src/components/course/CodeTabs.tsx web/tests/codeLangSurfaces.test.tsx web/tests/codeTabs.test.tsx
git commit -m "feat(code-lang): lesson code blocks follow the global language

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Viz code panels follow the store

**Files:**
- Modify: `web/src/components/viz/CodePanel.tsx:11-14, 36, 76-91`
- Test: `web/tests/codeLangSurfaces.test.tsx` (append)

**Interfaces:**
- Consumes: `useCodeLang`, `readingLangFor` (Task 1); `.code-lang-label` (Task 3).
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
    expect(panel).toMatch(/const lang = readingLangFor\(codeLang\);/);
    expect(panel).toContain('className="code-lang-label"');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/codeLangSurfaces.test.tsx -t "viz code panels"`
Expected: FAIL.

- [ ] **Step 3: Implement**

In `web/src/components/viz/CodePanel.tsx`:

1. Add `import { readingLangFor, useCodeLang } from "@/lib/codeLang";` after the `highlightVizCode` import.
2. Replace

```tsx
const TABS: { lang: VizLang; label: string }[] = [
  { lang: "python", label: "Python" },
  { lang: "typescript", label: "TypeScript" },
];
```

with

```tsx
const LABEL: Record<VizLang, string> = {
  python: "Python",
  typescript: "TypeScript",
};
```

3. Replace `  const [lang, setLang] = useState<VizLang>("python");` with:

```tsx
  // The header's global switch picks the language. Tokens for both languages
  // are computed on the client anyway, so a JS/TS reader sees the panel settle
  // to TypeScript just after hydration — accepted (spec §5.2).
  const [codeLang] = useCodeLang();
  const lang = readingLangFor(codeLang);
```

4. Replace

```tsx
        <div className="code-surface-tabs" role="tablist" aria-label="Language">
          {TABS.map((tab) => (
            <button
              key={tab.lang}
              type="button"
              role="tab"
              aria-selected={lang === tab.lang}
              data-active={lang === tab.lang ? "true" : "false"}
              onClick={() => setLang(tab.lang)}
              className="code-tab"
            >
              <LanguageMark language={tab.lang} />
              {tab.label}
            </button>
          ))}
        </div>
```

with

```tsx
        <span className="code-lang-label">
          <LanguageMark language={lang} />
          {LABEL[lang]}
        </span>
```

- [ ] **Step 4: Run to verify it passes, typecheck, lint**

Run: `npx vitest run tests/codeLangSurfaces.test.tsx tests/codeTabs.test.tsx && npx tsc --noEmit && npx eslint src/components/viz/CodePanel.tsx`
Expected: PASS; no tsc output; eslint 0 problems.

- [ ] **Step 5: Browser check**

1. Open `http://localhost:3005/courses/dsa/prefix-sum/prefix-sum-basics` (it has a `viz` block).
2. With no stored choice, the panel should show Python, and stepping should move the line highlight.
3. Run `localStorage.setItem("dsa-code-lang","js")` and reload. The panel should show TypeScript with its label, and stepping should highlight the matching TypeScript lines.

- [ ] **Step 6: Commit**

```bash
git add web/src/components/viz/CodePanel.tsx web/tests/codeLangSurfaces.test.tsx
git commit -m "feat(code-lang): viz code panels follow the global language

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: The sandbox follows the store; dead tab CSS removed

**Files:**
- Modify: `web/src/components/sandbox/Sandbox.tsx:120, 125, 226-275`
- Modify: `web/src/app/globals.css` (delete `.code-surface-tabs`, `.code-tab`, `.editor-tab` and their comments; fix one `:root` comment)
- Modify: `web/src/components/kit/languageMarks.tsx:1-4` (doc comment)
- Modify: `web/tests/codeTabs.test.tsx` (delete the two tab-CSS tests and their helpers)
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
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run tests/codeLangSurfaces.test.tsx -t "sandbox|dead tab styles"`
Expected: FAIL.

- [ ] **Step 3: Implement the sandbox change**

In `web/src/components/sandbox/Sandbox.tsx`:

1. Add `import { sandboxLangFor, useCodeLang } from "@/lib/codeLang";` after the `languageMarks` import.
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

4. Replace this exact block (the tab strip and the comment after it, lines 226–275):

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

      {/*
        Mirrors the tab strip's own flush treatment: full toolbar height
        (self-stretch on the wrapper, no fixed h-11 on the buttons) and
        -mr-3 to reach the bar's true right edge, the same way -ml-3 does
        for the tabs on the left. Reset and Run used to float as separate
        soft-cornered pills at a slightly shorter height than the bar
        itself — the one part of this toolbar that read as bolted-on UI
        rather than chrome, next to a tab strip that was already flush and
        full-height. Square corners here are not an oversight: a
        soft-cornered pill flush against the bar's straight top/bottom
        edges would notch its own corners against them, which is what
        "resize it properly" was actually pointing at more than the
        literal button dimensions.
      */}
```

with:

```tsx
      {/*
        The header's global switch picks the language; this only says which
        one the editor holds, so nobody runs code wondering. It sits on the
        toolbar's own paper, not the code canvas, so --muted is the right ink.
      */}
      <span className="inline-flex items-center gap-1.5 font-mono text-[0.72rem] font-semibold text-muted">
        <LanguageMark language={lang} />
        {LANG_LABEL[lang]}
      </span>

      {/*
        Full toolbar height (self-stretch on the wrapper, no fixed h-11 on the
        buttons) and -mr-3 to reach the bar's true right edge. Reset and Run
        used to float as separate soft-cornered pills at a slightly shorter
        height than the bar itself — the one part of this toolbar that read
        as bolted-on UI rather than chrome. Square corners here are not an
        oversight: a soft-cornered pill flush against the bar's straight
        top/bottom edges would notch its own corners against them, which is
        what "resize it properly" was actually pointing at more than the
        literal button dimensions.
      */}
```

`LANGS` stays; the draft-restore loop still uses it.

- [ ] **Step 4: Delete the dead tab CSS and stale comments**

Run from `web/`:

```bash
python3 - <<'PY'
import pathlib
p = pathlib.Path("src/app/globals.css")
s = p.read_text()
start = s.index("/*\n  Stretch + flush, not centered")
end = s.index("/*\n  @uiw/react-codemirror wraps")
block = s[start:end]
assert ".editor-tab[data-active" in block and ".code-body" not in block and "code-lang" not in block
s = s[:start] + s[end:]
old = "see `.code-surface`, `.editor-tab`, and every `bg-code-editor` site."
assert s.count(old) == 1
s = s.replace(old, "see `.code-surface` and every `bg-code-editor` site.")
p.write_text(s)
PY
```

In `web/src/components/kit/languageMarks.tsx`, replace

```tsx
 * Small per-language identity marks for every code tab: the sandbox editor's
 * language tabs, lesson code blocks, and viz code panels all render them, so a
 * language reads the same wherever its code appears.
```

with

```tsx
 * Small per-language identity marks: the header's code-language switch, the
 * sandbox toolbar, lesson code blocks and viz code panels all render them, so
 * a language reads the same wherever its code appears.
```

In `web/tests/codeTabs.test.tsx`:
1. Delete the test `it("shares one tab layout between code blocks and the editor", …)` and the whole `describe("editor language tab hover", …)` block.
2. Delete the now-unused `globals` constant and `rule` helper (lines 10–16).
3. Rename `describe("code tabs match the editor's language tabs"` to `describe("every code surface uses the same marks"`.

- [ ] **Step 5: Run the tests, typecheck, lint**

Run: `npx vitest run tests/codeLangSurfaces.test.tsx tests/codeTabs.test.tsx tests/design-tokens.test.ts && npx tsc --noEmit && npm run lint`
Expected: PASS; no tsc output; lint 0 errors. If lint reports an import in `Sandbox.tsx` as unused, remove only that import.

- [ ] **Step 6: Browser check**

1. Open `http://localhost:3005/courses/dsa/problems/valid-anagram`. The toolbar should show "Py Python" with no tabs.
2. Type `# marker` into the editor.
3. Run `localStorage.setItem("dsa-code-lang","js")` and reload. The editor should show the JavaScript draft or starter, with the label "JavaScript".
4. Switch back with `localStorage.setItem("dsa-code-lang","python")` and reload. `# marker` should still be there.
5. Leave this page open. The mid-run cancel and live switching are checked with the real switch in Task 6.
6. Check the inline sandbox in a lesson (for example `http://localhost:3005/courses/dsa/strings/valid-anagram`) and the landing page demo at `http://localhost:3005/`.

- [ ] **Step 7: Commit**

```bash
git add web/src/components/sandbox/Sandbox.tsx web/src/app/globals.css web/src/components/kit/languageMarks.tsx web/tests/codeLangSurfaces.test.tsx web/tests/codeTabs.test.tsx
git commit -m "feat(code-lang): the sandbox follows the global language

Removes the last language tab and the tab CSS nothing renders any more.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: The header switch (revised 2026-09-15 for the restyled header)

**Files:**
- Create: `web/src/components/layout/CodeLangSwitch.tsx`
- Modify: `web/src/components/layout/Header.tsx` (`<header>` grid, `<nav>`, right cluster), `web/src/components/landing/LandingHeader.tsx` (container grid, `<nav>`, right cluster)
- Test: `web/tests/codeLangSurfaces.test.tsx` (append)

**Interfaces:**
- Consumes: `CodeLang`, `useCodeLang` (Task 1); `LanguageMark`; `ROUND_CONTROL` from `layout/headerChrome.ts`; `cn`.
- Produces:
  - `CodeLangSwitchView({ value, onChange }: { value: CodeLang; onChange: (next: CodeLang) => void })`
  - `CodeLangToggleView({ value, onChange })` with the same props
  - `CodeLangSwitch()` and `CodeLangToggle()`, wired to the store.

- [ ] **Step 1: Write the failing tests.** Add `import { CodeLangSwitchView, CodeLangToggleView } from "@/components/layout/CodeLangSwitch";` to the top of `web/tests/codeLangSurfaces.test.tsx`, then append:

```tsx
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
```

- [ ] **Step 2: Run to verify they fail.** Run `npx vitest run tests/codeLangSurfaces.test.tsx -t "header code-language controls"`. Expected: FAIL, because `@/components/layout/CodeLangSwitch` does not resolve.

- [ ] **Step 3: Implement the controls.** Create `web/src/components/layout/CodeLangSwitch.tsx`:

```tsx
"use client";

import { useRef, type KeyboardEvent } from "react";
import { LanguageMark } from "@/components/kit/languageMarks";
import { ROUND_CONTROL } from "@/components/layout/headerChrome";
import { useCodeLang, type CodeLang } from "@/lib/codeLang";
import { cn } from "@/lib/utils";

const OPTIONS: { value: CodeLang; label: string; mark: string }[] = [
  { value: "python", label: "Python", mark: "python" },
  { value: "js", label: "JS/TS", mark: "javascript" },
];

/**
 * The header's code-language pill (≥ 640px): one round hairline pill, like
 * search and the theme toggle beside it, split between the two languages. The
 * chosen side takes the header's hover fill (--surface) and ink; the other
 * stays muted. Focus is the global :focus-visible outline (headerChrome.ts).
 * Props-only so it renders in tests without the store.
 */
export function CodeLangSwitchView({
  value,
  onChange,
}: {
  value: CodeLang;
  onChange: (next: CodeLang) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = value === "js" ? 1 : 0;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next: number;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % OPTIONS.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index - 1 + OPTIONS.length) % OPTIONS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = OPTIONS.length - 1;
    else return;
    event.preventDefault();
    onChange(OPTIONS[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Code language"
      onKeyDown={onKeyDown}
      className="hidden h-10 items-center gap-0.5 rounded-full border border-border p-0.5 sm:inline-flex"
    >
      {OPTIONS.map((option, i) => {
        const checked = i === index;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-full items-center gap-1.5 rounded-full px-3 text-sm transition-colors",
              checked ? "bg-surface font-medium text-foreground" : "text-muted hover:text-foreground",
            )}
          >
            <LanguageMark language={option.mark} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The phone toggle (< 640px): the nav row has no room for the pill (measured
 * 2026-09-15), so one round control beside search shows the current mark and
 * switches on tap.
 */
export function CodeLangToggleView({
  value,
  onChange,
}: {
  value: CodeLang;
  onChange: (next: CodeLang) => void;
}) {
  const current = OPTIONS[value === "js" ? 1 : 0];
  const other = OPTIONS[value === "js" ? 0 : 1];
  return (
    <button
      type="button"
      onClick={() => onChange(other.value)}
      aria-label={`Code language: ${current.label}. Switch to ${other.label}`}
      className={cn(ROUND_CONTROL, "h-11 w-11 sm:hidden")}
    >
      <LanguageMark language={current.mark} />
    </button>
  );
}

export function CodeLangSwitch() {
  const [value, setValue] = useCodeLang();
  return <CodeLangSwitchView value={value} onChange={setValue} />;
}

export function CodeLangToggle() {
  const [value, setValue] = useCodeLang();
  return <CodeLangToggleView value={value} onChange={setValue} />;
}
```

- [ ] **Step 4: Wire the app header.** In `web/src/components/layout/Header.tsx`:
  1. Add `import { CodeLangSwitch, CodeLangToggle } from "@/components/layout/CodeLangSwitch";`.
  2. After `nextjsCurriculumActive`, add:
     ```tsx
       // The Next.js course is TypeScript-only: no language to choose there.
       const showCodeLang = !(courseSlug === "nextjs" && routeCourse?.status === "available");
     ```
  3. In the `<header>` class, change `grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2` to `grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5`, change `px-3 sm:gap-3 sm:px-4` to `px-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-3 sm:px-4`, and add this comment above `return (`:
     ```tsx
       // Below sm the right cluster also holds the code-language toggle. Measured
       // 2026-09-15 (13px root): with equal 1fr side tracks a lesson header
       // overflowed 26.5px at 320px, so the sides size to their content, the
       // nav centres in the middle track, and gaps and padding step down once.
     ```
  4. In the nav, change `gap-5 justify-self-center sm:gap-8` to `gap-4 justify-self-center sm:gap-8`, and add `{showCodeLang ? <CodeLangSwitch /> : null}` as the nav's last child, after the DSA/Curriculum branch.
  5. In the right cluster, change `gap-1.5 justify-self-end sm:gap-2 md:gap-3` to `gap-1 justify-self-end sm:gap-2 md:gap-3`, and add `{showCodeLang ? <CodeLangToggle /> : null}` as its first child, before the search button.

- [ ] **Step 5: Wire the landing header.** In `web/src/components/landing/LandingHeader.tsx`:
  1. Add the same import.
  2. Container: change `grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-6` to `grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 px-6 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-3`. Keep `px-6`: it is the hero's gutter, and 320px has 15px spare by arithmetic, which Step 7 confirms.
  3. Nav: change `gap-5` to `gap-4`, and add `<CodeLangSwitch />` after `{NAV.map(...)}`.
  4. Right cluster: change `gap-2` to `gap-1`, and add `<CodeLangToggle />` as its first child.

- [ ] **Step 6: Run the tests, typecheck, lint.** Run `npx vitest run tests/codeLangSurfaces.test.tsx tests/appHeader.test.tsx tests/landingHeader.test.tsx tests/sidebarChrome.test.ts && npx tsc --noEmit && npx eslint src/components/layout/CodeLangSwitch.tsx src/components/layout/Header.tsx src/components/landing/LandingHeader.tsx`. Expected: PASS; no tsc output; eslint 0 problems.

- [ ] **Step 7: Browser check.** Use Playwright against the worktree's dev server on port 3005.
  - **Every page and width:** `/`, `/courses/dsa/arrays/dynamic-arrays` and `/courses/dsa/problems/valid-anagram`, at 320, 360, 375, 640, 768 and 1024px. For each, read the header's grid children and check:
    - the left column's right edge ≤ the nav's left edge + 0.5, and the nav's right edge ≤ the right column's left edge + 0.5;
    - no control is clipped past the viewport;
    - the pill is visible from 640px, and the toggle only below.
  - **If `/` fails at 320px with `px-6`:** change the landing container to `px-2 sm:px-6`, update the Step 1 test's `px-6` expectation to `px-2` and `sm:px-6`, and record the measurement in the spec.
  - **Keyboard and live update:** Tab to the pill, use arrow keys, and confirm the global focus outline is visible. Switching updates a lesson's code blocks, a viz panel and a sandbox live. Check both themes.

- [ ] **Step 8: Commit.**

```bash
git add web/src/components/layout/CodeLangSwitch.tsx web/src/components/layout/Header.tsx web/src/components/landing/LandingHeader.tsx web/tests/codeLangSurfaces.test.tsx
git commit -m "feat(code-lang): global language switch in both headers

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Doctrine, full verification, cleanup

**Files:**
- Modify: `CLAUDE.md` (§4 Design system)
- Modify: `.claude/launch.json` (remove the temporary entry)

**Interfaces:**
- Consumes: everything above.
- Produces: the finished branch.

- [ ] **Step 1: Record the doctrine**

In `CLAUDE.md` §4, after the "lessons drawer's tabs" bullet, add:

```markdown
- **Code language is one global choice.** The header's switch
  (`CodeLangSwitch`) picks `python` or `js`; `js` means TypeScript where code
  is read (lesson blocks, viz panels) and JavaScript where it runs (the
  sandbox). No surface owns language tabs. `lib/codeLang.ts` is the store. A
  plain inline script at the top of `<body>`, after the lamp's boot script (`lib/codeLangScript.ts`) sets
  `<html data-code-lang>` from `localStorage` (`dsa-code-lang`) while the page
  parses — never `next/script` `beforeInteractive`, which the App Router runs
  from its bootstrap after first paint. Lesson code blocks server-render both
  languages with `data-code-lang-panel` and CSS hides the other one, so pages
  stay static and never flash. Hide rules key off an explicit `js`, so no
  attribute reads as Python. Every `tabs` fence must carry exactly `python`
  and `typescript` (content test). Guarded in `codeLang.test.ts` and
  `codeLangSurfaces.test.tsx`.
```

- [ ] **Step 2: Full gate**

Run from `web/`: `npx tsc --noEmit && npm run lint && npx vitest run && npm run build`
Expected: tsc silent; lint 0 errors; all test files pass; build prints "Compiled successfully", and every `/courses/dsa/[module]/[lesson]` route is still listed as static (●/○), not dynamic (ƒ).

- [ ] **Step 3: Prove no flash at first paint**

Run with Playwright `browser_run_code_unsafe`. It blocks all Next JavaScript so that only the inline script and CSS can act:

```js
async (page) => {
  const ctx = await page.context().browser().newContext();
  await ctx.addInitScript(() => localStorage.setItem("dsa-code-lang", "js"));
  const p = await ctx.newPage();
  await p.route("**/_next/static/**/*.js", (route) => route.abort());
  await p.goto("http://localhost:3005/courses/dsa/arrays/dynamic-arrays");
  const result = await p.evaluate(() => ({
    attribute: document.documentElement.getAttribute("data-code-lang"),
    queuedByNext: JSON.stringify(self.__next_s ?? []).includes("code-lang"),
    panels: [...document.querySelectorAll("[data-code-lang-panel]")].map((el) => ({
      panel: el.getAttribute("data-code-lang-panel"),
      display: getComputedStyle(el).display,
    })),
  }));
  await ctx.close();
  return result;
}
```

Expected:
- `attribute` is `"js"`.
- `queuedByNext` is `false`.
- `panels` is non-empty.
- Every `python` panel has `display: "none"`, and no `js` panel does.

- [ ] **Step 4: Cross-tab and reload checks**

1. In one Playwright context, open two pages on `http://localhost:3005/courses/dsa/arrays/dynamic-arrays`.
2. Click JS/TS in the first page's switch (at ≥ 640px width).
3. Within a second, the second page's `<html data-code-lang>` should be `"js"` and its TypeScript panel visible.
4. Reload the first page. The choice should persist.

- [ ] **Step 5: Clean up the scaffolding**

1. Stop the `web-dev-codelang` server (`preview_stop`).
2. Remove its entry from `.claude/launch.json`.
3. Move any `.playwright-mcp/` folder out of the repo into the session scratchpad.
4. Run `git status` and confirm only intended files are changed.

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): record the global code-language rule

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

Then use superpowers:finishing-a-development-branch to decide how to land `feat/code-lang-switch`.
