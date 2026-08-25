import { arraysConceptMap } from "./arrays";
import { bigOConceptMap } from "./bigO";
import { binaryTreesConceptMap } from "./binaryTrees";
import { gettingStartedConceptMap } from "./gettingStarted";
import { hashTablesConceptMap } from "./hashTables";
import { linkedListsConceptMap } from "./linkedLists";
import { mathForDsaConceptMap } from "./mathForDsa";
import { binarySearchConceptMap } from "./binarySearch";
import { queuesConceptMap } from "./queues";
import { recursionBacktrackingConceptMap } from "./recursionBacktracking";
import { slidingWindowConceptMap } from "./slidingWindow";
import { sortingConceptMap } from "./sorting";
import { stacksConceptMap } from "./stacks";
import { stringsConceptMap } from "./strings";
import { twoPointersConceptMap } from "./twoPointers";
import type { MindMapNode } from "./types";

/** Concept map trees, keyed by module slug. Not every module has one yet. */
export const CONCEPT_MAPS: Record<string, MindMapNode> = {
  "getting-started": gettingStartedConceptMap,
  "big-o": bigOConceptMap,
  "math-for-dsa": mathForDsaConceptMap,
  arrays: arraysConceptMap,
  strings: stringsConceptMap,
  "hash-tables": hashTablesConceptMap,
  "linked-lists": linkedListsConceptMap,
  stacks: stacksConceptMap,
  queues: queuesConceptMap,
  "two-pointers": twoPointersConceptMap,
  "sliding-window": slidingWindowConceptMap,
  "binary-search": binarySearchConceptMap,
  sorting: sortingConceptMap,
  "recursion-backtracking": recursionBacktrackingConceptMap,
  "binary-trees": binaryTreesConceptMap,
};

export function getConceptMap(moduleSlug: string): MindMapNode | undefined {
  return CONCEPT_MAPS[moduleSlug];
}
