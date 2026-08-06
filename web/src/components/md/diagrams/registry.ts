import type { ComponentType } from "react";
import type { FamilyId } from "@/lib/content/manifest";
import { ModClockDiagram } from "@/components/md/diagrams/ModClockDiagram";
import { EuclidShrinkDiagram } from "@/components/md/diagrams/EuclidShrinkDiagram";
import { LogHalvingDiagram } from "@/components/md/diagrams/LogHalvingDiagram";
import { InvariantRegionsDiagram } from "@/components/md/diagrams/InvariantRegionsDiagram";
import { InvariantPhasesDiagram } from "@/components/md/diagrams/InvariantPhasesDiagram";
import { ConvergingPointersDiagram } from "@/components/md/diagrams/ConvergingPointersDiagram";
import { CyclicPlacementDiagram } from "@/components/md/diagrams/CyclicPlacementDiagram";
import { StringBuilderCostDiagram } from "@/components/md/diagrams/StringBuilderCostDiagram";
import { ColumnScanDiagram } from "@/components/md/diagrams/ColumnScanDiagram";
import { WordPipelineDiagram } from "@/components/md/diagrams/WordPipelineDiagram";
import { MemoryCellsDiagram } from "@/components/md/diagrams/MemoryCellsDiagram";
import { BinaryTreeDiagram } from "@/components/md/diagrams/BinaryTreeDiagram";
import { BucketLayoutDiagram } from "@/components/md/diagrams/BucketLayoutDiagram";
import { LinkedListDiagram } from "@/components/md/diagrams/LinkedListDiagram";
import { GridRegionsDiagram } from "@/components/md/diagrams/GridRegionsDiagram";
import { ComplexityCurveDiagram } from "@/components/md/diagrams/ComplexityCurveDiagram";
import { CallStackFramesDiagram } from "@/components/md/diagrams/CallStackFramesDiagram";
import { TrieBranchesDiagram } from "@/components/md/diagrams/TrieBranchesDiagram";
import { GraphRepresentationDiagram } from "@/components/md/diagrams/GraphRepresentationDiagram";
import { HeapArrayDiagram } from "@/components/md/diagrams/HeapArrayDiagram";
import { IntervalTimelineDiagram } from "@/components/md/diagrams/IntervalTimelineDiagram";
import { GridCoordsDiagram } from "@/components/md/diagrams/GridCoordsDiagram";
import { HashPipelineDiagram } from "@/components/md/diagrams/HashPipelineDiagram";
import { HashPatternsDiagram } from "@/components/md/diagrams/HashPatternsDiagram";
import { SortedPrefixDiagram } from "@/components/md/diagrams/SortedPrefixDiagram";
import { OverlapTreeDiagram } from "@/components/md/diagrams/OverlapTreeDiagram";
import { TreeBalanceDiagram } from "@/components/md/diagrams/TreeBalanceDiagram";
import { FifoQueueDiagram } from "@/components/md/diagrams/FifoQueueDiagram";
import { SearchRangeDiagram } from "@/components/md/diagrams/SearchRangeDiagram";
import { UnionFindDiagram } from "@/components/md/diagrams/UnionFindDiagram";
import { DpTableDiagram } from "@/components/md/diagrams/DpTableDiagram";
import { MergeTreeDiagram } from "@/components/md/diagrams/MergeTreeDiagram";
import { BacktrackingTreeDiagram } from "@/components/md/diagrams/BacktrackingTreeDiagram";
import { GraphLayersDiagram } from "@/components/md/diagrams/GraphLayersDiagram";

export type DiagramComponent = ComponentType<Record<string, unknown>>;

/** Static, non-interactive illustrative diagrams for the `diagram` fence. */
export const DIAGRAM_REGISTRY: Record<string, DiagramComponent> = {
  "mod-clock": ModClockDiagram,
  "euclid-shrink": EuclidShrinkDiagram,
  "log-halving": LogHalvingDiagram,
  "invariant-regions": InvariantRegionsDiagram,
  "invariant-phases": InvariantPhasesDiagram,
  "reverse-converging": ConvergingPointersDiagram,
  "cyclic-placement": CyclicPlacementDiagram,
  "string-builder-cost": StringBuilderCostDiagram,
  "column-scan": ColumnScanDiagram,
  "word-pipeline": WordPipelineDiagram,
  "memory-cells": MemoryCellsDiagram,
  "binary-tree": BinaryTreeDiagram,
  "bucket-layout": BucketLayoutDiagram,
  "linked-list": LinkedListDiagram,
  "grid-regions": GridRegionsDiagram,
  "complexity-curve": ComplexityCurveDiagram,
  "call-stack-frames": CallStackFramesDiagram,
  "trie-branches": TrieBranchesDiagram,
  "graph-representation": GraphRepresentationDiagram,
  "heap-array": HeapArrayDiagram,
  "interval-timeline": IntervalTimelineDiagram,
  "grid-coords": GridCoordsDiagram,
  "hash-pipeline": HashPipelineDiagram,
  "hash-patterns": HashPatternsDiagram,
  "sorted-prefix": SortedPrefixDiagram,
  "overlap-tree": OverlapTreeDiagram,
  "tree-balance": TreeBalanceDiagram,
  "fifo-queue": FifoQueueDiagram,
  "search-range": SearchRangeDiagram,
  "union-find": UnionFindDiagram,
  "dp-table": DpTableDiagram,
  "merge-tree": MergeTreeDiagram,
  "backtracking-tree": BacktrackingTreeDiagram,
  "graph-layers": GraphLayersDiagram,
};

/**
 * Algorithm family per diagram id, mirroring how each viz component
 * hardcodes its own `family`. Utility diagrams with no real technique
 * home (the math-for-dsa trio, complexity-curve, word-pipeline) are
 * deliberately absent — they stay neutral `--accent`.
 */
export const DIAGRAM_FAMILY: Partial<Record<string, FamilyId>> = {
  "invariant-regions": "pointer-movement",
  "invariant-phases": "pointer-movement",
  "reverse-converging": "pointer-movement",
  "cyclic-placement": "pointer-movement",
  "string-builder-cost": "linear-traversal",
  "column-scan": "linear-traversal",
  "memory-cells": "linear-traversal",
  "binary-tree": "recursive-exploration",
  "bucket-layout": "relationships",
  "linked-list": "pointer-movement",
  "grid-regions": "linear-traversal",
  "call-stack-frames": "state-transition",
  "trie-branches": "recursive-exploration",
  "graph-representation": "relationships",
  "heap-array": "priority-structures",
  "interval-timeline": "ordering-search",
  "grid-coords": "linear-traversal",
  "hash-pipeline": "relationships",
  "hash-patterns": "relationships",
  "sorted-prefix": "state-transition",
  "overlap-tree": "recursive-exploration",
  "tree-balance": "recursive-exploration",
  "fifo-queue": "state-transition",
  "search-range": "ordering-search",
  "union-find": "relationships",
  "dp-table": "linear-traversal",
  "merge-tree": "state-transition",
  "backtracking-tree": "recursive-exploration",
  "graph-layers": "relationships",
};
