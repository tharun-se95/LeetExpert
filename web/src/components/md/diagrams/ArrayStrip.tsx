"use client";

/**
 * Shared geometry for the array-strip diagrams in the arrays module: a row
 * of cells tinted by region, a labelled bracket above each region, and
 * pointer markers below.
 *
 * Deliberately NOT registered in DIAGRAM_REGISTRY — this is an
 * implementation detail of the diagrams that compose it, not something a
 * markdown `diagram` fence can reach.
 */

/**
 * done — settled, will not change again (accent)
 * dead — already processed and discarded (dashed, faded)
 * open — not yet reached (plain surface)
 */
export type RegionTone = "done" | "dead" | "open";

export interface StripRegion {
  /** inclusive */
  from: number;
  /** exclusive */
  to: number;
  tone: RegionTone;
  label?: string;
}

export interface StripMarker {
  /** cell index the pointer refers to; `size` means "past the end" */
  at: number;
  label: string;
}

export const CELL_W = 32;
export const CELL_H = 30;
export const CELL_GAP = 4;
/** vertical room a region bracket + its label needs above the cells */
export const BRACKET_BAND = 30;
/** vertical room a pointer marker + its label needs below the cells */
export const MARKER_BAND = 28;

export function stripWidth(size: number): number {
  return size <= 0 ? 0 : size * CELL_W + (size - 1) * CELL_GAP;
}

function cellX(index: number): number {
  return index * (CELL_W + CELL_GAP);
}

function cellCenterX(index: number, size: number): number {
  if (index >= size) return stripWidth(size) + CELL_GAP + CELL_W / 2;
  return cellX(index) + CELL_W / 2;
}

const TONE: Record<
  RegionTone,
  { fill: string; opacity: number; stroke: string; dash?: string }
> = {
  done: { fill: "var(--family-accent, var(--accent))", opacity: 0.85, stroke: "none" },
  dead: {
    fill: "var(--surface)",
    opacity: 0.5,
    stroke: "var(--border)",
    dash: "3 3",
  },
  open: { fill: "var(--surface)", opacity: 1, stroke: "var(--border)" },
};

function toneOf(index: number, regions: StripRegion[]): RegionTone {
  for (const r of regions) {
    if (index >= r.from && index < r.to) return r.tone;
  }
  return "open";
}

interface ArrayStripProps {
  size: number;
  regions: StripRegion[];
  markers?: StripMarker[];
  /** optional text inside each cell; omit for abstract region diagrams */
  values?: (string | number)[];
  /** cells to outline as the pair being acted on this step */
  active?: number[];
  x?: number;
  y?: number;
}

/**
 * Renders into a <g>; the caller owns the <svg> and its viewBox. `y` is the
 * top of the CELL row — brackets are drawn above it, markers below.
 */
export function ArrayStrip({
  size,
  regions,
  markers = [],
  values,
  active = [],
  x = 0,
  y = 0,
}: ArrayStripProps) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* region brackets, above the cells */}
      {regions.map((region, i) => {
        if (region.to <= region.from || !region.label) return null;
        const left = cellX(region.from);
        const right = cellX(region.to - 1) + CELL_W;
        const mid = (left + right) / 2;
        const lineY = -10;
        const isDone = region.tone === "done";
        const stroke = isDone ? "var(--family-accent, var(--accent))" : "var(--muted)";
        return (
          <g key={`bracket-${i}`}>
            <path
              d={`M ${left} ${lineY - 4} L ${left} ${lineY} L ${right} ${lineY} L ${right} ${lineY - 4}`}
              fill="none"
              stroke={stroke}
              strokeWidth={1.25}
              strokeOpacity={0.7}
            />
            <text
              x={mid}
              y={lineY - 9}
              fontSize={10}
              fontWeight={600}
              fill={stroke}
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {region.label}
            </text>
          </g>
        );
      })}

      {/* cells */}
      {Array.from({ length: size }, (_, i) => {
        const tone = TONE[toneOf(i, regions)];
        const isActive = active.includes(i);
        const value = values?.[i];
        return (
          <g key={`cell-${i}`}>
            <rect
              x={cellX(i)}
              y={0}
              width={CELL_W}
              height={CELL_H}
              rx={4}
              fill={tone.fill}
              fillOpacity={tone.opacity}
              stroke={isActive ? "var(--family-accent, var(--accent))" : tone.stroke}
              strokeWidth={isActive ? 2 : 1.25}
              strokeDasharray={isActive ? undefined : tone.dash}
            />
            {value !== undefined ? (
              <text
                x={cellX(i) + CELL_W / 2}
                y={CELL_H / 2}
                fontSize={12}
                fontWeight={600}
                fill={
                  toneOf(i, regions) === "done"
                    ? "var(--background)"
                    : "var(--foreground)"
                }
                fillOpacity={toneOf(i, regions) === "dead" ? 0.55 : 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="var(--font-mono), monospace"
              >
                {value}
              </text>
            ) : null}
          </g>
        );
      })}

      {/* pointer markers, below the cells */}
      {markers.map((marker) => {
        const mx = cellCenterX(marker.at, size);
        const top = CELL_H + 4;
        return (
          <g key={`marker-${marker.label}`}>
            <path
              d={`M ${mx} ${top} l -4 5 l 8 0 Z`}
              fill="var(--family-accent, var(--accent))"
              transform={`rotate(180, ${mx}, ${top + 3})`}
            />
            <text
              x={mx}
              y={top + 17}
              fontSize={10}
              fontWeight={700}
              fill="var(--family-accent, var(--accent))"
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {marker.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}
