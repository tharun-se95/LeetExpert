import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Root, Code } from "mdast";
import type { CoachHint } from "./types";

const HINT_LABEL = /^Hint\b/i;

/**
 * Hint reveals from an Explanation slice — not Solution / Alternative /
 * Follow-up, even if those fences sit above `## Solution`.
 *
 * Uses the same remark stack as `extractSandboxFence` so fence-length
 * closing rules match what the page actually parses.
 */
export function extractHints(explanation: string): CoachHint[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(explanation) as Root;
  const hints: CoachHint[] = [];
  for (const child of tree.children) {
    if (child.type !== "code") continue;
    const node = child as Code;
    if (node.lang !== "reveal") continue;
    const label = (node.meta ?? "").trim();
    if (!HINT_LABEL.test(label)) continue;
    hints.push({
      index: hints.length + 1,
      label,
      body: node.value.replace(/\n$/, ""),
    });
  }
  return hints;
}
