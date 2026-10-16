"use client";

import { useState, type ReactNode } from "react";
import {
  Eye,
  EyeSlash,
  Lightbulb,
  Code,
  ShieldCheck,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface BlurRevealProps {
  label: string;
  type?: "solution" | "hint" | "default";
  defaultRevealed?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Modern frosted blur reveal card for solutions and hints.
 * Prevents spoilers via a blur overlay with an interactive reveal button,
 * and allows learners to re-blur anytime without messy nested collapse boxes.
 */
export function BlurReveal({
  label,
  type = "default",
  defaultRevealed = false,
  children,
  className,
}: BlurRevealProps) {
  const [revealed, setRevealed] = useState(defaultRevealed);

  const isHint = type === "hint" || /hint/i.test(label);
  const isSolution = type === "solution" || /solution/i.test(label);

  // Clean label for kicker subtitle
  const cleanedTitle = label
    .replace(/^(?:solution|hint\s*\d*)\s*[-—:]\s*/i, "")
    .trim();

  const primaryHeading = isHint
    ? label.match(/^Hint\s*\d*/i)?.[0] || "Hint"
    : isSolution
      ? "Reference Solution"
      : label || "Protected Content";

  return (
    <div
      className={cn(
        "group/reveal relative my-5 overflow-hidden rounded-[length:var(--radius-lg)] border transition-all duration-300",
        revealed
          ? "border-border/70 bg-surface/15"
          : "border-border/90 bg-surface/35 shadow-elevation",
        className,
      )}
    >
      {/* Top Header Bar when revealed */}
      {revealed ? (
        <div className="flex items-center justify-between border-b border-border/50 bg-surface/40 px-4 py-2.5 text-xs font-mono">
          <div className="flex items-center gap-2">
            {isHint ? (
              <Lightbulb size={15} weight="fill" className="text-warn" aria-hidden />
            ) : (
              <Code size={15} weight="bold" className="text-accent" aria-hidden />
            )}
            <span className="font-semibold uppercase tracking-wider text-foreground/90">
              {primaryHeading}
            </span>
            {cleanedTitle && cleanedTitle !== primaryHeading ? (
              <span className="hidden text-muted/80 sm:inline">
                {"// "}{cleanedTitle}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setRevealed(false)}
            className="inline-flex items-center gap-1.5 rounded-[length:var(--radius-sm)] border border-border/60 bg-surface/60 px-2.5 py-1 text-muted transition-colors hover:border-border hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent touch-manipulation cursor-pointer"
            aria-label={`Hide and blur ${label}`}
          >
            <EyeSlash size={13} weight="bold" aria-hidden />
            <span>Hide</span>
          </button>
        </div>
      ) : null}

      {/* Content wrapper with blur filter when unrevealed */}
      <div className="relative">
        <div
          aria-hidden={!revealed}
          className={cn(
            "transition-[filter,opacity] duration-300",
            revealed
              ? "p-4 sm:p-5"
              : "pointer-events-none select-none max-h-[300px] overflow-hidden p-4 sm:p-5 filter blur-[8px] opacity-25",
          )}
        >
          {children}
        </div>

        {/* Frosted Glass Overlay with Centered Reveal Trigger */}
        {!revealed ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-surface/50 backdrop-blur-[2px]">
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="group/btn relative flex items-center gap-3.5 rounded-full border border-border/90 bg-surface px-5 py-3 text-sm font-medium text-foreground shadow-elevation transition-all duration-200 hover:border-accent hover:bg-surface/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 touch-manipulation cursor-pointer"
              aria-label={`Click to reveal ${label}`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent transition-transform duration-200 group-hover/btn:scale-110">
                {isHint ? (
                  <Lightbulb size={18} weight="fill" className="text-warn" aria-hidden />
                ) : (
                  <Eye size={18} weight="bold" aria-hidden />
                )}
              </div>

              <div className="flex flex-col text-left">
                <span className="font-display text-xs font-bold tracking-tight uppercase sm:text-sm">
                  {isHint ? "Reveal Hint" : isSolution ? "Reveal Solution" : "Reveal Content"}
                </span>
                {cleanedTitle ? (
                  <span className="max-w-[200px] truncate font-mono text-[11px] text-muted sm:max-w-[300px]">
                    {"// "}{cleanedTitle}
                  </span>
                ) : (
                  <span className="font-mono text-[11px] text-muted flex items-center gap-1">
                    <ShieldCheck size={12} className="text-good" /> Click to unblur
                  </span>
                )}
              </div>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
