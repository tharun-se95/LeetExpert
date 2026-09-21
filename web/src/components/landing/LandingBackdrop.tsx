"use client";

import { useEffect, useRef } from "react";
import {
  CELL_H,
  CELL_W,
  FLASH_MS,
  MAJOR_EVERY,
  RAMP_SPAN_PX,
  cellsAlong,
  flashKey,
  flashLevel,
  glowField,
  gridTransform,
  invert,
  rampColour,
  visibleCells,
  type Affine,
  type Flash,
} from "@/lib/landing/boxesGrid";
import { useMediaQuery } from "@/lib/useMediaQuery";

/** Device pixels past 2x add cost, not sharpness, on hairlines. */
const MAX_DPR = 2;
/** Half the length of a "+" mark's arm, in grid pixels. */
const PLUS_ARM = 8;
/** Major lines are drawn a little heavier so they hold at 0.675 scale. */
const MAJOR_WIDTH = 1.5;
/** A pause longer than this, or a jump farther than JUMP_PX, starts a new stroke instead of a line. */
const STROKE_GAP_MS = 120;
const JUMP_PX = 400;
/** Neighbouring fills overlap by this much (grid px) so anti-aliasing leaves no seam between them. */
const BLEED = 0.25;

/**
 * The landing page's backdrop: Aceternity's Background Boxes as one canvas
 * (owner, 2026-09-21; refined 2026-09-22; spec
 * 2026-09-21-landing-boxes-backdrop-design.md). The hairline grid, minor lines
 * with a heavier line every fourth, is painted once per size or theme change to
 * an offscreen layer. A pointer sweep lights every cell it crosses, each
 * rising softly and fading over two seconds into a pool of light that spills
 * onto its neighbours, in a colour that moves through the course families as
 * the pointer travels. That fade is the only thing that runs frames, so an
 * idle page runs none.
 *
 * The pointer is read on `window`, not the canvas: the page's content sits above
 * this layer and would swallow the events. Touch shows the still grid, and so
 * does reduced motion. Decorative: hidden from assistive tech.
 */
export function LandingBackdrop({ colours }: { colours: readonly string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const flashes = new Map<number, Flash>();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let m: Affine = gridTransform(1, 1);
    let inverse: Affine = invert(m);
    let layer: HTMLCanvasElement | null = null;
    let frame = 0;
    // Read once per repaint (a size or theme change), not per frame.
    let minor = "";
    let major = "";
    let peak = 0;
    // Where the colour ramp starts, so each visit opens on a different family.
    let travel = Math.random() * colours.length * RAMP_SPAN_PX;
    let prev: { x: number; y: number; t: number } | null = null;
    let lastKey = -1;

    const setGridTransform = (g: CanvasRenderingContext2D) =>
      g.setTransform(dpr * m[0], dpr * m[1], dpr * m[2], dpr * m[3], dpr * m[4], dpr * m[5]);

    const paintLayer = () => {
      const off = document.createElement("canvas");
      off.width = canvas.width;
      off.height = canvas.height;
      const g = off.getContext("2d");
      const range = visibleCells(inverse, width, height);
      if (!g || !range) return off;
      setGridTransform(g);
      const { col0, col1, row0, row1 } = range;
      const x0 = col0 * CELL_W;
      const x1 = (col1 + 1) * CELL_W;
      const y0 = row0 * CELL_H;
      const y1 = (row1 + 1) * CELL_H;

      // Minor lines first, then the major ones over them (every fourth column and row).
      for (const isMajor of [false, true]) {
        g.strokeStyle = isMajor ? major : minor;
        g.lineWidth = isMajor ? MAJOR_WIDTH : 1;
        g.beginPath();
        for (let c = col0; c <= col1 + 1; c++) {
          if ((c % MAJOR_EVERY === 0) !== isMajor) continue;
          g.moveTo(c * CELL_W, y0);
          g.lineTo(c * CELL_W, y1);
        }
        for (let r = row0; r <= row1 + 1; r++) {
          if ((r % MAJOR_EVERY === 0) !== isMajor) continue;
          g.moveTo(x0, r * CELL_H);
          g.lineTo(x1, r * CELL_H);
        }
        // A "+" where two major lines cross.
        if (isMajor) {
          for (let c = Math.ceil(col0 / MAJOR_EVERY) * MAJOR_EVERY; c <= col1 + 1; c += MAJOR_EVERY) {
            for (let r = Math.ceil(row0 / MAJOR_EVERY) * MAJOR_EVERY; r <= row1 + 1; r += MAJOR_EVERY) {
              const x = c * CELL_W;
              const y = r * CELL_H;
              g.moveTo(x - PLUS_ARM, y);
              g.lineTo(x + PLUS_ARM, y);
              g.moveTo(x, y - PLUS_ARM);
              g.lineTo(x, y + PLUS_ARM);
            }
          }
        }
        g.stroke();
      }
      return off;
    };

    const draw = (now: number) => {
      frame = 0;
      for (const [key, flash] of flashes) if (now - flash.t0 >= FLASH_MS) flashes.delete(key);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // The glow first, so the hairlines stay visible on top of a lit cell.
      setGridTransform(ctx);
      for (const { cell, colour, level } of glowField(flashes.values(), now).values()) {
        ctx.globalAlpha = peak * level;
        ctx.fillStyle = colour;
        ctx.fillRect(cell.col * CELL_W - BLEED, cell.row * CELL_H - BLEED, CELL_W + 2 * BLEED, CELL_H + 2 * BLEED);
      }
      ctx.globalAlpha = 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (layer) ctx.drawImage(layer, 0, 0);
      if (flashes.size > 0) frame = requestAnimationFrame(draw);
    };

    const repaint = () => {
      const style = getComputedStyle(canvas);
      minor = style.color;
      major = style.borderTopColor;
      peak = Number.parseFloat(style.getPropertyValue("--boxes-flash-alpha")) || 0;
      layer = paintLayer();
      if (!frame) draw(performance.now());
    };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      m = gridTransform(width, height);
      inverse = invert(m);
      repaint();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const now = performance.now();
      const { clientX: x, clientY: y } = e;
      const last = prev;
      prev = { x, y, t: now };
      // A pause or a jump (the pointer re-entering the window) starts a fresh
      // stroke: one cell, not a line drawn across the gap.
      const joined = last && now - last.t <= STROKE_GAP_MS && Math.hypot(x - last.x, y - last.y) <= JUMP_PX;
      const from = joined ? last : { x, y, t: now };
      const length = Math.hypot(x - from.x, y - from.y);
      const steps = cellsAlong(inverse, from.x, from.y, x, y);

      steps.forEach((step, i) => {
        const key = flashKey(step.cell);
        // Still over the cell the last event ended in: it is already lit.
        if (i === 0 && key === lastKey) return;
        const held = flashes.get(key);
        const level = held ? flashLevel(now - held.t0, held.from) : 0;
        flashes.set(key, {
          cell: step.cell,
          // A cell hit again while still glowing keeps its colour and rises from
          // the level it has, so it neither changes hue nor dips first.
          colour: held && level > 0 ? held.colour : rampColour(colours, travel + step.t * length),
          // Back-dated along the stroke, so a fast sweep leaves a tail that
          // fades from its oldest cell.
          t0: now - (1 - step.t) * (now - from.t),
          from: level,
        });
      });
      travel += length;
      const end = steps.at(-1);
      lastKey = end ? flashKey(end.cell) : -1;
      if (flashes.size > 0 && !frame) frame = requestAnimationFrame(draw);
    };

    // Observe the canvas, not the window: while a page-enter transform is on an
    // ancestor the fixed layer is as tall as the page, and it only takes the
    // viewport's size once that ends, with no window `resize` to say so (found
    // in the browser: a 16040px-tall backing store). It also fires on first layout.
    const size = new ResizeObserver(resize);
    size.observe(canvas);
    // The line colours are tokens that change with the theme.
    const theme = new MutationObserver(repaint);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    if (!reduced) window.addEventListener("pointermove", onMove);

    return () => {
      size.disconnect();
      window.removeEventListener("pointermove", onMove);
      theme.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [colours, reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="landing-boxes pointer-events-none fixed inset-0 -z-1 h-full w-full"
    />
  );
}
