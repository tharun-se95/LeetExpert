"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  ALL_EDGES,
  BUCKETS,
  CELL,
  HASH_BUCKET_SIZES,
  HASH_CHAIN_X0,
  HASH_LABEL_X,
  HASH_ROW_Y,
  HASH_STAGE,
  LAYOUTS,
  STRUCTURE_VALUES,
  VIEW_H,
  VIEW_W,
  clampStage,
  cornerFor,
  describeStage,
} from "@/lib/landing/structureLayouts";
import { cn } from "@/lib/utils";

/** Slow in, slow out: the move reads as deliberate, and lands still. */
const MORPH = { duration: 0.9, ease: [0.65, 0, 0.35, 1] as const };

/**
 * The landing page's line drawing: the same seven values as an array, a hash
 * table, a BST and a graph. Changing `stage` animates to that layout — nodes
 * glide, cells round into circles, new edges draw themselves in — with motion,
 * which interpolates off the main render path, so a stage change costs one
 * render rather than one per frame. Reduced motion jumps straight there.
 * Monochrome per CLAUDE.md §4: muted lines, --mark on the nodes.
 */
export function EvolvingStructure({ stage, className }: { stage: number; className?: string }) {
  const reduce = useReducedMotion();
  const s = clampStage(stage);
  const points = LAYOUTS[s]!;
  const transition = reduce ? { duration: 0 } : MORPH;

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label={describeStage(s)}
      fill="none"
      className={cn("h-auto", className)}
    >
      <motion.g initial={false} animate={{ opacity: s === HASH_STAGE ? 1 : 0 }} transition={transition}>
        {Array.from({ length: BUCKETS }, (_, b) => (
          <g key={`bucket-${b}`}>
            <text
              x={HASH_LABEL_X}
              y={HASH_ROW_Y(b)}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-muted font-sans text-[13px] tabular-nums"
            >
              {b}
            </text>
            {HASH_BUCKET_SIZES[b] ? (
              <line
                x1={HASH_LABEL_X + 14}
                y1={HASH_ROW_Y(b)}
                x2={HASH_CHAIN_X0 - CELL / 2}
                y2={HASH_ROW_Y(b)}
                strokeWidth={1.25}
                className="stroke-muted/60"
              />
            ) : null}
          </g>
        ))}
      </motion.g>

      {/* Edges run centre to centre; the opaque nodes drawn after them hide the ends. */}
      {ALL_EDGES.map(({ edge: [a, b], stages }) => {
        const p = points[a]!;
        const q = points[b]!;
        const shown = stages.includes(s);
        return (
          <motion.line
            key={`edge-${a}-${b}`}
            initial={false}
            animate={{ x1: p.x, y1: p.y, x2: q.x, y2: q.y, opacity: shown ? 1 : 0, pathLength: shown ? 1 : 0 }}
            transition={transition}
            strokeWidth={1.25}
            className="stroke-muted/70"
            data-shown={shown || undefined}
          />
        );
      })}

      {points.map((p, i) => (
        <motion.g key={`node-${i}`} initial={false} animate={{ x: p.x, y: p.y }} transition={transition}>
          <motion.rect
            x={-CELL / 2}
            y={-CELL / 2}
            width={CELL}
            height={CELL}
            initial={false}
            animate={{ rx: cornerFor(s) }}
            transition={transition}
            strokeWidth={1.5}
            className="fill-background stroke-mark"
          />
          <text
            x={0}
            y={0}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground font-sans text-[14px] font-medium tabular-nums"
          >
            {STRUCTURE_VALUES[i]}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}
