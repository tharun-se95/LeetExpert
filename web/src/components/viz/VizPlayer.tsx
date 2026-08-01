"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { MotionConfig, useReducedMotion } from "motion/react";
import { ArrowsOut as Maximize2, ArrowsIn as Minimize2, Pause, Play, ArrowCounterClockwise as RotateCcw, SkipBack as StepBack, SkipForward as StepForward } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { CodePanel } from "@/components/viz/CodePanel";
import type { VizCode, VizStep } from "@/components/viz/types";
import { useVizChrome } from "@/components/viz/vizChrome";
import { familyCssVars, getFamilyTheme } from "@/lib/visual/familyTheme";
import type { FamilyId } from "@/lib/content/manifest";

export interface VizRenderCtx {
  /** Honor prefers-reduced-motion: jump, don't tween */
  reduced: boolean;
  /** Index of the step being rendered */
  index: number;
}

/**
 * Shared shell for every algorithm tracer: play/pause, step, reset, scrub,
 * step counter, caption, and the code pane whose line highlight moves in
 * lockstep. Vizzes hand it precomputed steps and a snapshot renderer —
 * the player owns all timing.
 *
 * The expand toggle promotes this same element to a fullscreen overlay
 * (pure CSS switch — no portal/remount, so the trace position survives).
 */
export function VizPlayer<S>({
  code,
  steps,
  speedMs = 900,
  autoPlay = false,
  label,
  family,
  children,
}: {
  code: VizCode;
  steps: VizStep<S>[];
  /** Autoplay interval per step, from the fence JSON */
  speedMs?: number;
  /**
   * Start playing on mount when motion is allowed. Used by the landing
   * hero — lesson embeds stay click-to-play so they don't surprise readers.
   */
  autoPlay?: boolean;
  /** Accessible name for the whole player */
  label: string;
  /**
   * Algorithm family this tracer belongs to — drives the stage's accent
   * color and background motif. Omit to fall back to generic --accent
   * (every consumer already reads `var(--family-accent, var(--accent))`).
   */
  family?: FamilyId;
  children: (state: S, ctx: VizRenderCtx) => ReactNode;
}) {
  const last = Math.max(0, steps.length - 1);
  const reduced = useReducedMotion() ?? false;
  const { embedded } = useVizChrome();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const liveId = useId();

  useEffect(() => {
    if (autoPlay && !reduced) setPlaying(true);
  }, [autoPlay, reduced]);

  const go = useCallback(
    (next: number) => setIndex(Math.min(last, Math.max(0, next))),
    [last],
  );

  const back = useCallback(() => {
    setPlaying(false);
    go(index - 1);
  }, [go, index]);

  const forward = useCallback(() => {
    setPlaying(false);
    go(index + 1);
  }, [go, index]);

  const reset = useCallback(() => {
    setPlaying(false);
    go(0);
  }, [go]);

  const togglePlay = useCallback(() => {
    setPlaying((p) => {
      if (!p && index >= last) {
        // Play from the end restarts the trace.
        setIndex(0);
      }
      return !p;
    });
  }, [index, last]);

  useEffect(() => {
    if (!playing) return;
    if (index >= last) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => go(index + 1), speedMs);
    return () => window.clearTimeout(id);
  }, [playing, index, last, go, speedMs]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        forward();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [togglePlay, forward, back]);

  // Fullscreen mode: Escape closes, page scroll locks behind the overlay.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    rootRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [expanded]);

  if (steps.length === 0) return null;
  const step = steps[index];

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={rootRef}
        tabIndex={0}
        aria-label={label}
        style={family ? familyCssVars(family) : undefined}
        {...(expanded ? { role: "dialog", "aria-modal": true } : {})}
        className={cn(
          "print:hidden flex flex-col border-border outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          expanded
            ? "fixed inset-0 z-50 overflow-y-auto border-0 bg-background px-4 py-6 sm:px-8"
            : embedded
              ? "w-full bg-transparent"
              : "elevated-card my-6 w-full overflow-hidden rounded-[length:var(--radius-md)] border border-border bg-surface ring-1 ring-accent/20",
        )}
      >
        {!expanded && !embedded ? (
          <div className="poster-roof shrink-0" aria-hidden />
        ) : null}
        <div
          className={cn(
            "flex w-full flex-col",
            expanded && "mx-auto max-w-5xl flex-1 justify-center sm:justify-start sm:pt-[10vh]",
          )}
        >
          <div
            className={cn(
              "grid gap-3",
              embedded ? "p-0" : "p-3.5",
              // Fullscreen: code column capped. Landing embed: equal tracks so
              // the stage is not crushed beside a 34rem code pane.
              expanded &&
                "md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)]",
              embedded && "md:grid-cols-2",
            )}
          >
            <div
              data-motif={family ? getFamilyTheme(family).motif : undefined}
              className={cn(
                "viz-stage flex min-w-0 items-center justify-center overflow-x-auto px-3 py-5",
                "rounded-[length:var(--radius-sm)] border border-border",
                expanded || embedded
                  ? "min-h-56 md:min-h-64 md:order-1"
                  : "order-1",
              )}
            >
              {children(step.state, { reduced, index })}
            </div>
            <div
              className={cn(
                "min-w-0",
                expanded || embedded ? "md:order-2" : "order-2",
              )}
            >
              <CodePanel
                code={code}
                line={step.line}
                reduced={reduced}
                large={expanded}
                flush={embedded}
              />
            </div>
          </div>

          <p
            id={liveId}
            aria-live="polite"
            aria-atomic="true"
            className={cn(
              "min-h-12 border-t border-border bg-code/40 px-4 py-3 leading-snug text-foreground",
              expanded ? "text-base" : "text-sm",
            )}
          >
            <span className="mr-2 font-mono text-[11px] tabular-nums text-accent">
              step {index + 1} / {steps.length}
            </span>
            {step.caption}
          </p>

          <div
            className={cn(
              "flex flex-wrap items-center gap-2 bg-surface px-3.5 py-3",
              expanded ? "mt-2" : "border-t border-border",
            )}
          >
            <div className="flex items-center gap-1">
              <PlayerButton onClick={back} disabled={index <= 0} ariaLabel="Step back">
                <StepBack className="h-3.5 w-3.5" />
              </PlayerButton>
              <PlayerButton onClick={togglePlay} ariaLabel={playing ? "Pause" : "Play"} primary>
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </PlayerButton>
              <PlayerButton onClick={forward} disabled={index >= last} ariaLabel="Step forward">
                <StepForward className="h-3.5 w-3.5" />
              </PlayerButton>
              <PlayerButton onClick={reset} disabled={index === 0 && !playing} ariaLabel="Reset">
                <RotateCcw className="h-3.5 w-3.5" />
              </PlayerButton>
            </div>
            <input
              type="range"
              min={0}
              max={last}
              value={index}
              onChange={(e) => {
                setPlaying(false);
                go(Number(e.target.value));
              }}
              aria-label="Scrub through steps"
              aria-valuetext={`Step ${index + 1} of ${steps.length}: ${step.caption}`}
              className="h-1.5 min-w-24 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-[var(--accent)]"
            />
            <PlayerButton
              onClick={() => setExpanded((e) => !e)}
              ariaLabel={expanded ? "Exit fullscreen" : "Expand to fullscreen"}
            >
              {expanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </PlayerButton>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

function PlayerButton({
  onClick,
  disabled,
  ariaLabel,
  primary,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
  primary?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg border text-foreground transition disabled:opacity-40",
        primary
          ? "border-pop bg-pop text-on-pop hover:opacity-90"
          : "border-border hover:bg-surface",
      )}
    >
      {children}
    </button>
  );
}
