"use client";

import { useEffect, useRef } from "react";
import {
  CELL_H,
  CELL_W,
  cellAt,
  flashAlpha,
  flashKey,
  gridTransform,
  invert,
  pickColour,
  visibleCells,
  type Affine,
  type Cell,
} from "@/lib/landing/boxesGrid";
import { useMediaQuery } from "@/lib/useMediaQuery";

/** Device pixels past 2x add cost, not sharpness, on hairlines. */
const MAX_DPR = 2;
/** Half the length of a "+" mark's arm, in grid pixels (the original's are 12px across). */
const PLUS_ARM = 6;

type Flash = { cell: Cell; colour: string; t0: number };

/**
 * The landing page's backdrop: Aceternity's Background Boxes as one canvas
 * (owner, 2026-09-21; spec 2026-09-21-landing-boxes-backdrop-design.md). The
 * grid is drawn once per size or theme change to an offscreen layer; a hovered
 * cell flashes a random family colour and fades, and that fade is the only
 * thing that runs frames, so an idle page runs none.
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
    let lastKey = -1;

    const paintLayer = () => {
      const off = document.createElement("canvas");
      off.width = canvas.width;
      off.height = canvas.height;
      const g = off.getContext("2d");
      const range = visibleCells(inverse, width, height);
      if (!g || !range) return off;
      g.setTransform(dpr * m[0], dpr * m[1], dpr * m[2], dpr * m[3], dpr * m[4], dpr * m[5]);
      g.strokeStyle = getComputedStyle(canvas).color;
      g.lineWidth = 1;
      g.beginPath();
      for (let c = range.col0; c <= range.col1 + 1; c++) {
        g.moveTo(c * CELL_W, range.row0 * CELL_H);
        g.lineTo(c * CELL_W, (range.row1 + 1) * CELL_H);
      }
      for (let r = range.row0; r <= range.row1 + 1; r++) {
        g.moveTo(range.col0 * CELL_W, r * CELL_H);
        g.lineTo((range.col1 + 1) * CELL_W, r * CELL_H);
      }
      // A "+" on every second corner of every second column, as the original.
      for (let c = range.col0 + (range.col0 % 2); c <= range.col1; c += 2) {
        for (let r = range.row0 + (range.row0 % 2); r <= range.row1; r += 2) {
          const x = c * CELL_W;
          const y = r * CELL_H;
          g.moveTo(x - PLUS_ARM, y);
          g.lineTo(x + PLUS_ARM, y);
          g.moveTo(x, y - PLUS_ARM);
          g.lineTo(x, y + PLUS_ARM);
        }
      }
      g.stroke();
      return off;
    };

    const draw = (now: number) => {
      frame = 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Flashes first, so the hairlines stay visible on top of a lit cell.
      ctx.setTransform(dpr * m[0], dpr * m[1], dpr * m[2], dpr * m[3], dpr * m[4], dpr * m[5]);
      const peak = Number.parseFloat(getComputedStyle(canvas).getPropertyValue("--boxes-flash-alpha")) || 0;
      for (const [key, flash] of flashes) {
        const alpha = flashAlpha(now - flash.t0);
        if (alpha === 0) {
          flashes.delete(key);
          continue;
        }
        ctx.globalAlpha = peak * alpha;
        ctx.fillStyle = flash.colour;
        ctx.fillRect(flash.cell.col * CELL_W, flash.cell.row * CELL_H, CELL_W, CELL_H);
      }
      ctx.globalAlpha = 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (layer) ctx.drawImage(layer, 0, 0);
      if (flashes.size > 0) frame = requestAnimationFrame(draw);
    };

    const repaint = () => {
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
      const cell = cellAt(inverse, e.clientX, e.clientY);
      const key = cell ? flashKey(cell) : -1;
      if (!cell || key === lastKey) {
        lastKey = key;
        return;
      }
      lastKey = key;
      flashes.set(key, { cell, colour: pickColour(colours, Math.random), t0: performance.now() });
      if (!frame) frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    // The hairline colour is a token that changes with the theme.
    const theme = new MutationObserver(repaint);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    if (!reduced) window.addEventListener("pointermove", onMove);

    return () => {
      window.removeEventListener("resize", resize);
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
