import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Heading, Root, RootContent } from "mdast";

function phrasingText(node: {
  type: string;
  value?: string;
  children?: unknown[];
}): string {
  if (typeof node.value === "string") return node.value;
  if (!Array.isArray(node.children)) return "";
  return node.children
    .map((child) =>
      phrasingText(
        child as { type: string; value?: string; children?: unknown[] },
      ),
    )
    .join("");
}

function headingText(node: Heading): string {
  return phrasingText(node).trim();
}

function sliceNode(source: string, node: RootContent): string {
  const start = node.position?.start.offset;
  const end = node.position?.end.offset;
  if (start === undefined || end === undefined) return "";
  return source.slice(start, end);
}

/** Blockquote chrome and hard wraps — the model needs one readable phrase. */
function toReadableProse(markdown: string): string {
  const lines = markdown.split("\n").map((line) => line.replace(/^>\s?/, ""));
  const paragraphs: string[] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (line.trim() === "") {
      if (current.length > 0) {
        paragraphs.push(current.join(" "));
        current = [];
      }
      continue;
    }
    current.push(line.trim());
  }
  if (current.length > 0) paragraphs.push(current.join(" "));
  return paragraphs.join("\n\n").trim();
}

/**
 * Lesson thesis from an Explanation slice — never the Solution tab.
 * Heading first (most problems), then the first blockquote, else empty.
 */
export function extractThesis(explanation: string): string {
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(explanation) as Root;
  const nodes = tree.children;

  const insightAt = nodes.findIndex(
    (node) =>
      node.type === "heading" && /^the insight$/i.test(headingText(node)),
  );

  if (insightAt >= 0) {
    const parts: string[] = [];
    for (const node of nodes.slice(insightAt + 1)) {
      if (node.type === "heading" || node.type === "code") break;
      const slice = sliceNode(explanation, node);
      if (slice) parts.push(slice);
    }
    return toReadableProse(parts.join("\n\n"));
  }

  const quote = nodes.find((node) => node.type === "blockquote");
  return quote ? toReadableProse(sliceNode(explanation, quote)) : "";
}
