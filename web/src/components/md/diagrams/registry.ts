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
};

/**
 * Algorithm family per diagram id, mirroring how each viz component
 * hardcodes its own `family`. Utility diagrams with no real technique
 * home (the math-for-dsa trio, and word-pipeline — a transformation
 * sequence, not a scanning technique) are deliberately absent — they
 * stay neutral `--accent` rather than being forced into a family.
 */
export const DIAGRAM_FAMILY: Partial<Record<string, FamilyId>> = {
  "invariant-regions": "pointer-movement",
  "invariant-phases": "pointer-movement",
  "reverse-converging": "pointer-movement",
  "cyclic-placement": "pointer-movement",
  "string-builder-cost": "linear-traversal",
  "column-scan": "linear-traversal",
};
