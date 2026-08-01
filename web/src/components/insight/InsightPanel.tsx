"use client";

import { useEffect, useId, useState } from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { TONE_CHIP } from "@/components/cheatsheet/tone";
import { MemoryStrip } from "@/components/insight/MemoryStrip";
import type { ResolvedInsight } from "@/lib/insight/types";

const COLLAPSE_KEY = "dsa:insight:collapsed";

/**
 * Compact teaching strip between editor and testcases.
 * Case-bound schematic — not a live debugger.
 */
export function InsightPanel({
  insight,
  compact = false,
  className,
}: {
  insight: ResolvedInsight;
  /** Tighter layout for mobile Code tab. */
  compact?: boolean;
  className?: string;
}) {
  const panelId = useId();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* private mode */
    }
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const hasBody =
    insight.complexity ||
    insight.checklist.length > 0 ||
    insight.memory ||
    insight.variables.length > 0;

  if (!hasBody) return null;

  const caseVars = insight.variables.filter((v) => v.provenance === "case");
  const runVars = insight.variables.filter((v) => v.provenance === "run");

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col border-b border-border bg-surface",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-2.5 py-1">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-controls={panelId}
          className="inline-flex min-h-8 touch-manipulation items-center gap-1 rounded px-1 text-[0.65rem] font-semibold tracking-wide text-muted uppercase transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {collapsed ? (
            <CaretDown size={11} weight="bold" aria-hidden />
          ) : (
            <CaretUp size={11} weight="bold" aria-hidden />
          )}
          Insight
        </button>

        {insight.complexity ? (
          <div className="flex items-center gap-1.5 font-mono text-[0.68rem]">
            <span className="text-accent">{insight.complexity.time}</span>
            <span className="text-border">·</span>
            <span className="text-info">{insight.complexity.space}</span>
            <span className="hidden text-muted sm:inline">
              {insight.complexity.source === "lesson" ? "target" : "typical"}
            </span>
          </div>
        ) : null}

        <span className="ml-auto hidden font-mono text-[0.6rem] tracking-wide text-muted/80 uppercase sm:inline">
          Case-bound
        </span>
      </div>

      <div
        id={panelId}
        hidden={collapsed}
        className={cn(
          "min-h-0 overflow-y-auto border-t border-border/70",
          compact ? "max-h-40 px-2.5 py-2" : "max-h-[11rem] px-2.5 py-2",
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-2",
            !compact && "lg:flex-row lg:items-start lg:gap-4",
          )}
        >
          {insight.memory ? (
            <div className="min-w-0 lg:min-w-[12rem] lg:flex-1">
              <MemoryStrip memory={insight.memory} />
            </div>
          ) : null}

          <div
            className={cn(
              "flex min-w-0 flex-col gap-1.5",
              insight.memory ? "lg:w-[42%] lg:shrink-0" : "w-full",
            )}
          >
            {(caseVars.length > 0 || runVars.length > 0) && (
              <dl className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 font-mono text-[0.68rem]">
                {[...caseVars, ...runVars].map((v) => (
                  <div
                    key={`${v.provenance}-${v.name}`}
                    className="flex min-w-0 max-w-full items-baseline gap-1.5"
                  >
                    <dt className="shrink-0 text-muted">{v.name}</dt>
                    <dd
                      className={cn(
                        "min-w-0 truncate",
                        v.name === "status"
                          ? v.value === "passed"
                            ? "text-good"
                            : "text-bad"
                          : "text-foreground",
                      )}
                      title={v.value}
                    >
                      {v.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {insight.checklist.length > 0 ? (
              <ul
                className="flex flex-wrap gap-1"
                aria-label="Pattern checklist"
              >
                {insight.checklist.map((item) => (
                  <li
                    key={item.label}
                    className={cn(
                      "rounded border px-1.5 py-0.5 text-[0.65rem] leading-snug",
                      item.tone ? TONE_CHIP[item.tone] : TONE_CHIP.muted,
                    )}
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
            ) : null}

            {insight.complexity?.why ? (
              <p className="line-clamp-2 text-[0.65rem] leading-snug text-muted">
                {insight.complexity.why}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
