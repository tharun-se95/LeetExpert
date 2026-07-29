import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Root, Code } from "mdast";

/**
 * The three pieces a problem lesson's markdown splits into around its
 * sandbox fence. Kept as three strings, not one rejoined `bodyMarkdown`:
 * the split-pane layout needs `beforeSandbox`/`afterSandbox` on either
 * side of a separately-rendered `<Sandbox>`, and the narrow-screen layout
 * needs to put the editor back in its original textual position rather
 * than always first or last.
 */
export interface SandboxExtraction {
  beforeSandbox: string;
  sandboxSource: string;
  afterSandbox: string;
}

/**
 * Finds the lesson's sandbox fence via a real parse (the same
 * unified/remark-parse/remark-gfm stack `highlightBlocks.ts` already uses)
 * and slices the original markdown at the fence node's exact source
 * offsets. Not a regex/indexOf scan: a hand-rolled fence matcher would
 * have to reimplement CommonMark's fence-length rule (a fence closes only
 * on a fence of at least the same backtick count) to be correct.
 *
 * Scans `tree.children` — the root's direct children only. A `reveal`/
 * `aside`/`tabs` fence's body is stored as an opaque string on a leaf
 * node, never as nested AST children, so this can never reach inside one;
 * there is no recursion flag to get wrong. `content.test.ts`'s "sandbox
 * fence is safe to extract" suite is what guarantees every lesson only
 * ever has a fence this function can actually find.
 */
export function extractSandboxFence(markdown: string): SandboxExtraction | null {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const node = tree.children.find(
    (child): child is Code => child.type === "code" && child.lang === "sandbox",
  );
  if (!node?.position) return null;

  const { start, end } = node.position;
  return {
    beforeSandbox: markdown.slice(0, start.offset),
    sandboxSource: node.value,
    afterSandbox: markdown.slice(end.offset),
  };
}
