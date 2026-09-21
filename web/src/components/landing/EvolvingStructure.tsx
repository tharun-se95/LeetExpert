"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import {
  ALL_EDGES,
  ARRAY_CAPSULE,
  CLOUDS,
  GRAPH_STAGE,
  HASH_BUCKET_SIZES,
  HASH_CHAIN_X0,
  HASH_ROW_Y,
  HASH_SPINE_X,
  MORPH_MS,
  POINT_R,
  VIEW_H,
  VIEW_W,
  backdropTarget,
  easeInOut,
  floatOffset,
  frameFor,
  mixFrames,
  sameTarget,
  type Frame,
  type Point,
  type Target,
} from "@/lib/landing/structureLayouts";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";
import { hexToRgb, rgbToHex } from "@/lib/visual/palette";

/** A frame longer than this (a stall, a backgrounded tab) counts as this; the loop never jumps. */
const MAX_STEP_MS = 100;

const BUCKET_ROWS = HASH_BUCKET_SIZES.map((size, b) => (size ? HASH_ROW_Y(b) : null)).filter(
  (y): y is number => y !== null,
);

/**
 * The landing backdrop's drawing: floating data points that gather into a
 * structure, hold it, scatter and gather into the next (owner, 2026-09-20).
 *
 * The server renders the first cloud; after mount one animation-frame loop
 * advances the clock and writes positions straight to the SVG, so nothing
 * re-renders per frame. Every edge is drawn from the same two computed
 * points as its dots, float included, so a link never detaches. The clock
 * only moves on frames, so a hidden tab pauses it. Reduced motion draws the
 * graph, still. Decorative only: the page carries no information here.
 * `colours` holds one hex per structure (its module's family colour); the ink
 * glides between them with the points.
 */
export function EvolvingStructure({ colours, className }: { colours: readonly string[]; className?: string }) {
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const svg = useRef<SVGSVGElement>(null);
  // Keyed on the values, not the array: the server hands a fresh array each render.
  const key = colours.join(" ");
  const inks = useMemo(() => key.split(" ").map(hexToRgb), [key]);

  useEffect(() => {
    const root = svg.current;
    if (!root) return;
    const dots = Array.from(root.querySelectorAll<SVGCircleElement>("[data-point]"));
    const lines = Array.from(root.querySelectorAll<SVGLineElement>("[data-edge]"));
    const capsule = root.querySelector<SVGElement>("[data-capsule]");
    const spine = root.querySelector<SVGElement>("[data-spine]");

    const paint = (frame: Frame, seconds: number) => {
      root.style.setProperty("--backdrop-ink", rgbToHex(frame.colour));
      const at: Point[] = frame.points.map((p, i) => {
        const f = floatOffset(i, seconds);
        return { x: p.x + f.x * frame.float, y: p.y + f.y * frame.float };
      });
      at.forEach((p, i) => {
        dots[i]?.setAttribute("cx", p.x.toFixed(2));
        dots[i]?.setAttribute("cy", p.y.toFixed(2));
      });
      ALL_EDGES.forEach(({ edge: [a, b] }, i) => {
        const line = lines[i];
        if (!line) return;
        const shown = frame.edges[i]!;
        line.setAttribute("x1", at[a]!.x.toFixed(2));
        line.setAttribute("y1", at[a]!.y.toFixed(2));
        line.setAttribute("x2", at[b]!.x.toFixed(2));
        line.setAttribute("y2", at[b]!.y.toFixed(2));
        // pathLength="1": the dash offset draws the link in from its first end.
        line.style.strokeDashoffset = String(1 - shown);
        line.style.opacity = String(shown);
      });
      if (capsule) capsule.style.opacity = String(frame.capsule);
      if (spine) spine.style.opacity = String(frame.spine);
    };

    if (reduce) {
      paint({ ...frameFor({ kind: "structure", stage: GRAPH_STAGE }, inks), float: 0 }, 0);
      return;
    }

    let target: Target = { kind: "cloud", cloud: 0 };
    let from = frameFor(target, inks);
    let to = from;
    let current = from;
    let tweenStart = 0;
    let elapsed = 0;
    let last: number | null = null;
    let raf = 0;

    const tick = (now: number) => {
      elapsed += last === null ? 0 : Math.min(now - last, MAX_STEP_MS);
      last = now;
      const next = backdropTarget(elapsed);
      if (!sameTarget(next, target)) {
        // Retarget from wherever the points are now, so a glide never snaps.
        target = next;
        from = current;
        to = frameFor(next, inks);
        tweenStart = elapsed;
      }
      current = mixFrames(from, to, easeInOut((elapsed - tweenStart) / MORPH_MS));
      paint(current, elapsed / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, inks]);

  const cloud = CLOUDS[0]!;

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      aria-hidden
      fill="none"
      className={cn("h-auto overflow-visible", className)}
      // The first cloud's ink, so the server paints the colour the loop starts from.
      style={{ "--backdrop-ink": colours[0] } as CSSProperties}
    >
      <rect data-capsule {...ARRAY_CAPSULE} strokeWidth={2} style={{ opacity: 0 }} />
      <g data-spine style={{ opacity: 0 }}>
        <line
          x1={HASH_SPINE_X}
          y1={HASH_ROW_Y(0)}
          x2={HASH_SPINE_X}
          y2={HASH_ROW_Y(HASH_BUCKET_SIZES.length - 1)}
          strokeWidth={2}
        />
        {BUCKET_ROWS.map((y) => (
          <line key={y} x1={HASH_SPINE_X} y1={y} x2={HASH_CHAIN_X0 - 2 * POINT_R} y2={y} strokeWidth={2} />
        ))}
      </g>
      {ALL_EDGES.map(({ edge: [a, b] }) => (
        <line
          key={`edge-${a}-${b}`}
          data-edge
          x1={cloud[a]!.x}
          y1={cloud[a]!.y}
          x2={cloud[b]!.x}
          y2={cloud[b]!.y}
          pathLength={1}
          strokeWidth={2}
          strokeDasharray="1 1"
          style={{ strokeDashoffset: 1, opacity: 0 }}
        />
      ))}
      {cloud.map((p, i) => (
        <circle key={`point-${i}`} data-point cx={p.x} cy={p.y} r={POINT_R} />
      ))}
    </svg>
  );
}
