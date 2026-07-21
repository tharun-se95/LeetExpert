import type { ComponentType } from "react";
import { ModClockDiagram } from "@/components/md/diagrams/ModClockDiagram";
import { EuclidShrinkDiagram } from "@/components/md/diagrams/EuclidShrinkDiagram";
import { LogHalvingDiagram } from "@/components/md/diagrams/LogHalvingDiagram";

export type DiagramComponent = ComponentType<Record<string, unknown>>;

/** Static, non-interactive illustrative diagrams for the `diagram` fence. */
export const DIAGRAM_REGISTRY: Record<string, DiagramComponent> = {
  "mod-clock": ModClockDiagram,
  "euclid-shrink": EuclidShrinkDiagram,
  "log-halving": LogHalvingDiagram,
};
