import type { ComponentType } from "react";
import { WritePointerViz } from "@/components/viz/vizzes/WritePointerViz";
import { DynamicArrayGrowthViz } from "@/components/viz/vizzes/DynamicArrayGrowthViz";

export type VizComponent = ComponentType<Record<string, unknown>>;

/**
 * Maps a `viz` fence's `id` to its tracer component. Everything else in
 * the fence JSON is passed to the component as props.
 */
export const VIZ_REGISTRY: Record<string, VizComponent> = {
  "write-pointer": WritePointerViz,
  "dynamic-array-growth": DynamicArrayGrowthViz,
};
