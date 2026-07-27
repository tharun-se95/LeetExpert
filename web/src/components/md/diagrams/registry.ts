import type { ComponentType } from "react";
import { ModClockDiagram } from "@/components/md/diagrams/ModClockDiagram";
import { EuclidShrinkDiagram } from "@/components/md/diagrams/EuclidShrinkDiagram";
import { LogHalvingDiagram } from "@/components/md/diagrams/LogHalvingDiagram";
import { InvariantRegionsDiagram } from "@/components/md/diagrams/InvariantRegionsDiagram";
import { InvariantPhasesDiagram } from "@/components/md/diagrams/InvariantPhasesDiagram";
import { ConvergingPointersDiagram } from "@/components/md/diagrams/ConvergingPointersDiagram";
import { CyclicPlacementDiagram } from "@/components/md/diagrams/CyclicPlacementDiagram";

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
};
