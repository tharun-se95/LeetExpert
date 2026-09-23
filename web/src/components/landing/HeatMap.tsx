import { HEAT_WEEKS, type HeatYear } from "@/lib/landing/heat";
import { HEAT } from "@/lib/landing/story";
import { cn } from "@/lib/utils";

const CELL = 12;
const STEP = 15;
/** The squares only: the labels are HTML beside them, so they never scale with it. */
const WIDTH = HEAT_WEEKS * STEP - (STEP - CELL);
const HEIGHT = 7 * STEP - (STEP - CELL);
/** Delay per column, so the year fills in left to right (~0.7s end to end). */
const SWEEP_MS = 14;

// Literal class names per level: Tailwind only generates classes it can read.
const FILL = ["fill-heat-0", "fill-heat-1", "fill-heat-2", "fill-heat-3", "fill-heat-4"] as const;
const SWATCH = ["bg-heat-0", "bg-heat-1", "bg-heat-2", "bg-heat-3", "bg-heat-4"] as const;
/** Wed drops out on a narrow card, where three labels over seven thin rows would touch. */
const WEEKDAY_LABELS = [
  { row: 1, label: "Mon", narrow: true },
  { row: 3, label: "Wed", narrow: false },
  { row: 5, label: "Fri", narrow: true },
] as const;

/** Shows every square when scripts never run (squares start hidden until `lit`). */
export const HEAT_NOSCRIPT = ".heat-cell{opacity:1!important}";

export function heatSummary(year: HeatYear): string {
  return `${HEAT.example}: ${year.activeDays} days practised, longest streak ${year.longestStreak} days`;
}

/**
 * The credits section's heat map. Squares fade in column by column once `lit`
 * (the section has snapped into view); the fade is CSS on one attribute, so
 * lighting the year costs one render, not 364 animations driven from React.
 * Colour is the --heat-* ramp, scoped to this component (CLAUDE.md §4).
 * Reduced motion shows the year already lit.
 */
export function HeatMap({ year, lit, className }: { year: HeatYear; lit: boolean; className?: string }) {
  const summary = heatSummary(year);

  return (
    <div className={cn("rounded-[length:var(--radius-lg)] border border-border bg-elevated p-5 shadow-elevation md:p-8", className)}>
      <noscript>
        <style>{HEAT_NOSCRIPT}</style>
      </noscript>
      {/*
        The whole year always fits the card (owner, 2026-09-24): no sideways
        scroller, and the labels are HTML at a real 12px beside the squares.
        Drawn inside the scaled SVG they came out at 6.5-8px. On a narrow card
        every other month is named, so the labels never run together.
      */}
      <div className="@container grid grid-cols-[auto_minmax(0,1fr)] gap-x-2">
        <span aria-hidden />
        <div aria-hidden className="relative mb-1 h-4 text-xs leading-4 text-muted">
          {year.months.map(({ week, label }, i) => (
            <span
              key={`m-${week}`}
              className={cn("absolute top-0", i % 2 === 1 && "hidden @md:inline")}
              style={{ left: `${((week * STEP) / WIDTH) * 100}%` }}
            >
              {label}
            </span>
          ))}
        </div>
        <div aria-hidden className="grid grid-rows-7 text-xs leading-none text-muted">
          {WEEKDAY_LABELS.map(({ row, label, narrow }) => (
            <span
              key={label}
              className={cn("flex items-center", !narrow && "hidden @md:flex")}
              style={{ gridRow: row + 1 }}
            >
              {label}
            </span>
          ))}
        </div>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`${summary}.`}
          data-lit={lit || undefined}
          className="block h-auto w-full"
        >
          {year.weeks.map((days, w) =>
            days.map((day, d) =>
              day ? (
                <rect
                  key={day.date}
                  x={w * STEP}
                  y={d * STEP}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  data-date={day.date}
                  data-level={day.level}
                  className={cn("heat-cell", FILL[day.level])}
                  style={{ transitionDelay: `${w * SWEEP_MS}ms` }}
                />
              ) : null,
            ),
          )}
        </svg>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <p>{summary}</p>
        <div className="flex items-center gap-1.5" aria-hidden>
          <span>Less</span>
          {SWATCH.map((swatch) => (
            <span key={swatch} className={cn("h-3 w-3 rounded-[length:var(--radius-xs)]", swatch)} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
