import { HEAT_WEEKS, type HeatYear } from "@/lib/landing/heat";
import { HEAT } from "@/lib/landing/story";
import { cn } from "@/lib/utils";

const CELL = 12;
const STEP = 15;
const LEFT = 30;
const TOP = 20;
const WIDTH = LEFT + HEAT_WEEKS * STEP;
const HEIGHT = TOP + 7 * STEP;
/** Delay per column, so the year fills in left to right (~0.7s end to end). */
const SWEEP_MS = 14;

// Literal class names per level: Tailwind only generates classes it can read.
const FILL = ["fill-heat-0", "fill-heat-1", "fill-heat-2", "fill-heat-3", "fill-heat-4"] as const;
const SWATCH = ["bg-heat-0", "bg-heat-1", "bg-heat-2", "bg-heat-3", "bg-heat-4"] as const;
const WEEKDAY_LABELS = [
  { row: 1, label: "Mon" },
  { row: 3, label: "Wed" },
  { row: 5, label: "Fri" },
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
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`${summary}.`}
          data-lit={lit || undefined}
          className="h-auto w-full min-w-[40rem]"
        >
          {year.months.map(({ week, label }) => (
            <text key={`m-${week}`} x={LEFT + week * STEP} y={10} dominantBaseline="central" className="fill-muted font-sans text-[10px]">
              {label}
            </text>
          ))}
          {WEEKDAY_LABELS.map(({ row, label }) => (
            <text key={label} x={0} y={TOP + row * STEP + CELL / 2} dominantBaseline="central" className="fill-muted font-sans text-[10px]">
              {label}
            </text>
          ))}
          {year.weeks.map((days, w) =>
            days.map((day, d) =>
              day ? (
                <rect
                  key={day.date}
                  x={LEFT + w * STEP}
                  y={TOP + d * STEP}
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
