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
