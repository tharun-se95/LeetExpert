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
  embedded = false,
  className,
}: {
  insight: ResolvedInsight;
  /** Tighter layout for mobile Code tab. */
  compact?: boolean;
  /** Fill a parent tab — no local collapse chrome. */
  embedded?: boolean;
  className?: string;
}) {
  const panelId = useId();
  const [collapsed, setCollapsed] = useState(true);

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

  const caseVars = insight.variables.filter((v) => v.provenance === "case");
  const runVars = insight.variables.filter((v) => v.provenance === "run");

  if (embedded) {
    return (
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3",
          className,
        )}
      >
        <LearnerInsight
          insight={insight}
          caseVars={caseVars}
          runVars={runVars}
        />
      </div>
    );
  }

  if (!hasBody) return null;

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
          className="inline-flex min-h-8 touch-manipulation items-center gap-1 rounded-[length:var(--radius-xs)] px-1 text-[0.65rem] font-semibold tracking-wide text-muted uppercase transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
            <span className="text-info">{insight.complexity.time}</span>
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
        <InsightBody
          insight={insight}
          compact={compact}
          caseVars={caseVars}
          runVars={runVars}
        />
      </div>
    </div>
  );
}

function LearnerInsight({
  insight,
  caseVars,
  runVars,
}: {
  insight: ResolvedInsight;
  caseVars: ResolvedInsight["variables"];
  runVars: ResolvedInsight["variables"];
}) {
  const hasAnything =
    insight.complexity ||
    insight.checklist.length > 0 ||
    insight.memory ||
    caseVars.length > 0 ||
    runVars.length > 0;

  if (!hasAnything) {
    return (
      <p className="text-sm text-muted">
        Run the tests, then come back here. Insight explains the target speed
        and what this case looks like in memory — it does not write the
        solution.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {insight.complexity ? (
        <section>
          <h3 className="text-[0.7rem] font-semibold tracking-wide text-muted uppercase">
            How fast it should be
          </h3>
          <p className="mt-1 text-sm text-foreground">
            Aim for{" "}
            <span className="font-mono text-info">
              {insight.complexity.time}
            </span>{" "}
            time and{" "}
            <span className="font-mono text-info">
              {insight.complexity.space}
            </span>{" "}
            extra memory.
          </p>
          {insight.complexity.why ? (
            <p className="mt-1 text-sm leading-snug text-muted">
              {insight.complexity.why}
            </p>
          ) : null}
        </section>
      ) : null}

      {insight.memory ? (
        <section>
          <h3 className="text-[0.7rem] font-semibold tracking-wide text-muted uppercase">
            This test case
          </h3>
          <div className="mt-2">
            <MemoryStrip memory={insight.memory} />
          </div>
        </section>
      ) : null}

      {caseVars.length > 0 || runVars.length > 0 ? (
        <section>
          <h3 className="text-[0.7rem] font-semibold tracking-wide text-muted uppercase">
            {runVars.length > 0
              ? "This case and your last run"
              : "This test case"}
          </h3>
          <dl className="mt-1.5 flex flex-col gap-1 font-mono text-[0.75rem]">
            {caseVars.map((v) => (
              <div key={`case-${v.name}`} className="flex gap-2">
                <dt className="shrink-0 text-muted">{v.name}</dt>
                <dd className="min-w-0 break-all text-foreground">{v.value}</dd>
              </div>
            ))}
            {runVars.map((v) => (
              <div key={`run-${v.name}`} className="flex gap-2">
                <dt className="shrink-0 text-muted">
                  {v.name === "status" ? "result" : v.name}
                </dt>
                <dd
                  className={cn(
                    "min-w-0 break-all",
                    v.name === "status"
                      ? v.value === "passed"
                        ? "text-good"
                        : "text-bad"
                      : "text-foreground",
                  )}
                >
                  {v.name === "status"
                    ? v.value === "passed"
                      ? "passed"
                      : "failed"
                    : v.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {insight.checklist.length > 0 ? (
        <section>
          <h3 className="text-[0.7rem] font-semibold tracking-wide text-muted uppercase">
            What to watch for
          </h3>
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-foreground">
            {insight.checklist.map((item) => (
              <li key={item.label}>{item.label}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function InsightBody({
  insight,
  compact,
  caseVars,
  runVars,
}: {
  insight: ResolvedInsight;
  compact: boolean;
  caseVars: ResolvedInsight["variables"];
  runVars: ResolvedInsight["variables"];
}) {
  return (
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
          <ul className="flex flex-wrap gap-1" aria-label="Pattern checklist">
            {insight.checklist.map((item) => (
              <li
                key={item.label}
                className={cn(
                  "rounded-[length:var(--radius-xs)] border px-1.5 py-0.5 text-[0.65rem] leading-snug",
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
  );
}
