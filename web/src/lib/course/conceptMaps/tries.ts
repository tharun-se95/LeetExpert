import type { MindMapNode } from "./types";

/**
 * Concept map for the Tries module. Hand-authored from the module's
 * single-lesson structure (course/tries/*.md). Curriculum-designer
 * review confirmed 1 lesson is right and all 4 problem lessons self-teach
 * their extension of the base trie (wildcard DFS, grid-trie lockstep,
 * buildable-word BFS/DFS). It recommended swapping Word Search II and
 * Longest Word in Dictionary so the pure-trie-traversal problem comes
 * before the higher-complexity grid+trie problem — applied, since it's a
 * sound difficulty-curve improvement and no lesson's prose depended on
 * the old order (verified). Rejected two "scope gap" suggestions to add
 * new problem lessons (trie deletion, longest-prefix-match/router
 * matching) as out of scope for a content-quality pass — each needs its
 * own full sandbox, not a prose edit.
 */
export const triesConceptMap: MindMapNode = {
  id: "tries",
  label: "Tries",
  children: [
    {
      id: "trie-structure-prefix-search",
      label: "Trie Structure & Prefix Search",
      children: [
        { id: "prefix-question", label: "A hash set answers exact-match in O(1) but offers nothing for 'does any word start with this' — a trie keeps related keys related so prefix queries touch only the prefix" },
        { id: "hash-set-prefix-cost", label: "A hash set's prefix query costs O(n·P) — every entry must be scanned and tested, each check bounded by the prefix length P, not the word length" },
        { id: "node-per-character", label: "Edges are labeled with characters; a path from the root spells a string; shared prefixes share the same nodes, then branch" },
        { id: "is-end-of-word-flag", label: "A node's mere existence can't distinguish a stored word from a prefix in passing — only the is_end_of_word flag can, since inserting a longer word materializes every node on its path" },
        { id: "three-ops-same-walk", label: "Insert, search, and starts_with are all O(L) root-to-node walks — search and starts_with differ by exactly one line, the final flag check" },
        { id: "space-tradeoff", label: "A trie is a space win only when prefixes are heavily shared and a space loss when they aren't — plus a further map-vs-array choice trading memory for O(1) worst-case access" },
      ],
    },
  ],
};
