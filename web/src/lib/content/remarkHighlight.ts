import { visit } from "unist-util-visit";
import type { Root, Text, PhrasingContent, Parent } from "mdast";

/**
 * `==like this==` becomes a <mark> — the highlighter swipe of the press system.
 *
 * remark-gfm covers strikethrough but not highlight, so this fills the gap
 * with the syntax people already expect from Obsidian and Notion.
 *
 * The mark is deliberately authored, never automatic: it means "this is the
 * sentence the lesson turns on." A highlighter that appears by rule stops
 * carrying information and becomes decoration.
 */

const PATTERN = /==(?!\s)([^=]+?)(?<!\s)==/g;

export function remarkHighlight() {
  return (tree: Root) => {
    visit(tree, "text", (node: Text, index, parent: Parent | undefined) => {
      if (!parent || index === undefined) return;
      const value = node.value;
      if (!value.includes("==")) return;

      PATTERN.lastIndex = 0;
      const out: PhrasingContent[] = [];
      let cursor = 0;
      let match: RegExpExecArray | null;

      while ((match = PATTERN.exec(value)) !== null) {
        if (match.index > cursor) {
          out.push({ type: "text", value: value.slice(cursor, match.index) });
        }
        out.push({
          // No mdast type exists for this, so it rides through remark-rehype
          // on data.hName, which mdast-util-to-hast applies to any node.
          type: "highlight",
          data: { hName: "mark" },
          children: [{ type: "text", value: match[1] }],
        } as unknown as PhrasingContent);
        cursor = match.index + match[0].length;
      }

      if (out.length === 0) return;
      if (cursor < value.length) {
        out.push({ type: "text", value: value.slice(cursor) });
      }

      parent.children.splice(index, 1, ...out);
      // Skip the nodes just inserted so the visitor doesn't re-scan them.
      return index + out.length;
    });
  };
}
