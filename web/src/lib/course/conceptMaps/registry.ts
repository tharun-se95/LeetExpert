import { bigOConceptMap } from "./bigO";
import { gettingStartedConceptMap } from "./gettingStarted";
import { hashTablesConceptMap } from "./hashTables";
import { mathForDsaConceptMap } from "./mathForDsa";
import type { MindMapNode } from "./types";

/** Concept map trees, keyed by module slug. Not every module has one yet. */
export const CONCEPT_MAPS: Record<string, MindMapNode> = {
  "getting-started": gettingStartedConceptMap,
  "big-o": bigOConceptMap,
  "math-for-dsa": mathForDsaConceptMap,
  "hash-tables": hashTablesConceptMap,
};

export function getConceptMap(moduleSlug: string): MindMapNode | undefined {
  return CONCEPT_MAPS[moduleSlug];
}
