# Lesson Code-Block Syntax Highlighting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real syntax coloring (Shiki) to fenced code blocks in lesson markdown, including inside `` ```tabs `` and nested inside `` ```reveal `` blocks, with a small language-label + copy-button header — with zero added client-side JS cost.

**Architecture:** Highlight every real code fence once at build time inside `loadLesson`, by parsing the lesson's markdown into an mdast AST (`remark-parse` + `remark-gfm`, matching the render-time parser) and walking every `code` node with `unist-util-visit`, recursing into `reveal` bodies since those are themselves nested markdown documents. Results are stored in two flat maps keyed by content — `` `${lang} ${code}` `` → HTML for plain fences, raw tabs-fence text → per-tab HTML array — so lookups survive `Markdown.tsx`'s existing recursive re-render of `reveal` content. `Markdown.tsx` and `CodeTabs.tsx` render pre-computed HTML through a new shared `CodeBlock` component instead of parsing/highlighting anything themselves.

**Tech Stack:** Next.js 16 / React 19 (existing), Shiki (new), `remark-parse` + `unist-util-visit` + `unified` (new, promoted from transitive to direct deps), Tailwind v4 (existing).

## Global Constraints

- `web/` only — no changes outside the `web/` app.
- No test suite exists in `web/`; verification is `npx tsc --noEmit`, `npm run lint`, and manual dev-server checks per task (per spec's Testing section).
- Zero highlighting-related JS shipped to the client — all Shiki/AST work is server-only, run inside `loadLesson` at build time.
- Code block chrome is limited to a language label + copy button — no line numbers, no collapse/expand, no theme toggle (explicitly scoped out).
- Supported languages: `typescript`, `tsx`, `javascript`, `jsx`, `python`, `json`, `bash`. Anything else (including `text`) renders unhighlighted but still gets the header/copy chrome.
- Themes: `github-light` (light mode) / `github-dark` (dark mode), switched via the site's existing `.dark` class (next-themes, `attribute="class"`) — no client-side re-highlight on theme toggle.
- Per-block highlight failures (unsupported language, Shiki throwing) must degrade to plain text for that one block, never fail the build.

---

## Reference: existing files this plan touches

- `web/src/lib/course/load.ts` — `loadLesson()` (currently sync), `LoadedLesson` interface.
- `web/src/app/course/[module]/[lesson]/page.tsx:33` — `const lesson = loadLesson(moduleSlug, lessonSlug);` (only call site).
- `web/src/components/md/Markdown.tsx` — module-scope `components` object with a `pre` handler; `Markdown({ source })`.
- `web/src/components/course/CodeTabs.tsx` — `CodeTabs({ source })`, has its own `parseTabs`/`LABELS`.
- `web/src/components/course/LessonView.tsx:52` — `<Markdown source={lesson.markdown} />`.
- `web/src/components/md/Callout.tsx` — reference copy-to-clipboard pattern.
- `web/src/app/globals.css` — theme tokens (`--code: #f4f4f5` light / `#171717` dark, toggled via `.dark` class).

---

### Task 1: Add Shiki + remark AST dependencies

**Files:**
- Modify: `web/package.json`
- Modify: `web/package-lock.json` (via `npm install`)

**Interfaces:**
- Produces: `shiki` (`createHighlighter`, `codeToHtml` types), `unified`, `remark-parse` (default export `remarkParse`), `unist-util-visit` (`visit`) importable from `web/src/**`.

- [ ] **Step 1: Install the packages**

Run from `web/`:
```bash
npm install shiki remark-parse unist-util-visit unified
```

- [ ] **Step 2: Verify they resolve**

Run: `cd web && npx tsc --noEmit`
Expected: no new errors (project currently type-checks clean; this just confirms the install didn't break anything — the packages aren't imported yet).

- [ ] **Step 3: Commit**

```bash
git add web/package.json web/package-lock.json
git commit -m "Add shiki and remark AST deps for lesson syntax highlighting"
```

---

### Task 2: Shiki highlighter wrapper

**Files:**
- Create: `web/src/lib/content/highlight.ts`

**Interfaces:**
- Consumes: `shiki`'s `createHighlighter`.
- Produces: `highlightCode(code: string, lang: string): Promise<string | null>` — used by Task 3.

- [ ] **Step 1: Write the module**

```typescript
import { createHighlighter, type Highlighter } from "shiki";

const SUPPORTED_LANGS = [
  "typescript",
  "tsx",
  "javascript",
  "jsx",
  "python",
  "json",
  "bash",
] as const;

const LIGHT_THEME = "github-light";
const DARK_THEME = "github-dark";

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [LIGHT_THEME, DARK_THEME],
      langs: [...SUPPORTED_LANGS],
    });
  }
  return highlighterPromise;
}

/**
 * Highlights `code` as `lang` using both the light and dark Shiki themes in
 * one pass (via CSS variables). Returns `null` for unsupported languages or
 * if Shiki fails to tokenize the code — callers must fall back to plain
 * text in that case, never throw.
 */
export async function highlightCode(
  code: string,
  lang: string,
): Promise<string | null> {
  if (!(SUPPORTED_LANGS as readonly string[]).includes(lang)) {
    return null;
  }
  try {
    const highlighter = await getHighlighter();
    return highlighter.codeToHtml(code, {
      lang,
      themes: { light: LIGHT_THEME, dark: DARK_THEME },
      defaultColor: false,
    });
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `cd web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Smoke-test it actually highlights**

`shiki` is ESM-only (`"type": "module"`, no CJS entry), so use a dynamic
`import()` from a plain `node -e` script (works regardless of the script's
own module type):

```bash
cd web && node -e "
import('shiki').then(({ createHighlighter }) =>
  createHighlighter({ themes: ['github-light','github-dark'], langs: ['python'] })
).then(h => {
  const html = h.codeToHtml('def f(x):\n    return x + 1', { lang: 'python', themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false });
  console.log(html.includes('shiki') && html.includes('--shiki-light') ? 'OK' : 'FAIL: ' + html.slice(0, 200));
});
"
```
Expected: prints `OK`.

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/content/highlight.ts
git commit -m "Add Shiki highlighter wrapper for lesson code blocks"
```

---

### Task 3: AST walker — `highlightBlocks`

**Files:**
- Create: `web/src/lib/content/highlightBlocks.ts`

**Interfaces:**
- Consumes: `highlightCode(code: string, lang: string): Promise<string | null>` (Task 2).
- Produces:
  - `interface TabBlock { label: string; language: string; code: string; html: string | null }`
  - `interface HighlightedBlocks { blocks: Record<string, string | null>; tabs: Record<string, TabBlock[]> }`
  - `highlightBlocks(markdown: string): Promise<HighlightedBlocks>` — used by Task 4 (`loadLesson`).
  - `codeHighlightKey(lang: string, code: string): string` — used by Task 6 (`Markdown.tsx`'s `pre` handler needs to compute the same key to look up `blocks`).

- [ ] **Step 1: Write the module**

```typescript
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import type { Root, Code } from "mdast";
import { highlightCode } from "./highlight";

export interface TabBlock {
  label: string;
  language: string;
  code: string;
  html: string | null;
}

export interface HighlightedBlocks {
  blocks: Record<string, string | null>;
  tabs: Record<string, TabBlock[]>;
}

const TAB_LABELS: Record<string, string> = {
  python: "Python",
  typescript: "TypeScript",
  javascript: "JavaScript",
  java: "Java",
  cpp: "C++",
};

const NON_CODE_LANGS = new Set(["mermaid", "quiz", "complexity"]);

/** Must match the key format `Markdown.tsx`'s `pre` handler computes at render time. */
export function codeHighlightKey(lang: string, code: string): string {
  return `${lang} ${code}`;
}

async function highlightTabs(source: string): Promise<TabBlock[]> {
  const tabs: TabBlock[] = [];
  const fence = /```(\w+)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = fence.exec(source)) !== null) {
    const language = match[1];
    const code = match[2].replace(/\n$/, "");
    tabs.push({
      language,
      label: TAB_LABELS[language] ?? language,
      code,
      html: await highlightCode(code, language),
    });
  }
  return tabs;
}

/**
 * Walks `markdown` for fenced code blocks and pre-highlights every real
 * code fence (and every fence nested inside `tabs`/`reveal` blocks, at any
 * depth) using Shiki. Returns flat, content-keyed maps so lookups survive
 * `Markdown.tsx` re-parsing a `reveal` block's raw body as its own markdown
 * document at render time.
 */
export async function highlightBlocks(
  markdown: string,
): Promise<HighlightedBlocks> {
  const blocks: Record<string, string | null> = {};
  const tabs: Record<string, TabBlock[]> = {};

  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const codeNodes: { lang: string; value: string }[] = [];
  visit(tree, "code", (node: Code) => {
    if (node.lang) {
      codeNodes.push({ lang: node.lang, value: node.value });
    }
  });

  for (const { lang, value } of codeNodes) {
    if (lang === "tabs") {
      if (!(value in tabs)) {
        tabs[value] = await highlightTabs(value);
      }
    } else if (lang === "reveal") {
      const nested = await highlightBlocks(value);
      Object.assign(blocks, nested.blocks);
      Object.assign(tabs, nested.tabs);
    } else if (!NON_CODE_LANGS.has(lang)) {
      const key = codeHighlightKey(lang, value);
      if (!(key in blocks)) {
        blocks[key] = await highlightCode(value, lang);
      }
    }
  }

  return { blocks, tabs };
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `cd web && npx tsc --noEmit`
Expected: no errors.

There's no `ts-node`/`tsx` in this project to run a `.ts` file standalone,
so this module's functional behavior (not just types) is verified once it's
wired into `loadLesson` in Task 4, Step 3 — that runs it through Next's own
TS pipeline against every real lesson file, including the `reveal`/`tabs`
nesting cases this module exists to handle.

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/content/highlightBlocks.ts
git commit -m "Add AST-based highlightBlocks walker, recursing into reveal blocks"
```

---

### Task 4: Wire highlighting into `loadLesson`

**Files:**
- Modify: `web/src/lib/course/load.ts`
- Modify: `web/src/app/course/[module]/[lesson]/page.tsx:33`

**Interfaces:**
- Consumes: `highlightBlocks(markdown: string): Promise<HighlightedBlocks>` (Task 3).
- Produces: `LoadedLesson` gains `highlightedBlocks: Record<string, string | null>` and `highlightedTabs: Record<string, TabBlock[]>`; `loadLesson` becomes `async`, returning `Promise<LoadedLesson | null>` — used by Task 8 (`LessonView`).

- [ ] **Step 1: Update `LoadedLesson` and `loadLesson`**

In `web/src/lib/course/load.ts`, add the import and extend the interface/function:

```typescript
import { highlightBlocks, type TabBlock } from "@/lib/content/highlightBlocks";
```

Change:
```typescript
export interface LoadedLesson {
  moduleSlug: string;
  lessonSlug: string;
  title: string;
  markdown: string;
  toc: TocItem[];
  readingMinutes: number;
  sourcePath: string;
}
```
to:
```typescript
export interface LoadedLesson {
  moduleSlug: string;
  lessonSlug: string;
  title: string;
  markdown: string;
  toc: TocItem[];
  readingMinutes: number;
  sourcePath: string;
  highlightedBlocks: Record<string, string | null>;
  highlightedTabs: Record<string, TabBlock[]>;
}
```

Change:
```typescript
export function loadLesson(
  moduleSlug: string,
  lessonSlug: string,
): LoadedLesson | null {
  const hit = getLesson(moduleSlug, lessonSlug);
  if (!hit) return null;

  const relative = path.join("course", moduleSlug, `${lessonSlug}.md`);
  const full = path.join(courseRoot, relative);
  if (!fs.existsSync(full)) {
    throw new Error(`Lesson file not found: ${relative}`);
  }

  const raw = fs
    .readFileSync(full, "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const { content, data } = matter(raw);

  return {
    moduleSlug,
    lessonSlug,
    title: (data.title as string) ?? hit.lesson.title,
    markdown: content.trim(),
    toc: extractToc(content),
    readingMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
    sourcePath: relative,
  };
}
```
to:
```typescript
export async function loadLesson(
  moduleSlug: string,
  lessonSlug: string,
): Promise<LoadedLesson | null> {
  const hit = getLesson(moduleSlug, lessonSlug);
  if (!hit) return null;

  const relative = path.join("course", moduleSlug, `${lessonSlug}.md`);
  const full = path.join(courseRoot, relative);
  if (!fs.existsSync(full)) {
    throw new Error(`Lesson file not found: ${relative}`);
  }

  const raw = fs
    .readFileSync(full, "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const { content, data } = matter(raw);
  const trimmed = content.trim();
  const { blocks, tabs } = await highlightBlocks(trimmed);

  return {
    moduleSlug,
    lessonSlug,
    title: (data.title as string) ?? hit.lesson.title,
    markdown: trimmed,
    toc: extractToc(content),
    readingMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
    sourcePath: relative,
    highlightedBlocks: blocks,
    highlightedTabs: tabs,
  };
}
```

- [ ] **Step 2: Update the call site**

In `web/src/app/course/[module]/[lesson]/page.tsx:33`, change:
```typescript
  const lesson = loadLesson(moduleSlug, lessonSlug);
```
to:
```typescript
  const lesson = await loadLesson(moduleSlug, lessonSlug);
```

- [ ] **Step 3: Verify it type-checks and actually highlights a real lesson**

Run: `cd web && npx tsc --noEmit`
Expected: errors only in `LessonView.tsx`/`CodeTabs.tsx`/`Markdown.tsx` (not yet updated to accept the new fields — that's Tasks 5-8; `LoadedLesson` gained required fields nothing yet reads, which is not itself a type error). If `tsc` reports unrelated errors, stop and investigate before continuing.

Then run: `cd web && npm run build 2>&1 | tail -60`
Expected: the build itself may still succeed (unused new fields aren't a build error) — confirms `loadLesson` runs without throwing across every lesson file during static generation. If it throws, note which lesson file and fix `highlightBlocks`/`highlightCode` before proceeding — this is the first point real content exercises the new code path.

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/course/load.ts web/src/app/course/\[module\]/\[lesson\]/page.tsx
git commit -m "Highlight lesson code fences during loadLesson"
```

---

### Task 5: Shared `CodeBlock` component + dual-theme CSS

**Files:**
- Create: `web/src/components/md/CodeBlock.tsx`
- Modify: `web/src/app/globals.css`

**Interfaces:**
- Produces: `CodeBlock({ language, code, html }: { language: string; code: string; html: string | null })` — used by Task 6 (`Markdown.tsx`) and Task 7 (`CodeTabs.tsx`).

- [ ] **Step 1: Write `CodeBlock.tsx`**

```typescript
"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({
  language,
  code,
  html,
}: {
  language: string;
  code: string;
  html: string | null;
}) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="group my-5 overflow-hidden rounded-lg border border-border bg-code">
      <div className="flex items-center justify-between border-b border-border px-4 py-1.5">
        <span className="font-mono text-xs text-muted">{language}</span>
        <button
          type="button"
          onClick={copyCode}
          className="rounded-md p-1 text-muted opacity-0 transition group-hover:opacity-100 hover:text-foreground"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      {html ? (
        <div
          className="overflow-x-auto px-4 py-3 text-[0.85rem] leading-relaxed [&_code]:font-mono [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-0"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto px-4 py-3 font-mono text-[0.85rem] leading-relaxed">
          {code}
        </pre>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add the Shiki dual-theme CSS rule**

In `web/src/app/globals.css`, add after the `.handbook-prose .mermaid-diagram svg` rule (around line 134):

```css
.handbook-prose .shiki,
.handbook-prose .shiki span {
  color: var(--shiki-light);
}

.dark .handbook-prose .shiki,
.dark .handbook-prose .shiki span {
  color: var(--shiki-dark);
}

.handbook-prose .shiki {
  background-color: transparent !important;
}
```

- [ ] **Step 3: Verify it type-checks**

Run: `cd web && npx tsc --noEmit`
Expected: no new errors from `CodeBlock.tsx` (still unused until Tasks 6-7 wire it in).

- [ ] **Step 4: Commit**

```bash
git add web/src/components/md/CodeBlock.tsx web/src/app/globals.css
git commit -m "Add shared CodeBlock component and Shiki dual-theme CSS"
```

---

### Task 6: Wire `CodeBlock` into `Markdown.tsx`

**Files:**
- Modify: `web/src/components/md/Markdown.tsx`

**Interfaces:**
- Consumes: `CodeBlock` (Task 5), `codeHighlightKey(lang, code): string` and `TabBlock` (Task 3).
- Produces: `Markdown({ source, highlightedBlocks, highlightedTabs }: { source: string; highlightedBlocks: Record<string, string | null>; highlightedTabs: Record<string, TabBlock[]> })` — used by Task 8 (`LessonView`).

- [ ] **Step 1: Update imports and move `components` inside the function**

Replace the top of the file (imports) with:
```typescript
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { Components } from "react-markdown";
import { Mermaid } from "@/components/md/Mermaid";
import { Callout } from "@/components/md/Callout";
import { CodeBlock } from "@/components/md/CodeBlock";
import { Quiz } from "@/components/course/Quiz";
import { CodeTabs } from "@/components/course/CodeTabs";
import { Reveal } from "@/components/course/Reveal";
import { Complexity } from "@/components/course/Complexity";
import { codeHighlightKey, type TabBlock } from "@/lib/content/highlightBlocks";
import type { ReactNode } from "react";
```

Keep `flattenText` and `detectCalloutType` exactly as they are (unchanged, module-scope is fine — they don't need per-render data).

- [ ] **Step 2: Move `pre`'s language-fence branch into a per-render `components` object**

Delete the module-scope `const components: Components = { ... };` block entirely (everything between `detectCalloutType`'s closing brace and `export function Markdown`), and replace `export function Markdown({ source }: { source: string })` with:

```typescript
export function Markdown({
  source,
  highlightedBlocks,
  highlightedTabs,
}: {
  source: string;
  highlightedBlocks: Record<string, string | null>;
  highlightedTabs: Record<string, TabBlock[]>;
}) {
  const components: Components = {
    pre({ children }) {
      const child = Array.isArray(children) ? children[0] : children;
      if (child && typeof child === "object" && "props" in child) {
        const codeEl = child as {
          props: {
            className?: string;
            children?: ReactNode;
            node?: { data?: { meta?: string } };
          };
        };
        const className = codeEl.props.className ?? "";
        const text = () => flattenText(codeEl.props.children);
        if (className.includes("language-mermaid")) {
          return <Mermaid chart={text()} />;
        }
        if (className.includes("language-quiz")) {
          return <Quiz source={text()} />;
        }
        if (className.includes("language-tabs")) {
          return <CodeTabs tabs={highlightedTabs[text()] ?? []} />;
        }
        if (className.includes("language-complexity")) {
          return <Complexity source={text()} />;
        }
        if (className.includes("language-reveal")) {
          const label = codeEl.props.node?.data?.meta?.trim() || "Reveal";
          return (
            <Reveal label={label}>
              <Markdown
                source={text()}
                highlightedBlocks={highlightedBlocks}
                highlightedTabs={highlightedTabs}
              />
            </Reveal>
          );
        }
        const langMatch = /language-(\S+)/.exec(className);
        if (langMatch) {
          const language = langMatch[1];
          const code = text();
          const html = highlightedBlocks[codeHighlightKey(language, code)] ?? null;
          return <CodeBlock language={language} code={code} html={html} />;
        }
      }
      return (
        <pre className="overflow-x-auto rounded-lg border border-border bg-code px-4 py-3 font-mono text-[0.85rem] leading-relaxed">
          {children}
        </pre>
      );
    },
    blockquote({ children }) {
      const { type } = detectCalloutType(children);
      return <Callout type={type}>{children}</Callout>;
    },
    a({ href, children }) {
      return (
        <a
          href={href}
          className="font-medium text-accent underline decoration-accent/30 underline-offset-2 transition hover:decoration-accent"
          {...(href?.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    },
    table({ children }) {
      return (
        <div className="my-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[28rem] border-collapse text-sm">
            {children}
          </table>
        </div>
      );
    },
    th({ children }) {
      return (
        <th className="border-b border-border bg-surface px-3 py-2 text-left font-medium">
          {children}
        </th>
      );
    },
    td({ children }) {
      return (
        <td className="border-b border-border/60 px-3 py-2 align-top">{children}</td>
      );
    },
    code({ className, children }) {
      if (className) {
        return <code className={className}>{children}</code>;
      }
      return (
        <code className="rounded-md border border-border bg-surface px-1.5 py-0.5 font-mono text-[0.85em]">
          {children}
        </code>
      );
    },
  };

  return (
    <div className="handbook-prose prose-headings:scroll-mt-24">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: { className: ["anchor-link"] },
            },
          ],
        ]}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 3: Verify it type-checks**

Run: `cd web && npx tsc --noEmit`
Expected: errors remaining only in `LessonView.tsx` (not yet updated — Task 8) and `CodeTabs.tsx` (still takes `source`, not `tabs` — Task 7). No errors inside `Markdown.tsx` itself.

- [ ] **Step 4: Commit**

```bash
git add web/src/components/md/Markdown.tsx
git commit -m "Render highlighted code through CodeBlock in Markdown.tsx"
```

---

### Task 7: Update `CodeTabs` to take pre-highlighted tabs

**Files:**
- Modify: `web/src/components/course/CodeTabs.tsx`

**Interfaces:**
- Consumes: `TabBlock` (Task 3), `CodeBlock` (Task 5).
- Produces: `CodeTabs({ tabs }: { tabs: TabBlock[] })` — used by Task 6's `Markdown.tsx` (already wired in Step 2 above).

- [ ] **Step 1: Rewrite the component**

Replace the full contents of `web/src/components/course/CodeTabs.tsx`:

```typescript
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/md/CodeBlock";
import type { TabBlock } from "@/lib/content/highlightBlocks";

export function CodeTabs({ tabs }: { tabs: TabBlock[] }) {
  const [active, setActive] = useState(0);

  if (tabs.length === 0) {
    return null;
  }

  const current = tabs[Math.min(active, tabs.length - 1)];

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border">
      <div className="flex items-center gap-1 border-b border-border bg-surface px-2 py-1.5">
        {tabs.map((tab, i) => (
          <button
            key={tab.language}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition",
              i === active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <CodeBlock
        language={current.language}
        code={current.code}
        html={current.html}
      />
    </div>
  );
}
```

Note: `CodeBlock` already renders its own header (language label + copy button), which is now redundant with the tab-label row above it for the language name specifically — that's fine, the tab row is the tab *switcher* (interactive) and `CodeBlock`'s header is the *copy* affordance; both stay, matching the "Add a light header" scope decided during design (language label repetition here is harmless, not visually cluttered since the tab bar and the `CodeBlock` header serve different purposes).

- [ ] **Step 2: Verify it type-checks**

Run: `cd web && npx tsc --noEmit`
Expected: errors remaining only in `LessonView.tsx` (Task 8). `CodeTabs.tsx` and `Markdown.tsx` should now be error-free together.

- [ ] **Step 3: Commit**

```bash
git add web/src/components/course/CodeTabs.tsx
git commit -m "CodeTabs renders pre-highlighted tabs via CodeBlock"
```

---

### Task 8: Thread highlighted maps through `LessonView`

**Files:**
- Modify: `web/src/components/course/LessonView.tsx:52`

**Interfaces:**
- Consumes: `LoadedLesson.highlightedBlocks` / `.highlightedTabs` (Task 4), `Markdown`'s new prop shape (Task 6).

- [ ] **Step 1: Update the `Markdown` call**

In `web/src/components/course/LessonView.tsx:52`, change:
```typescript
          <Markdown source={lesson.markdown} />
```
to:
```typescript
          <Markdown
            source={lesson.markdown}
            highlightedBlocks={lesson.highlightedBlocks}
            highlightedTabs={lesson.highlightedTabs}
          />
```

- [ ] **Step 2: Verify the whole project type-checks clean**

Run: `cd web && npx tsc --noEmit`
Expected: no errors anywhere.

Run: `cd web && npm run lint`
Expected: no errors (warnings pre-existing elsewhere are fine; nothing new from these files).

- [ ] **Step 3: Commit**

```bash
git add web/src/components/course/LessonView.tsx
git commit -m "Pass highlighted code maps from LessonView into Markdown"
```

---

### Task 9: End-to-end manual verification

**Files:** none (verification only).

- [ ] **Step 1: Build the whole site**

Run: `cd web && npm run build 2>&1 | tail -80`
Expected: build succeeds with no errors (this exercises `loadLesson`/`highlightBlocks` against every lesson file in `course/`, including every `reveal`/`tabs` block found earlier — `course/strings/reverse-words.md`, `course/hash-tables/two-sum.md`, etc.).

- [ ] **Step 2: Start the dev server and check a plain code fence**

Run: `cd web && npm run dev` (in background/separate terminal), then open a lesson with a real `python` fence, e.g. `http://localhost:3000/course/hash-tables/two-sum`.
Expected: code renders with syntax colors, a header showing `python` and a copy button that appears on hover; clicking copy and pasting elsewhere yields the exact code text.

- [ ] **Step 3: Check a `tabs` block**

Open a lesson with a `` ```tabs `` block, e.g. `http://localhost:3000/course/math-for-dsa/math-drills`.
Expected: each tab is independently highlighted; switching tabs shows the correct language's highlighted code; copy button copies the active tab's code only.

- [ ] **Step 4: Check code nested inside `reveal`**

Open `http://localhost:3000/course/strings/reverse-words`, expand a "Solution" reveal.
Expected: the nested `tabs`/code fences inside the reveal are highlighted exactly like top-level ones (this is the case Task 3/6 specifically exist to handle).

- [ ] **Step 5: Toggle light/dark mode**

Use the site's theme toggle while viewing a highlighted code block.
Expected: colors switch instantly (no flash/re-highlight, no network request) between the light and dark Shiki themes.

- [ ] **Step 6: Confirm the unsupported-language fallback**

Temporarily add a scratch fence with a bogus language to any lesson file, e.g. append to `course/hash-tables/two-sum.md`:
````
```typescrpt
const x = 1;
```
````
Reload that lesson page.
Expected: renders as a `CodeBlock` with the `typescrpt` label, plain (unhighlighted) text body, and a working copy button — no error, no crash. Then revert the scratch edit (`git checkout -- course/hash-tables/two-sum.md`) — do not commit it.

- [ ] **Step 7: Report results**

Summarize pass/fail for Steps 1-6. If anything fails, stop and fix before considering this plan complete — no commit for this task (verification only, nothing to commit).
