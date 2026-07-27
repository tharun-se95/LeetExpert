import type { ComponentType } from "react";
import { WritePointerViz } from "@/components/viz/vizzes/WritePointerViz";
import { DynamicArrayGrowthViz } from "@/components/viz/vizzes/DynamicArrayGrowthViz";
import { ConvergingPointersViz } from "@/components/viz/vizzes/ConvergingPointersViz";
import { MonotonicStackViz } from "@/components/viz/vizzes/MonotonicStackViz";
import { RingBufferViz } from "@/components/viz/vizzes/RingBufferViz";
import { ListReversalViz } from "@/components/viz/vizzes/ListReversalViz";
import { FastSlowViz } from "@/components/viz/vizzes/FastSlowViz";
import { HashBucketsViz } from "@/components/viz/vizzes/HashBucketsViz";
import { FibCallTreeViz } from "@/components/viz/vizzes/FibCallTreeViz";
import { SlidingWindowViz } from "@/components/viz/vizzes/SlidingWindowViz";
import { BinarySearchViz } from "@/components/viz/vizzes/BinarySearchViz";
import { DynamicWindowViz } from "@/components/viz/vizzes/DynamicWindowViz";
import { PrefixSumViz } from "@/components/viz/vizzes/PrefixSumViz";
import { KadaneViz } from "@/components/viz/vizzes/KadaneViz";
import { CyclicRotateViz } from "@/components/viz/vizzes/CyclicRotateViz";
import { BlockReversalViz } from "@/components/viz/vizzes/BlockReversalViz";

export type VizComponent = ComponentType<Record<string, unknown>>;

/**
 * Maps a `viz` fence's `id` to its tracer component. Everything else in
 * the fence JSON is passed to the component as props.
 */
export const VIZ_REGISTRY: Record<string, VizComponent> = {
  "write-pointer": WritePointerViz,
  "dynamic-array-growth": DynamicArrayGrowthViz,
  "converging-pointers": ConvergingPointersViz,
  "monotonic-stack": MonotonicStackViz,
  "ring-buffer": RingBufferViz,
  "list-reversal": ListReversalViz,
  "fast-slow": FastSlowViz,
  "hash-buckets": HashBucketsViz,
  "fib-call-tree": FibCallTreeViz,
  "sliding-window": SlidingWindowViz,
  "binary-search": BinarySearchViz,
  "dynamic-window": DynamicWindowViz,
  "prefix-sum": PrefixSumViz,
  "kadane": KadaneViz,
  "cyclic-rotate": CyclicRotateViz,
  "block-reversal": BlockReversalViz,
};
