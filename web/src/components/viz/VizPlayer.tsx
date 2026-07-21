"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { MotionConfig, useReducedMotion } from "motion/react";
import {
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  StepBack,
  StepForward,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CodePanel } from "@/components/viz/CodePanel";
import type { VizCode, VizStep } from "@/components/viz/types";

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
  label,
  children,
}: {
  code: VizCode;
  steps: VizStep<S>[];
  /** Autoplay interval per step, from the fence JSON */
  speedMs?: number;
  /** Accessible name for the whole player */
  label: string;
  children: (state: S, ctx: VizRenderCtx) => ReactNode;
}) {
  const last = Math.max(0, steps.length - 1);
  const reduced = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const liveId = useId();

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
        {...(expanded ? { role: "dialog", "aria-modal": true } : {})}
        className={cn(
          "print:hidden flex flex-col border-border bg-surface/40 outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          expanded
            ? "fixed inset-0 z-50 overflow-y-auto border-0 bg-background px-4 py-6 sm:px-8"
            : "my-6 rounded-xl border md:w-[calc(100%+4rem)] md:-mx-8 lg:w-[calc(100%+8rem)] lg:-mx-16",
        )}
      >
        <div
          className={cn(
            "flex w-full flex-col",
            expanded && "mx-auto max-w-5xl flex-1 justify-center sm:justify-start sm:pt-[10vh]",
          )}
        >
          <div
            className={cn(
              "grid gap-3 p-3",
              expanded
                ? "md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)]"
                : "md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]",
            )}
          >
            {/* Code above state on mobile, beside it on desktop */}
            <div className="min-w-0 md:order-2">
              <CodePanel code={code} line={step.line} reduced={reduced} large={expanded} />
            </div>
            <div
              className={cn(
                "flex min-w-0 items-center justify-center overflow-x-auto rounded-lg border border-border bg-background/60 px-3 py-4 md:order-1",
                expanded && "min-h-64",
              )}
            >
              {children(step.state, { reduced, index })}
            </div>
          </div>

          <p
            id={liveId}
            aria-live="polite"
            aria-atomic="true"
            className={cn(
              "min-h-12 px-4 leading-snug text-foreground",
              expanded ? "text-base" : "text-sm",
            )}
          >
            <span className="mr-2 font-mono text-[11px] tabular-nums text-muted">
              step {index + 1} / {steps.length}
            </span>
            {step.caption}
          </p>

          <div
            className={cn(
              "flex flex-wrap items-center gap-2 px-3 py-2.5",
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
          ? "border-accent bg-accent text-white hover:bg-accent/90"
          : "border-border hover:bg-surface",
      )}
    >
      {children}
    </button>
  );
}
