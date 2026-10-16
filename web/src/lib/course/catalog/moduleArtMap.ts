export interface TopicArtInfo {
  slug: string;
  title: string;
  familyId: string;
}

export const TOPIC_ART_MAP: Record<string, TopicArtInfo> = {
  "Arrays": {
    slug: "arrays",
    title: "Arrays & Memory",
    familyId: "linear-traversal",
  },
  "Hash Tables": {
    slug: "hash-tables",
    title: "Hash Tables",
    familyId: "linear-traversal",
  },
  "Two Pointers": {
    slug: "two-pointers",
    title: "Two Pointers",
    familyId: "pointer-movement",
  },
  "Sliding Window": {
    slug: "sliding-window",
    title: "Sliding Window",
    familyId: "pointer-movement",
  },
  "Linked Lists": {
    slug: "linked-lists",
    title: "Linked Lists",
    familyId: "pointer-movement",
  },
  "Binary Search": {
    slug: "binary-search",
    title: "Binary Search",
    familyId: "ordering-search",
  },
  "Sorting": {
    slug: "sorting",
    title: "Sorting",
    familyId: "ordering-search",
  },
  "Intervals": {
    slug: "intervals",
    title: "Intervals",
    familyId: "ordering-search",
  },
  "Matrix": {
    slug: "matrix",
    title: "Matrix",
    familyId: "ordering-search",
  },
  "Binary Trees": {
    slug: "binary-trees",
    title: "Binary Trees",
    familyId: "recursive-exploration",
  },
  "BST": {
    slug: "bst",
    title: "Binary Search Trees",
    familyId: "recursive-exploration",
  },
  "Recursion & Backtracking": {
    slug: "recursion-backtracking",
    title: "Backtracking",
    familyId: "recursive-exploration",
  },
  "Dynamic Programming": {
    slug: "dynamic-programming",
    title: "Dynamic Programming",
    familyId: "state-transition",
  },
  "Greedy": {
    slug: "greedy",
    title: "Greedy",
    familyId: "state-transition",
  },
  "Graphs": {
    slug: "graphs",
    title: "Graphs",
    familyId: "relationships",
  },
  "Heaps": {
    slug: "heaps",
    title: "Heaps",
    familyId: "priority-structures",
  },
  "Stacks": {
    slug: "stacks",
    title: "Stacks",
    familyId: "priority-structures",
  },
  "Queues": {
    slug: "queues",
    title: "Queues",
    familyId: "priority-structures",
  },
  "Tries": {
    slug: "tries",
    title: "Tries",
    familyId: "priority-structures",
  },
  "Prefix Sum": {
    slug: "prefix-sum",
    title: "Prefix Sum",
    familyId: "linear-traversal",
  },
  "Strings": {
    slug: "strings",
    title: "Strings",
    familyId: "linear-traversal",
  },
};

export function getTopicArtPaths(topicName: string): { light: string; dark: string } | null {
  const match = TOPIC_ART_MAP[topicName];
  if (!match) return null;
  return {
    light: `/media/module-art/${match.slug}-light.webp`,
    dark: `/media/module-art/${match.slug}-dark.webp`,
  };
}

export function getModuleArtPaths(moduleSlug: string): { light: string; dark: string } {
  return {
    light: `/media/module-art/${moduleSlug}-light.webp`,
    dark: `/media/module-art/${moduleSlug}-dark.webp`,
  };
}
