# Code Language Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the code-language choice from the app header onto every code surface as a menu, and store a real language id so more languages can be added.

**Architecture:** A hook-free registry (`lib/codeLanguages.ts`) defines the languages, their fallback chains, and generates the CSS that shows each server-rendered block's resolved language before paint. The existing store (`lib/codeLang.ts`) keeps one id. A menu-button component (`components/code/CodeLangMenu.tsx`) replaces the static labels on lesson code blocks, viz code panels and the sandbox toolbar; the header switch is deleted.

**Tech Stack:** Next.js 16 App Router, React 19 (`useSyncExternalStore`, `createPortal`), Tailwind v4, Vitest 4 + jsdom, Playwright MCP for browser checks.

Spec: `docs/superpowers/specs/2026-09-14-global-code-language-switch-design.md` (revised 2026-09-17).

## Global Constraints

- Language ids: `python`, `javascript`, `typescript`, in that menu order. Storage key `dsa-code-lang`, attribute `data-code-lang`.
- Fallback: preferred id → `javascript` ↔ `typescript` → remaining ids in registry order.
- Server-rendered blocks mark their languages with `data-code-lang-has="…"` (space-separated) and each language's elements with `data-code-lang-panel="<id>"`.
- The pre-paint script is a plain inline `<script>` right after `LAMP_BOOT_SCRIPT`; the generated rules are an inline `<style id="code-lang-rules">` right after it. Never `next/script` `beforeInteractive`.
- Anything the server layout imports must not import React hooks (it 500'd every route once).
- Colour only through tokens; focus is the global `:focus-visible` outline (no ring utilities); touch targets `min-h-11` below `md`.
- Every new test is seen failing before it passes; check vitest's exit code directly, never through a pipe.
- Commits end with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- All commands run from `/Users/tharunk/leetExpert/.worktrees/code-lang-switch/web` unless stated.

---

### Task 1: Remove the header switch

**Files:**
- Delete: `web/src/components/layout/CodeLangSwitch.tsx`
- Restore from `main`: `web/src/components/layout/Header.tsx`, `web/src/components/landing/LandingHeader.tsx`
- Modify: `web/tests/codeLangSurfaces.test.tsx` (drop the header-controls block and its import; add a guard)
- Modify: `web/src/components/kit/languageMarks.tsx` (doc comment)

**Interfaces:** Consumes nothing. Produces headers with no language control.

- [ ] **Step 1: Write the failing guard.** In `tests/codeLangSurfaces.test.tsx`, change the `node:fs` import to `import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";`, delete the line `import { CodeLangSwitchView, CodeLangToggleView } from "@/components/layout/CodeLangSwitch";`, delete the whole `describe("header code-language controls", …)` block, and append:

```tsx
describe("app and landing headers", () => {
  it("carry no code-language control; it is picked on the code surfaces", () => {
    for (const rel of [
      ["components", "layout", "Header.tsx"],
      ["components", "landing", "LandingHeader.tsx"],
    ]) {
      expect(read(...rel), rel.join("/")).not.toMatch(/CodeLang/);
    }
    expect(existsSync(join(__dirname, "..", "src", "components", "layout", "CodeLangSwitch.tsx"))).toBe(false);
  });
});
```

- [ ] **Step 2: Run it and see it fail.** `npx vitest run tests/codeLangSurfaces.test.tsx -t "app and landing headers"; echo "exit=$?"` → exit 1.

- [ ] **Step 3: Implement.**

```bash
git checkout main -- src/components/layout/Header.tsx src/components/landing/LandingHeader.tsx
git rm -q src/components/layout/CodeLangSwitch.tsx
```

In `src/components/kit/languageMarks.tsx` replace ` * Small per-language identity marks: the header's code-language switch, the` with ` * Small per-language identity marks: the code-language picker, the`.

- [ ] **Step 4: Verify.** `npx vitest run tests/codeLangSurfaces.test.tsx tests/appHeader.test.tsx tests/landingHeader.test.tsx; echo "exit=$?"` → exit 0. `npx tsc --noEmit; echo "tsc=$?"` → 0.

- [ ] **Step 5: Commit.**

```bash
git add -A src/components/layout src/components/landing src/components/kit/languageMarks.tsx tests/codeLangSurfaces.test.tsx
git commit -m "refactor(code-lang): remove the header switch

The language is picked on the code surfaces instead (spec revision
2026-09-17).

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Language registry, generated resolution rules, id-valued store

**Files:**
- Create: `web/src/lib/codeLanguages.ts`
- Delete: `web/src/lib/codeLangKeys.ts`
- Modify: `web/src/lib/codeLang.ts`, `web/src/lib/codeLangScript.ts`, `web/src/app/layout.tsx`, `web/src/app/globals.css`, `web/src/components/md/CodeBlock.tsx`, `web/src/components/course/CodeTabs.tsx`, `web/src/components/viz/CodePanel.tsx`, `web/src/components/sandbox/Sandbox.tsx`
- Test: `web/tests/codeLang.test.ts` (rewrite), `web/tests/codeLangSurfaces.test.tsx` (update)

**Interfaces:**
- Produces from `@/lib/codeLanguages`: `CODE_LANG_IDS: readonly ["python","javascript","typescript"]`, `type CodeLangId`, `CODE_LANG_LABEL: Record<CodeLangId,string>`, `DEFAULT_CODE_LANG`, `CODE_LANG_STORAGE_KEY`, `CODE_LANG_ATTRIBUTE`, `isCodeLangId(v): v is CodeLangId`, `parseCodeLang(v): CodeLangId`, `codeLangChain(id): CodeLangId[]`, `resolveCodeLang<T extends CodeLangId>(preferred, available: readonly T[]): T`, `codeLangCss(): string`.
- Produces from `@/lib/codeLang`: `readCodeLang(): CodeLangId`, `setCodeLang(id)`, `subscribeCodeLang(fn)`, `useCodeLang(): [CodeLangId, (id: CodeLangId) => void]`.
- Produces from `@/lib/codeLangScript`: `CODE_LANG_INIT_SCRIPT`, `CODE_LANG_CSS`.

- [ ] **Step 1: Rewrite `tests/codeLang.test.ts`** with this content:

```ts
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CODE_LANG_ATTRIBUTE,
  CODE_LANG_IDS,
  CODE_LANG_STORAGE_KEY,
  codeLangChain,
  codeLangCss,
  parseCodeLang,
  resolveCodeLang,
  type CodeLangId,
} from "@/lib/codeLanguages";
import { readCodeLang, setCodeLang, subscribeCodeLang } from "@/lib/codeLang";
import { CODE_LANG_INIT_SCRIPT } from "@/lib/codeLangScript";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute(CODE_LANG_ATTRIBUTE);
});
afterEach(() => vi.restoreAllMocks());

describe("the registry", () => {
  it("accepts only registry ids; everything else is python", () => {
    for (const id of CODE_LANG_IDS) expect(parseCodeLang(id)).toBe(id);
    for (const junk of [null, undefined, "", "js", "JS", "Python", "ts", 1]) {
      expect(parseCodeLang(junk)).toBe("python");
    }
  });

  it("falls back to the nearest relative, then registry order, covering every language", () => {
    expect(codeLangChain("typescript")).toEqual(["typescript", "javascript", "python"]);
    expect(codeLangChain("javascript")).toEqual(["javascript", "typescript", "python"]);
    expect(codeLangChain("python")).toEqual(["python", "javascript", "typescript"]);
    for (const id of CODE_LANG_IDS) {
      expect([...codeLangChain(id)].sort()).toEqual([...CODE_LANG_IDS].sort());
    }
  });

  it("resolves a preference against the languages a surface has", () => {
    expect(resolveCodeLang("typescript", ["python", "javascript"])).toBe("javascript");
    expect(resolveCodeLang("javascript", ["python", "typescript"])).toBe("typescript");
    expect(resolveCodeLang("typescript", ["python", "typescript"])).toBe("typescript");
    expect(resolveCodeLang("javascript", ["python"])).toBe("python");
  });
});

describe("the store", () => {
  it("reads python when no attribute is set", () => {
    expect(readCodeLang()).toBe("python");
  });

  it("writes the attribute and storage, and notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeCodeLang(listener);
    setCodeLang("typescript");
    expect(document.documentElement.getAttribute(CODE_LANG_ATTRIBUTE)).toBe("typescript");
    expect(localStorage.getItem(CODE_LANG_STORAGE_KEY)).toBe("typescript");
    expect(readCodeLang()).toBe("typescript");
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
    setCodeLang("javascript");
    expect(readCodeLang()).toBe("javascript");
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("follows a change made in another tab, and ignores junk", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeCodeLang(listener);
    window.dispatchEvent(new StorageEvent("storage", { key: CODE_LANG_STORAGE_KEY, newValue: "typescript" }));
    expect(readCodeLang()).toBe("typescript");
    window.dispatchEvent(new StorageEvent("storage", { key: CODE_LANG_STORAGE_KEY, newValue: "js" }));
    expect(readCodeLang()).toBe("python");
    window.dispatchEvent(new StorageEvent("storage", { key: "unrelated", newValue: "x" }));
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });
});

describe("the generated resolution rules", () => {
  const subsets = (ids: readonly CodeLangId[]): CodeLangId[][] =>
    ids.reduce<CodeLangId[][]>((all, id) => [...all, ...all.map((s) => [...s, id]), [id]], []);

  it("show exactly the resolved language in every block, for every preference", () => {
    // Executed, not string-matched: jsdom applies the stylesheet.
    const style = document.createElement("style");
    style.textContent = codeLangCss();
    document.head.append(style);
    const mismatches: string[] = [];
    for (const preferred of [null, ...CODE_LANG_IDS]) {
      if (preferred) document.documentElement.setAttribute(CODE_LANG_ATTRIBUTE, preferred);
      else document.documentElement.removeAttribute(CODE_LANG_ATTRIBUTE);
      for (const available of subsets(CODE_LANG_IDS)) {
        const block = document.createElement("div");
        block.setAttribute("data-code-lang-has", available.join(" "));
        for (const id of available) {
          const label = document.createElement("span");
          label.setAttribute("data-code-lang-panel", id);
          const wrapper = document.createElement("button");
          wrapper.append(label);
          block.append(wrapper);
        }
        document.body.append(block);
        const shown = [...block.querySelectorAll("[data-code-lang-panel]")]
          .filter((el) => getComputedStyle(el).display !== "none")
          .map((el) => el.getAttribute("data-code-lang-panel"));
        const expected = resolveCodeLang(preferred ?? "python", available);
        if (shown.join(",") !== expected) {
          mismatches.push(`${preferred}: [${available}] showed [${shown}], expected ${expected}`);
        }
        block.remove();
      }
    }
    style.remove();
    expect(mismatches).toEqual([]);
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

  it("sets every registry id that is stored", () => {
    for (const id of CODE_LANG_IDS) {
      expect(run({ getItem: () => id }).get(CODE_LANG_ATTRIBUTE)).toBe(id);
    }
  });

  it("sets nothing for junk or an empty store", () => {
    for (const stored of ["js", "JS", "", null]) {
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

  it("runs while the HTML parses, after the lamp's boot script, with the rules right after it", () => {
    // Plain inline tags: next/script beforeInteractive is queued and run by
    // Next's bootstrap after the JS chunks load, which is after first paint.
    const layout = readFileSync(join(__dirname, "..", "src", "app", "layout.tsx"), "utf8");
    expect(layout).toMatch(
      /<script dangerouslySetInnerHTML=\{\{ __html: LAMP_BOOT_SCRIPT \}\} \/>\s*\{\/\*[\s\S]*?\*\/\}\s*<script\s+id="code-lang-init"\s+dangerouslySetInnerHTML=\{\{ __html: CODE_LANG_INIT_SCRIPT \}\}\s*\/>\s*<style\s+id="code-lang-rules"\s+dangerouslySetInnerHTML=\{\{ __html: CODE_LANG_CSS \}\}\s*\/>/,
    );
    // Usage, not the word: the layout's own comment explains why it is not used.
    expect(layout).not.toMatch(/strategy=["'{]\s*["']?beforeInteractive/);
  });

  it("imports nothing that uses React hooks, since the server layout imports it", () => {
    // tsc and these tests cannot see Next's server/client boundary: when this
    // module reached codeLang.ts (useSyncExternalStore), every route 500'd.
    const src = join(__dirname, "..", "src");
    const script = readFileSync(join(src, "lib", "codeLangScript.ts"), "utf8");
    const imports = [...script.matchAll(/from "@\/([^"]+)"/g)].map((m) => m[1]);
    expect(imports.length).toBeGreaterThan(0);
    for (const path of imports) {
      const imported = readFileSync(join(src, `${path}.ts`), "utf8");
      expect(imported, path).not.toMatch(/from "react"/);
    }
  });
});
```

- [ ] **Step 2: Update `tests/codeLangSurfaces.test.tsx`.**
  - Replace the `describe("panel hide rules", …)` block with:

```tsx
describe("panel resolution", () => {
  it("lives in the generated rules (lib/codeLanguages.ts), never hand-written CSS", () => {
    expect(globals).not.toContain("[data-code-lang-panel");
  });
});
```

  - In `describe("lesson code blocks")` replace the test `"render both languages as panels the hide rules can target"` with:

```tsx
  it("render both languages as panels inside a block that names them", () => {
    expect(html).toMatch(/<div class="code-surface group my-5" data-code-lang-has="python typescript">/);
    expect(html).toMatch(/<pre data-code-lang-panel="python" class="code-body[^"]*">x = 1<\/pre>/);
    expect(html).toMatch(/<pre data-code-lang-panel="typescript" class="code-body[^"]*">let x = 1<\/pre>/);
  });
```

  - In the label test replace `data-code-lang-panel="js"` with `data-code-lang-panel="typescript"`.
  - In `describe("viz code panels")` replace `expect(panel).toMatch(/const lang = readingLangFor\(codeLang\);/);` with `expect(panel).toMatch(/const lang = resolveCodeLang\(codeLang, VIZ_LANGS\);/);`.
  - In `describe("sandbox")` replace `expect(sandbox).toMatch(/const lang = sandboxLangFor\(codeLang\);/);` with `expect(sandbox).toMatch(/const lang = resolveCodeLang\(codeLang, LANGS\);/);`.

- [ ] **Step 3: Run and see them fail.** `npx vitest run tests/codeLang.test.ts tests/codeLangSurfaces.test.tsx; echo "exit=$?"` → exit 1 (`@/lib/codeLanguages` does not resolve).

- [ ] **Step 4: Create `src/lib/codeLanguages.ts`.**

```ts
/**
 * The code languages a learner can prefer, and how a preference resolves on
 * a surface that lacks it. Hook-free on purpose: the server layout imports the
 * pre-paint script and the generated rules, which read this, and a module that
 * imports React hooks cannot sit in a Server Component's graph.
 * Spec: docs/superpowers/specs/2026-09-14-global-code-language-switch-design.md
 */
export const CODE_LANG_IDS = ["python", "javascript", "typescript"] as const;

export type CodeLangId = (typeof CODE_LANG_IDS)[number];

export const CODE_LANG_LABEL: Record<CodeLangId, string> = {
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
};

export const DEFAULT_CODE_LANG: CodeLangId = "python";
export const CODE_LANG_STORAGE_KEY = "dsa-code-lang";
export const CODE_LANG_ATTRIBUTE = "data-code-lang";

/** TypeScript without its types is JavaScript, so each is the other's nearest. */
const NEAREST: Partial<Record<CodeLangId, CodeLangId[]>> = {
  javascript: ["typescript"],
  typescript: ["javascript"],
};

export function isCodeLangId(value: unknown): value is CodeLangId {
  return CODE_LANG_IDS.some((id) => id === value);
}

export function parseCodeLang(value: unknown): CodeLangId {
  return isCodeLangId(value) ? value : DEFAULT_CODE_LANG;
}

/** The preference, its nearest relatives, then every other language — so every surface resolves. */
export function codeLangChain(preferred: CodeLangId): CodeLangId[] {
  const order = [preferred, ...(NEAREST[preferred] ?? []), ...CODE_LANG_IDS];
  return order.filter((id, i) => order.indexOf(id) === i);
}

export function resolveCodeLang<T extends CodeLangId>(preferred: CodeLangId, available: readonly T[]): T {
  for (const id of codeLangChain(preferred)) {
    const hit = available.find((lang) => lang === id);
    if (hit) return hit;
  }
  return available[0];
}

/**
 * The rules that show each server-rendered block's resolved language before
 * paint. A panel for language L is hidden in a block that also has a language
 * earlier than L in the preference's chain. `~=` matching needs no :has(). With
 * no attribute (first visit, blocked script) blocks resolve as python.
 */
export function codeLangCss(): string {
  return CODE_LANG_IDS.map((preferred) => {
    const roots =
      preferred === DEFAULT_CODE_LANG
        ? [`html:not([${CODE_LANG_ATTRIBUTE}])`, `html[${CODE_LANG_ATTRIBUTE}="${preferred}"]`]
        : [`html[${CODE_LANG_ATTRIBUTE}="${preferred}"]`];
    const chain = codeLangChain(preferred);
    const selectors = chain.flatMap((lang, i) =>
      chain
        .slice(0, i)
        .flatMap((earlier) =>
          roots.map((root) => `${root} [data-code-lang-has~="${earlier}"] [data-code-lang-panel="${lang}"]`),
        ),
    );
    return `${selectors.join(",\n")} {\n  display: none;\n}`;
  }).join("\n");
}
```

- [ ] **Step 5: Rewrite `src/lib/codeLang.ts`.**

```ts
import { useSyncExternalStore } from "react";
import {
  CODE_LANG_ATTRIBUTE,
  CODE_LANG_STORAGE_KEY,
  DEFAULT_CODE_LANG,
  parseCodeLang,
  type CodeLangId,
} from "@/lib/codeLanguages";

/**
 * The learner's preferred code language, picked from any code surface's menu.
 * The source of truth is the `data-code-lang` attribute on <html>: an inline
 * script sets it from storage while the page parses, generated CSS resolves
 * server-rendered blocks from it, and this store reads the same attribute so
 * client components agree with what is already on screen.
 * Spec: docs/superpowers/specs/2026-09-14-global-code-language-switch-design.md
 */
const listeners = new Set<() => void>();

export function readCodeLang(): CodeLangId {
  return parseCodeLang(document.documentElement.getAttribute(CODE_LANG_ATTRIBUTE));
}

export function setCodeLang(next: CodeLangId): void {
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
 * server-rendered code blocks are resolved by CSS before paint, so only
 * interactive surfaces re-render once hydration reads the real attribute.
 */
export function useCodeLang(): [CodeLangId, (next: CodeLangId) => void] {
  const lang = useSyncExternalStore(subscribeCodeLang, readCodeLang, () => DEFAULT_CODE_LANG);
  return [lang, setCodeLang];
}
```

- [ ] **Step 6: Rewrite `src/lib/codeLangScript.ts`, delete the keys module, add the style tag.**

```ts
import {
  CODE_LANG_ATTRIBUTE,
  CODE_LANG_IDS,
  CODE_LANG_STORAGE_KEY,
  codeLangCss,
} from "@/lib/codeLanguages";

/**
 * Rendered as a plain inline <script> at the top of <body>, right after the
 * lamp's boot script, so it runs while the HTML parses — before any code block
 * below it paints. Only registry ids are copied; anything else leaves no
 * attribute, which resolves as Python, as does a blocked script.
 */
export const CODE_LANG_INIT_SCRIPT = `(function(){try{var v=localStorage.getItem(${JSON.stringify(
  CODE_LANG_STORAGE_KEY,
)});if(${JSON.stringify(CODE_LANG_IDS)}.indexOf(v)!==-1){document.documentElement.setAttribute(${JSON.stringify(
  CODE_LANG_ATTRIBUTE,
)},v)}}catch(e){}})();`;

/** The resolution rules, rendered as an inline <style> right after the script. */
export const CODE_LANG_CSS = codeLangCss();
```

```bash
git rm -q src/lib/codeLangKeys.ts
```

In `src/app/layout.tsx` change the import to `import { CODE_LANG_CSS, CODE_LANG_INIT_SCRIPT } from "@/lib/codeLangScript";` and directly after the `<script id="code-lang-init" … />` element add:

```tsx
        <style id="code-lang-rules" dangerouslySetInnerHTML={{ __html: CODE_LANG_CSS }} />
```

Update the comment above the script to: `{/* Sets <html data-code-lang> from storage while the HTML still parses, and the generated rules after it resolve every code block below to the learner's language. After the lamp's boot script, which must stay first. */}` (keep the existing comment's line wrapping style).

- [ ] **Step 7: Replace the hand-written hide rules in `src/app/globals.css`.** Delete the comment block beginning `Global code language (lib/codeLang.ts).` and the two-selector `display: none` rule after it. In the `.code-lang-label` comment replace `The hide rules above outrank this display on specificity.` with `The generated resolution rules (lib/codeLanguages.ts) outrank this display on specificity.`

- [ ] **Step 8: Move consumers onto ids.**

`src/components/md/CodeBlock.tsx`: replace `import type { CodeLang } from "@/lib/codeLang";` with `import type { CodeLangId } from "@/lib/codeLanguages";` and `panel?: CodeLang;` with `panel?: CodeLangId;`; change its doc comment to `/** Marks this body as one language of a tabs block (lib/codeLanguages.ts). */`.

`src/components/course/CodeTabs.tsx`, whole file:

```tsx
"use client";

import { CodeBody, CopyButton } from "@/components/md/CodeBlock";
import { LanguageMark } from "@/components/kit/languageMarks";
import { useCodeLang } from "@/lib/codeLang";
import { isCodeLangId, resolveCodeLang, type CodeLangId } from "@/lib/codeLanguages";
import type { TabBlock } from "@/lib/content/highlightBlocks";

type LangTab = TabBlock & { language: CodeLangId };

/**
 * A lesson's code in several languages. Every language renders on the server;
 * the block names them in data-code-lang-has and generated CSS shows the one
 * the learner's preference resolves to before paint, so a static page never
 * flashes the wrong language. Copy follows the store, which agrees with the
 * attribute once hydrated.
 */
export function CodeTabs({ tabs }: { tabs: TabBlock[] }) {
  const [preferred] = useCodeLang();
  const panels = tabs.filter((tab): tab is LangTab => isCodeLangId(tab.language));
  if (panels.length === 0) {
    return null;
  }
  const available = panels.map((tab) => tab.language);
  const shown = resolveCodeLang(preferred, available);
  const visible = panels.find((tab) => tab.language === shown) ?? panels[0];

  return (
    <div className="code-surface group my-5" data-code-lang-has={available.join(" ")}>
      <div className="code-surface-header">
        <span className="inline-flex items-center">
          {panels.map((tab) => (
            <span key={tab.language} data-code-lang-panel={tab.language} className="code-lang-label">
              <LanguageMark language={tab.language} />
              {tab.label}
            </span>
          ))}
        </span>
        <CopyButton code={visible.code} />
      </div>
      {panels.map((tab) => (
        <CodeBody key={tab.language} code={tab.code} html={tab.html} panel={tab.language} />
      ))}
    </div>
  );
}
```

`src/components/viz/CodePanel.tsx`: replace `import { readingLangFor, useCodeLang } from "@/lib/codeLang";` with

```tsx
import { useCodeLang } from "@/lib/codeLang";
import { resolveCodeLang } from "@/lib/codeLanguages";
```

add after the `LABEL` record `const VIZ_LANGS: VizLang[] = ["python", "typescript"];`, and replace `const lang = readingLangFor(codeLang);` with `const lang = resolveCodeLang(codeLang, VIZ_LANGS);`.

`src/components/sandbox/Sandbox.tsx`: replace `import { sandboxLangFor, useCodeLang } from "@/lib/codeLang";` with

```tsx
import { useCodeLang } from "@/lib/codeLang";
import { resolveCodeLang } from "@/lib/codeLanguages";
```

and `const lang = sandboxLangFor(codeLang);` with `const lang = resolveCodeLang(codeLang, LANGS);`.

- [ ] **Step 9: Verify.** `npx vitest run tests/codeLang.test.ts tests/codeLangSurfaces.test.tsx tests/codeTabs.test.tsx tests/design-tokens.test.ts; echo "exit=$?"` → 0. `npx tsc --noEmit; echo "tsc=$?"` → 0. `npx eslint src/lib src/components/course/CodeTabs.tsx src/components/viz/CodePanel.tsx src/components/sandbox/Sandbox.tsx src/components/md/CodeBlock.tsx src/app/layout.tsx tests/codeLang.test.ts; echo "eslint=$?"` → 0. If the CSS-resolution test passed on its first run, change `display: none` to `display: block` in `codeLangCss`, see that test fail, restore.

- [ ] **Step 10: Commit.**

```bash
git add -A src/lib src/app/layout.tsx src/app/globals.css src/components/md/CodeBlock.tsx src/components/course/CodeTabs.tsx src/components/viz/CodePanel.tsx src/components/sandbox/Sandbox.tsx tests/codeLang.test.ts tests/codeLangSurfaces.test.tsx
git commit -m "feat(code-lang): store a real language id and resolve it per surface

A registry defines the languages and their fallback order, and generates
the pre-paint rules that show each block's resolved language.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: The picker menu

**Files:**
- Create: `web/src/components/code/CodeLangMenu.tsx`
- Modify: `web/src/app/globals.css` (paper tone)
- Test: `web/tests/codeLangMenu.test.tsx`

**Interfaces:**
- Consumes: `useCodeLang` (Task 2); `CODE_LANG_LABEL`, `resolveCodeLang`, `CodeLangId` (Task 2); `LanguageMark`.
- Produces: `CodeLangMenuView<T extends CodeLangId>({ available: readonly T[]; preferred: CodeLangId; onPick: (id: T, trigger: HTMLElement) => void; cssLabels?: boolean; tone?: "code" | "paper" })` and `CodeLangMenu<T>({ available, cssLabels?, tone? })` wired to the store with scroll anchoring.

- [ ] **Step 1: Write `tests/codeLangMenu.test.tsx`.**

```tsx
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CodeLangMenuView } from "@/components/code/CodeLangMenu";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
});

function mount(ui: ReactElement): HTMLElement {
  const host = document.createElement("div");
  document.body.append(host);
  const created = createRoot(host);
  root = created;
  act(() => created.render(ui));
  return host;
}

function must<T extends Element>(el: T | null, what: string): T {
  if (!el) throw new Error(`missing ${what}`);
  return el;
}

const trigger = (host: HTMLElement) =>
  must(host.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]'), "trigger");
const items = () => [...document.body.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')];
const press = (el: Element, key: string) =>
  act(() => {
    el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  });

describe("the picker trigger", () => {
  it("labels every language for CSS resolution and names itself before hydration", () => {
    const html = renderToStaticMarkup(
      <CodeLangMenuView available={["python", "javascript"]} preferred="python" onPick={() => {}} cssLabels />,
    );
    expect(html).toContain('data-code-lang-has="python javascript"');
    expect(html).toContain('<span class="sr-only">Code language: </span>');
    expect(html).toMatch(/<span data-code-lang-panel="python"[^>]*>[\s\S]*?Python<\/span>/);
    expect(html).toMatch(/<span data-code-lang-panel="javascript"[^>]*>[\s\S]*?JavaScript<\/span>/);
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('role="menu"');
  });

  it("labels only the resolved language when the surface renders on the client", () => {
    const html = renderToStaticMarkup(
      <CodeLangMenuView available={["python", "javascript"]} preferred="typescript" onPick={() => {}} />,
    );
    expect(html).toContain("JavaScript");
    expect(html).not.toContain(">Python<");
    expect(html).not.toContain("data-code-lang-panel");
  });

  it("takes the page's muted ink on paper and the code ink on the canvas", () => {
    const globals = readFileSync(join(__dirname, "..", "src", "app", "globals.css"), "utf8");
    expect(globals).toMatch(/\n\.code-lang-label\[data-tone="paper"\] \{[^}]*color: var\(--muted\);/);
    const html = renderToStaticMarkup(
      <CodeLangMenuView available={["python"]} preferred="python" onPick={() => {}} tone="paper" />,
    );
    expect(html).toContain('data-tone="paper"');
  });
});

describe("the picker menu", () => {
  it("opens from the keyboard on the shown language, moves with wrap, and picks", () => {
    const onPick = vi.fn();
    const host = mount(<CodeLangMenuView available={["python", "javascript"]} preferred="python" onPick={onPick} />);
    press(trigger(host), "ArrowDown");
    const menu = must(document.body.querySelector('[role="menu"]'), "menu");
    expect(menu.getAttribute("aria-label")).toBe("Code language");
    expect(items().map((b) => [b.textContent, b.getAttribute("aria-checked")])).toEqual([
      ["PyPython", "true"],
      ["JSJavaScript", "false"],
    ]);
    expect(document.activeElement).toBe(items()[0]);
    press(menu, "ArrowDown");
    expect(document.activeElement).toBe(items()[1]);
    press(menu, "ArrowDown");
    expect(document.activeElement).toBe(items()[0]);
    press(menu, "End");
    expect(document.activeElement).toBe(items()[1]);
    press(menu, "Enter");
    expect(onPick).toHaveBeenCalledWith("javascript", trigger(host));
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger(host));
  });

  it("closes on Escape without picking and returns focus", () => {
    const onPick = vi.fn();
    const host = mount(<CodeLangMenuView available={["python", "javascript"]} preferred="python" onPick={onPick} />);
    press(trigger(host), "Enter");
    press(must(document.body.querySelector('[role="menu"]'), "menu"), "Escape");
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
    expect(onPick).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger(host));
  });

  it("closes when the pointer goes down outside it", () => {
    const host = mount(<CodeLangMenuView available={["python", "javascript"]} preferred="python" onPick={() => {}} />);
    act(() => trigger(host).click());
    expect(document.body.querySelector('[role="menu"]')).not.toBeNull();
    act(() => {
      document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    });
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
  });

  it("says when the preferred language is not on this surface", () => {
    const host = mount(
      <CodeLangMenuView available={["python", "javascript"]} preferred="typescript" onPick={() => {}} />,
    );
    press(trigger(host), "ArrowDown");
    const menu = must(document.body.querySelector('[role="menu"]'), "menu");
    const note = must(document.getElementById(menu.getAttribute("aria-describedby") ?? ""), "note");
    expect(note.textContent).toBe("TypeScript isn't available here — showing JavaScript.");
    expect(items().find((b) => b.getAttribute("aria-checked") === "true")?.textContent).toBe("JSJavaScript");
  });
});
```

- [ ] **Step 2: Run and see it fail.** `npx vitest run tests/codeLangMenu.test.tsx; echo "exit=$?"` → exit 1 (module missing).

- [ ] **Step 3: Create `src/components/code/CodeLangMenu.tsx`.**

```tsx
"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { CaretDown, Check } from "@phosphor-icons/react";
import { LanguageMark } from "@/components/kit/languageMarks";
import { useCodeLang } from "@/lib/codeLang";
import { CODE_LANG_LABEL, resolveCodeLang, type CodeLangId } from "@/lib/codeLanguages";
import { cn } from "@/lib/utils";

interface CodeLangMenuProps<T extends CodeLangId> {
  /** The languages this surface has, in menu order. */
  available: readonly T[];
  /**
   * Server-rendered surfaces label every language and let the generated CSS
   * show the resolved one, so the label is right at first paint. Client-only
   * surfaces label the store's resolution, matching the code they render.
   */
  cssLabels?: boolean;
  /** "code" sits on the --code-editor canvas; "paper" on the sandbox toolbar. */
  tone?: "code" | "paper";
}

/**
 * The code-language picker on a code surface: a menu button naming the
 * language shown, and a menu of the languages this surface has. Props-only so
 * it renders in tests without the store. The menu is portalled to <body> with
 * fixed positioning because every code surface clips its overflow.
 */
export function CodeLangMenuView<T extends CodeLangId>({
  available,
  preferred,
  onPick,
  cssLabels = false,
  tone = "code",
}: CodeLangMenuProps<T> & {
  preferred: CodeLangId;
  onPick: (id: T, trigger: HTMLElement) => void;
}) {
  const shown = resolveCodeLang(preferred, available);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const noteId = useId();
  const unavailable = preferred !== shown;

  const openMenu = () => {
    setActive(Math.max(0, available.indexOf(shown)));
    setOpen(true);
  };
  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };
  const pick = (id: T) => {
    close(true);
    if (triggerRef.current) onPick(id, triggerRef.current);
  };

  // Placed under the trigger, flipped above it or pulled inside the viewport
  // when there is no room. Written to the element, not state: it is measured
  // after the menu mounts, and nothing else renders from it.
  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!open || !trigger || !menu) return;
    const rect = trigger.getBoundingClientRect();
    const margin = 8;
    const gap = 4;
    const left = Math.max(margin, Math.min(rect.left, window.innerWidth - margin - menu.offsetWidth));
    const below = rect.bottom + gap;
    const top =
      below + menu.offsetHeight > window.innerHeight - margin
        ? Math.max(margin, rect.top - gap - menu.offsetHeight)
        : below;
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.visibility = "visible";
  }, [open]);

  useEffect(() => {
    if (open) itemRefs.current[active]?.focus({ preventScroll: true });
  }, [open, active]);

  // A fixed menu would drift from its trigger on scroll or resize, so it closes.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: Event) => {
      const target = event.target;
      if (target instanceof Node && (triggerRef.current?.contains(target) || menuRef.current?.contains(target))) {
        return;
      }
      setOpen(false);
    };
    const dismiss = () => setOpen(false);
    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [open]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu();
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = available.length - 1;
    switch (event.key) {
      case "ArrowDown":
        setActive((i) => (i === last ? 0 : i + 1));
        break;
      case "ArrowUp":
        setActive((i) => (i === 0 ? last : i - 1));
        break;
      case "Home":
        setActive(0);
        break;
      case "End":
        setActive(last);
        break;
      case "Enter":
      case " ":
        pick(available[active]);
        break;
      case "Escape":
      case "Tab":
        close(true);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  const label = (id: CodeLangId) => (
    <>
      <LanguageMark language={id} />
      {CODE_LANG_LABEL[id]}
    </>
  );

  return (
    <span className="inline-flex" data-code-lang-has={cssLabels ? available.join(" ") : undefined}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        data-tone={tone}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "code-lang-label -mx-1.5 min-h-7 rounded-[length:var(--radius-sm)] px-1.5 transition-colors",
          tone === "code" ? "hover:bg-[var(--editor-active-line)]" : "hover:bg-code",
        )}
      >
        <span className="sr-only">Code language: </span>
        {cssLabels ? (
          available.map((id) => (
            <span key={id} data-code-lang-panel={id} className="inline-flex items-center gap-1.5">
              {label(id)}
            </span>
          ))
        ) : (
          <span className="inline-flex items-center gap-1.5">{label(shown)}</span>
        )}
        <CaretDown aria-hidden weight="bold" className="h-3 w-3 opacity-70" />
      </button>
      {open
        ? createPortal(
            <div
              ref={menuRef}
              style={{ position: "fixed", top: 0, left: 0, visibility: "hidden" }}
              className="z-50 min-w-44 overflow-hidden rounded-[length:var(--radius-md)] border border-border bg-elevated py-1 font-sans shadow-elevation"
            >
              {unavailable ? (
                <p id={noteId} className="border-b border-border px-3 pt-1 pb-2 text-xs text-muted">
                  {CODE_LANG_LABEL[preferred]} isn&apos;t available here — showing {CODE_LANG_LABEL[shown]}.
                </p>
              ) : null}
              <div
                role="menu"
                id={menuId}
                aria-label="Code language"
                aria-describedby={unavailable ? noteId : undefined}
                onKeyDown={onMenuKeyDown}
              >
                {available.map((id, i) => {
                  const checked = id === shown;
                  return (
                    <button
                      key={id}
                      ref={(el) => {
                        itemRefs.current[i] = el;
                      }}
                      type="button"
                      role="menuitemradio"
                      aria-checked={checked}
                      tabIndex={-1}
                      onClick={() => pick(id)}
                      className={cn(
                        "flex min-h-11 w-full items-center gap-2 px-3 text-left text-sm transition-colors hover:bg-surface md:min-h-9",
                        checked ? "font-medium text-foreground" : "text-muted hover:text-foreground",
                      )}
                    >
                      <LanguageMark language={id} />
                      <span className="flex-1">{CODE_LANG_LABEL[id]}</span>
                      {checked ? <Check aria-hidden className="h-3.5 w-3.5" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}

/**
 * Keeps the picker the learner used where it was: every block on the page
 * switches at once and blocks above it change height.
 */
function keepInPlace(el: HTMLElement, before: number) {
  const delta = el.getBoundingClientRect().top - before;
  if (Math.abs(delta) < 1) return;
  for (let node = el.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) {
      node.scrollBy(0, delta);
      return;
    }
  }
  window.scrollBy(0, delta);
}

export function CodeLangMenu<T extends CodeLangId>(props: CodeLangMenuProps<T>) {
  const [preferred, setPreferred] = useCodeLang();
  return (
    <CodeLangMenuView
      {...props}
      preferred={preferred}
      onPick={(id, trigger) => {
        const before = trigger.getBoundingClientRect().top;
        setPreferred(id);
        requestAnimationFrame(() => keepInPlace(trigger, before));
      }}
    />
  );
}
```

- [ ] **Step 4: Add the paper tone to `src/app/globals.css`**, directly after the `.code-lang-label` rule:

```css
/*
  The sandbox toolbar's picker sits on the page's own paper (--elevated), not
  the inverted code canvas, so it takes the page's muted ink.
*/
.code-lang-label[data-tone="paper"] {
  color: var(--muted);
}

.code-lang-label[data-tone="paper"]:hover {
  color: var(--foreground);
}
```

- [ ] **Step 5: Verify.** `npx vitest run tests/codeLangMenu.test.tsx; echo "exit=$?"` → 0. `npx tsc --noEmit; echo "tsc=$?"` → 0. `npx eslint src/components/code tests/codeLangMenu.test.tsx; echo "eslint=$?"` → 0. If every test passed first time, break `pick` (drop the `onPick` call), see the keyboard test fail, restore.

- [ ] **Step 6: Commit.**

```bash
git add src/components/code/CodeLangMenu.tsx src/app/globals.css tests/codeLangMenu.test.tsx
git commit -m "feat(code-lang): a language picker menu for code surfaces

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Put the picker on every code surface

**Files:**
- Modify: `web/src/components/course/CodeTabs.tsx`, `web/src/components/viz/CodePanel.tsx`, `web/src/components/sandbox/Sandbox.tsx`
- Test: `web/tests/codeLangSurfaces.test.tsx`, `web/tests/codeTabs.test.tsx`

**Interfaces:** Consumes `CodeLangMenu` (Task 3). Produces nothing new.

- [ ] **Step 1: Update the tests.**

In `tests/codeLangSurfaces.test.tsx`, `describe("lesson code blocks")`, replace the test `"label each panel with its mark and name, hidden with it"` with:

```tsx
  it("pick the language from a menu in the header, labelled for first paint", () => {
    const header = html.slice(0, html.indexOf("<pre"));
    expect(header).toContain('aria-haspopup="menu"');
    expect(header).toContain('data-code-lang-has="python typescript"');
    expect(header).toMatch(/<span data-code-lang-panel="python" class="inline-flex items-center gap-1\.5">/);
    expect(header).toMatch(/<span data-code-lang-panel="typescript" class="inline-flex items-center gap-1\.5">/);
  });
```

In `describe("viz code panels")` replace `expect(panel).toContain('className="code-lang-label"');` with `expect(panel).toContain("<CodeLangMenu available={VIZ_LANGS} />");`.

In `describe("sandbox")` add to the first test: `expect(sandbox).toContain('<CodeLangMenu available={LANGS} cssLabels tone="paper" />');`.

In `tests/codeTabs.test.tsx`, replace the test `"viz code panels and the sandbox editor render the same marks"` with:

```tsx
  it("lesson blocks, viz code panels and the sandbox all pick through the one menu", () => {
    for (const rel of [
      ["components", "course", "CodeTabs.tsx"],
      ["components", "viz", "CodePanel.tsx"],
      ["components", "sandbox", "Sandbox.tsx"],
    ]) {
      expect(read(...rel), rel.join("/")).toContain('from "@/components/code/CodeLangMenu"');
    }
    const menu = read("components", "code", "CodeLangMenu.tsx");
    expect(menu).toContain('from "@/components/kit/languageMarks"');
    expect(menu).toMatch(/<LanguageMark language=\{/);
  });
```

- [ ] **Step 2: Run and see them fail.** `npx vitest run tests/codeLangSurfaces.test.tsx tests/codeTabs.test.tsx; echo "exit=$?"` → exit 1.

- [ ] **Step 3: Implement.**

`CodeTabs.tsx`: replace `import { LanguageMark } from "@/components/kit/languageMarks";` with `import { CodeLangMenu } from "@/components/code/CodeLangMenu";`, and replace the header's `<span className="inline-flex items-center">…</span>` (the label spans) with `<CodeLangMenu available={available} cssLabels />`.

`CodePanel.tsx`: replace the `LanguageMark` import with `import { CodeLangMenu } from "@/components/code/CodeLangMenu";`, delete the `LABEL` record, and replace

```tsx
        <span className="code-lang-label">
          <LanguageMark language={lang} />
          {LABEL[lang]}
        </span>
```

with `<CodeLangMenu available={VIZ_LANGS} />`. Replace the component comment line `// The language is chosen once in the header, not per panel.` with `// One preference for every surface, picked from any of their menus.`.

`Sandbox.tsx`: replace the `LanguageMark` import with `import { CodeLangMenu } from "@/components/code/CodeLangMenu";`, and replace the comment + label

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
```

with

```tsx
      {/*
        Names the language the editor holds and picks it. Labelled for first
        paint (the editor itself mounts on the client), on the toolbar's own
        paper rather than the code canvas.
      */}
      <CodeLangMenu available={LANGS} cssLabels tone="paper" />
```

Replace the comment `// The header's global switch picks the language (lib/codeLang.ts).` with `// One preference for every surface, picked from any of their menus.`. If `LanguageMark` is still referenced elsewhere in `Sandbox.tsx`, keep its import instead.

- [ ] **Step 4: Verify.** `npx vitest run tests/codeLangSurfaces.test.tsx tests/codeTabs.test.tsx tests/codeLangMenu.test.tsx tests/codeLang.test.ts tests/landingFeatures.test.tsx; echo "exit=$?"` → 0. `npx tsc --noEmit; echo "tsc=$?"` → 0. `npm run lint; echo "lint=$?"` → 0 errors.

- [ ] **Step 5: Commit.**

```bash
git add src/components/course/CodeTabs.tsx src/components/viz/CodePanel.tsx src/components/sandbox/Sandbox.tsx tests/codeLangSurfaces.test.tsx tests/codeTabs.test.tsx
git commit -m "feat(code-lang): pick the language on lesson blocks, viz panels and the sandbox

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Doctrine, full gate, browser proof, hand-off to the running app

**Files:**
- Modify: `CLAUDE.md` (replace the "Code language is one global choice" bullet)

- [ ] **Step 1: Replace the doctrine bullet** in the worktree's `CLAUDE.md` (the bullet beginning `- **Code language is one global choice.**`) with:

```markdown
- **Code language is one preference, picked where the code is** (owner,
  2026-09-17; spec `docs/superpowers/specs/2026-09-14-global-code-language-switch-design.md`).
  Every code surface — lesson code blocks (`CodeTabs`), viz code panels
  (`CodePanel`) and the sandbox toolbar — carries `CodeLangMenu`, a menu button
  naming the language shown; picking on any surface changes all of them, in
  every tab. There is no language control in the app or landing header (it was
  withdrawn: far from its effect, present on pages with no code, read as
  navigation, and a two-sided pill cannot hold a third language). The
  preference is a real language id from the hook-free registry
  `lib/codeLanguages.ts` (`python`, `javascript`, `typescript`); a surface that
  lacks it shows the nearest it has (`javascript` ↔ `typescript`, then registry
  order), its label names what is shown, and the menu says the preference is not
  available there. `lib/codeLang.ts` is the store. A plain inline script after
  the lamp's boot script sets `<html data-code-lang>` while the page parses —
  never `next/script` `beforeInteractive`, which runs after first paint — and an
  inline `<style id="code-lang-rules">` generated from the registry resolves
  server-rendered blocks (`data-code-lang-has` / `data-code-lang-panel`) before
  paint, so pages stay static and never flash. The layout imports only hook-free
  modules: reaching `useSyncExternalStore` from it 500'd every route, and
  neither `tsc` nor vitest can see that boundary. The menu is portalled to
  `<body>` because code surfaces clip overflow, and it keeps the picked block in
  place while blocks above it change height. Adding a language means a registry
  entry plus its content, runner and reference solutions (§2) — never list one
  first. Every `tabs` fence carries exactly `python` and `typescript` (content
  test). Guarded in `codeLang.test.ts`, `codeLangMenu.test.tsx` and
  `codeLangSurfaces.test.tsx`.
```

- [ ] **Step 2: Full gate.** From `web/`: `npx tsc --noEmit; echo "tsc=$?"`, `npm run lint; echo "lint=$?"`, `npx vitest run > /tmp/claude-501/gate.txt 2>&1; echo "vitest=$?"`, `npm run build > /tmp/claude-501/build.txt 2>&1; echo "build=$?"`. Expected: all 0; `/courses/dsa/[module]/[lesson]` and `/courses/dsa/problems/[slug]` listed as ● (SSG).

- [ ] **Step 3: Browser proof** (Playwright `browser_run_code_unsafe` against a worktree dev server on 3005: add a temporary `web-dev-codelang` entry to `/Users/tharunk/leetExpert/.claude/launch.json` with `runtimeArgs ["--prefix", "/Users/tharunk/leetExpert/.worktrees/code-lang-switch/web", "run", "dev", "--", "--port", "3005"]`, start it with `preview_start`). Check, recording results:
  1. `/courses/dsa/linked-lists/build-a-linked-list`, `/courses/dsa/problems/valid-anagram`, `/` at 1280px and 375px: each code surface has one `button[aria-haspopup="menu"]`; no header contains `radiogroup` or a `Code language` control.
  2. Open a lesson block's menu: the menu's bounding box is fully inside the viewport and is not clipped (`document.elementFromPoint` at its centre is inside the menu).
  3. Pick TypeScript in the second tabs block of a lesson: every block shows TypeScript, the picked trigger's viewport `top` moved by < 2px, and the problem page sandbox then shows "JavaScript" with the note "TypeScript isn't available here — showing JavaScript." in its menu.
  4. Keyboard only: focus a trigger, ArrowDown, ArrowDown, Enter → language changes, focus back on the trigger with a visible outline.
  5. No flash: new context with `localStorage["dsa-code-lang"]="typescript"` via `addInitScript`, all `/_next/static/**/*.js` aborted; every visible `data-code-lang-panel` is `typescript`, including trigger labels.
  6. A second page in the same context follows a pick made in the first.
  7. Screenshots of a lesson block menu open in light and dark; read them.

- [ ] **Step 4: Clean up.** `preview_stop` the server; remove the `web-dev-codelang` entry from `/Users/tharunk/leetExpert/.claude/launch.json`.

- [ ] **Step 5: Commit.**

```bash
git add CLAUDE.md
git commit -m "docs(code-lang): record the per-surface picker doctrine

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Step 6: Refresh the running app on 3002.** The main checkout carries the first switch as uncommitted edits. In `/Users/tharunk/leetExpert`:
  1. `git diff main...<old-code-lang-tip> -- web` saved earlier is at the scratchpad `codelang.patch`; reverse it with `git apply -R --exclude=CLAUDE.md <scratchpad>/codelang.patch` (check with `--check` first; stop and report if it does not apply cleanly — other sessions' edits must not be touched).
  2. Apply the branch's new code: `git diff main...feat/code-lang-switch -- web > <scratchpad>/codelang-v2.patch`, `git apply --check`, `git apply`.
  3. Curl `http://localhost:3002/courses/dsa/linked-lists/build-a-linked-list` and confirm `aria-haspopup="menu"` and `code-lang-rules` are present and `radiogroup` is not.
