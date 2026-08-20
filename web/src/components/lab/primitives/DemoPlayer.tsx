"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FC } from "react";
import { cn } from "@/lib/utils";
import type { DemoStep, PatternDemoModule } from "@/lib/visual/types";

export type DemoSpeed = 0.5 | 1 | 2;

export interface DemoPlayerProps {
  /** Full demo module (preferred by PatternLab) */
  demo?: PatternDemoModule;
  steps?: DemoStep[];
  StepView?: FC<{ step: number; accent: string }>;
  StaticFrame?: FC<{ accent: string }>;
  accent: string;
  className?: string;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function DemoPlayer({
  demo,
  steps: stepsProp,
  StepView: StepViewProp,
  StaticFrame: StaticFrameProp,
  accent,
  className,
}: DemoPlayerProps) {
  const steps = demo?.steps ?? stepsProp ?? [];
  const StepView = demo?.StepView ?? StepViewProp;
  const StaticFrame = demo?.StaticFrame ?? StaticFrameProp;
  const microExample = demo?.microExample;

  const last = Math.max(0, steps.length - 1);
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(() => (reduced ? last : 0));
  const [speed, setSpeed] = useState<DemoSpeed>(1);
  const [playing, setPlaying] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const liveId = useId();

  useEffect(() => {
    if (reduced) {
      setStep(last);
      setPlaying(false);
    }
  }, [reduced, last]);

  const go = useCallback(
    (next: number) => setStep(Math.min(last, Math.max(0, next))),
    [last],
  );

  const back = useCallback(() => {
    setPlaying(false);
    go(step - 1);
  }, [go, step]);

  const forward = useCallback(() => {
    if (step >= last) {
      setPlaying(false);
      return;
    }
    go(step + 1);
  }, [go, step, last]);

  const reset = useCallback(() => {
    setPlaying(false);
    go(reduced ? last : 0);
  }, [go, last, reduced]);

  useEffect(() => {
    if (!playing || reduced) return;
    if (step >= last) {
      setPlaying(false);
      return;
    }
    const ms = 1400 / speed;
    const id = window.setTimeout(() => go(step + 1), ms);
    return () => window.clearTimeout(id);
  }, [playing, step, speed, last, go, reduced]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (reduced) {
          forward();
          return;
        }
        setPlaying((p) => !p);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setPlaying(false);
        forward();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      }
    };

    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [back, forward, reduced]);

  const caption = steps[step]?.caption ?? "";
  const announce = steps[step]?.announce ?? caption;

  if (!StepView) return null;

  const showStatic = reduced && StaticFrame;

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      className={cn(
        "flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--family-accent)]/40",
        className,
      )}
      style={{ ["--lab-speed" as string]: String(speed) }}
      aria-label="Pattern demonstration player"
    >
      {microExample ? (
        <p className="mb-2 font-mono text-[11px] text-muted">{microExample}</p>
      ) : null}

      <div
        className="lab-theater lab-motion flex flex-1 items-center justify-center overflow-hidden rounded-[length:var(--radius-xl)] border border-border bg-background/60 px-3 py-4"
        style={{ transitionDuration: `${320 / speed}ms` }}
      >
        {showStatic ? (
          <StaticFrame accent={accent} />
        ) : (
          <StepView step={step} accent={accent} />
        )}
      </div>

      <p
        id={liveId}
        className="mt-3 min-h-10 text-center text-sm leading-snug text-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="mr-2 font-mono text-[11px] tabular-nums text-muted">
          {step + 1}/{steps.length}
        </span>
        {caption}
      </p>
      <span className="sr-only" aria-live="assertive">
        {announce}
      </span>

      <div className="print:hidden mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={back}
            disabled={step <= 0}
            className="h-8 rounded-[length:var(--radius-md)] border border-border px-3 text-xs font-medium disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              forward();
            }}
            disabled={step >= last}
            className="h-8 rounded-[length:var(--radius-md)] bg-pop px-3 text-xs font-medium text-on-pop disabled:opacity-40"
          >
            Step
          </button>
          <button
            type="button"
            onClick={reset}
            className="h-8 rounded-[length:var(--radius-md)] border border-border px-3 text-xs font-medium"
          >
            Reset
          </button>
        </div>
        <div
          className="flex items-center gap-1 text-[11px] text-muted"
          role="group"
          aria-label="Playback speed"
        >
          <span>Speed</span>
          {([0.5, 1, 2] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className="rounded-[length:var(--radius-md)] border border-border px-1.5 py-0.5 font-mono"
              style={
                speed === s ? { borderColor: accent, color: accent } : undefined
              }
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
