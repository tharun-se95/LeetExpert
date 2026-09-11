"use client";

import { Layout, Path, Tag } from "@phosphor-icons/react";

export interface CacheInvalidationScopeDiagramProps {
  /** The route path the mutation's `revalidatePath` call names. */
  path?: string;
  /** The fetch tag the shared header's data carries. */
  tag?: string;
  /** Two closing lines under the two panels. */
  caption?: [string, string];
}

/* Per-character advance estimates, used to size the viewBox from the strings
   actually rendered rather than from a guessed constant. A prior diagram in
   this course shipped a width that accounted for its node labels but not for
   its captions, and the longest caption rendered clipped off the right edge —
   so every string that appears below is fed through one of these. */
const CH_CALL = 7.3; // 12px mono, the revalidate* call
const CH_ROUTE = 7.4; // 12.5px mono semibold, a route path
/* Sans floors measured from Space Grotesk glyph advances by
   tests/diagramTextFit.test.tsx (PRINT_ADVANCES=1). Both also size weight-600
   labels (badge labels; state and note pills), which are the widest runs. */
const CH_CAPTION = 5.55; // 9.5px sans — semibold badge label measured 5.55
const CH_PILL = 5.35; // 9px sans inside a pill — semibold pill label measured 5.35
/* 9px *mono* is markedly wider per character than 9px sans: sizing the tag
   pill with CH_PILL left its closing brace hanging outside the pill. */
const CH_MONOPILL = 5.5;
const CH_CHIP = 5.9; // 9.5px mono inside the badge chip
const CH_BANDLBL = 6.4; // 9.5px sans, letter-spaced small caps

const PAD = 18; // canvas edge -> panel
const PANEL_PAD = 20; // panel edge -> first column
const COLGAP = 16;
const PANELGAP = 28;
const ROUTE_H = 66;
const BAND_H = 54;
const CHIP_H = 22;
const PILL_H = 18;

const BADGE_LABEL = "PostCountBadge";
const BAND_LABEL = "SHARED HEADER · app/layout.tsx";

interface RouteColumn {
  path: string;
  renders: string;
}

/** What each panel does to every column: the whole point is the *shape* of the
 *  set it touches — one column versus one row. */
interface Panel {
  call: string;
  scope: string;
  /** Highlight shape: a vertical column (one route) or a horizontal row (one tag). */
  shape: { kind: "column"; index: number } | { kind: "row" };
  /** Per column: what happens to the header's badge entry. */
  badge: { state: "purged" | "stale"; label: string }[];
  /** Per column: what happens to that route's own cached render. */
  route: { state: "purged" | "untouched"; label: string }[];
  /** A note anchored under one column, for data the call does *not* reach. */
  note: { col: number; text: string; tone: "accent" | "insight" };
  verdict: string;
}

const DEFAULT_CAPTION: [string, string] = [
  "revalidatePath purges a column: one route's entries, whatever data they happen to hold.",
  "revalidateTag purges a row: one tag's entries, on every route that renders them.",
];

/**
 * Why a mutation that calls `revalidatePath` can still leave a shared header
 * showing the old number — drawn as the *shape of the set each call purges*,
 * not as two cards of bullet points.
 *
 * The same site map is drawn twice. Three routes are three columns; the shared
 * header's tagged fetch is a row cutting across all three of them, because one
 * `fetch` tagged `post-count` is rendered into every one of those routes.
 * `revalidatePath("/posts")` purges a column — the entries under one path —
 * and visibly leaves the badge's entries on the other two routes untouched.
 * `revalidateTag("post-count")` purges the row instead, reaching that data on
 * every route regardless of path, while the untagged post-list fetch under
 * `/posts` stays cached: which is exactly why the fixed action needs both
 * calls, one per axis.
 *
 * Phosphor icon components render their own `<svg>`, which nests validly inside
 * this canvas (SVG allows nested viewports) and takes `x`/`y`/`size`/`color`
 * directly.
 */
export function CacheInvalidationScopeDiagram({
  path = "/posts",
  tag = "post-count",
  caption = DEFAULT_CAPTION,
}: CacheInvalidationScopeDiagramProps = {}) {
  // --accent is the family's UI-safe derived colour: correct for strokes,
  // washes and category icons, but it does not clear the 4.5:1 text floor.
  const accent = "var(--accent)";
  // Any *text* in the accent hue must use --mark, which does clear it.
  const accentText = "var(--mark)";
  const sans = "var(--font-sans), system-ui";
  const mono = "var(--font-mono), monospace";

  const routes: RouteColumn[] = [
    { path, renders: "renders the post list" },
    { path: "/dashboard", renders: "renders a stats panel" },
    { path: "/", renders: "renders the home page" },
  ];

  const panels: Panel[] = [
    {
      call: `revalidatePath("${path}")`,
      scope: "purges every entry under this one path",
      shape: { kind: "column", index: 0 },
      badge: [
        { state: "purged", label: `purged with ${path}` },
        { state: "stale", label: "stale" },
        { state: "stale", label: "stale" },
      ],
      route: [
        { state: "purged", label: "purged → re-renders" },
        { state: "untouched", label: "untouched" },
        { state: "untouched", label: "untouched" },
      ],
      note: { col: 0, text: "post list: purged", tone: "accent" },
      verdict: `One column. Every route the call did not name keeps serving the old count in its header.`,
    },
    {
      call: `revalidateTag("${tag}")`,
      scope: "purges every entry carrying this tag, on any route",
      shape: { kind: "row" },
      badge: [
        { state: "purged", label: "purged" },
        { state: "purged", label: "purged" },
        { state: "purged", label: "purged" },
      ],
      route: [
        { state: "purged", label: "purged → re-renders" },
        { state: "purged", label: "purged → re-renders" },
        { state: "purged", label: "purged → re-renders" },
      ],
      note: { col: 0, text: "post list: untouched", tone: "insight" },
      verdict: "One row, across every route — but nothing untagged travels with it.",
    },
  ];

  const tagPill = `next: { tags: ["${tag}"] }`;

  // ── Widths, all derived from the strings actually rendered ───────────────
  const chipW = 12 + 6 + BADGE_LABEL.length * CH_CHIP + 22;
  const colW = Math.max(
    ...routes.map((r) => 24 + r.path.length * CH_ROUTE + 24),
    ...routes.map((r) => 20 + r.renders.length * CH_CAPTION + 20),
    chipW + 24,
    ...panels.flatMap((p) => p.route.map((s) => s.label.length * CH_PILL + 20 + 20)),
    ...panels.flatMap((p) => p.badge.map((s) => s.label.length * CH_CAPTION + 16)),
    ...panels.map((p) => p.note.text.length * CH_PILL + 20 + 20),
  );

  const headerRowW = Math.max(
    ...panels.map((p) => 14 + 8 + p.call.length * CH_CALL + 26 + 14 + p.scope.length * CH_CAPTION),
  );
  const tagPillW = tagPill.length * CH_MONOPILL + 22;
  const tagPillX = (bx: number) => bx + 13 + 8 + BAND_LABEL.length * CH_BANDLBL + 14;
  const bandLabelW = 13 + 8 + BAND_LABEL.length * CH_BANDLBL + 14 + tagPillW;

  const gridW = routes.length * colW + (routes.length - 1) * COLGAP;
  const panelW = Math.max(gridW + 2 * PANEL_PAD, headerRowW + 2 * PANEL_PAD, bandLabelW + 2 * PANEL_PAD);
  const gridX = PAD + PANEL_PAD + (panelW - 2 * PANEL_PAD - gridW) / 2;
  const colX = (i: number) => gridX + i * (colW + COLGAP);
  const colMid = (i: number) => colX(i) + colW / 2;

  // ── Vertical rhythm inside one panel ────────────────────────────────────
  const callY = 16; // top of the call pill
  const callH = 24;
  const bandLabelY = callY + callH + 12; // top of the tag pill on the label row
  const bandY = bandLabelY + PILL_H + 8;
  const routeY = bandY + BAND_H + 20;
  const noteY = routeY + ROUTE_H + 12;
  const verdictY = noteY + PILL_H + 20; // baseline
  const panelH = verdictY + 14;

  const bandX = gridX - 12;
  const bandW = gridW + 24;

  const width = Math.max(
    2 * PAD + panelW,
    ...caption.map((c) => c.length * CH_CAPTION + 2 * PAD + 20),
  );
  const panelX = (width - panelW) / 2;
  const panelTop = (i: number) => PAD + i * (panelH + PANELGAP);
  const height = panelTop(1) + panelH + 46;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full"
      style={{ maxWidth: `${width}px` }}
      role="img"
      aria-label={
        `The same three-route site map drawn twice, to compare what each cache invalidation call actually reaches. ` +
        `Three routes — ${routes.map((r) => r.path).join(", ")} — are three columns, and the shared header in app/layout.tsx is a row cutting across all three, because the one fetch tagged "${tag}" that feeds its post-count badge is rendered into every route. ` +
        `In the upper panel the mutation calls revalidatePath("${path}") alone: it purges a column, so ${path} re-renders with a fresh post list, but the badge's cached entries on /dashboard and on the home page are left untouched and keep serving the old count — which is why the header still shows the stale number even though the database write succeeded. ` +
        `In the lower panel revalidateTag("${tag}") purges the row instead: every cached entry carrying that tag is invalidated no matter which route rendered it, so the badge is refreshed everywhere at once. ` +
        `The post-list fetch under ${path} is untagged, so the tag call does not touch it — the two calls purge along different axes, and a mutation that changes data shown in both places needs both of them.`
      }
    >
      <defs>
        <marker id="cis-arrow-muted" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill="var(--muted)" />
        </marker>
        <marker id="cis-arrow-accent" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0.5,0.5 L5.5,3 L0.5,5.5 Z" fill={accent} />
        </marker>
        <pattern id="cis-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="var(--border)" />
        </pattern>
        <linearGradient id="cis-fade-x" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--border)" stopOpacity="0" />
          <stop offset="0.35" stopColor="var(--border)" stopOpacity="1" />
          <stop offset="0.65" stopColor="var(--border)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--border)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {panels.map((panel, pi) => {
        const top = panelTop(pi);
        const CallIcon = panel.shape.kind === "column" ? Path : Tag;
        const callW = 14 + 8 + panel.call.length * CH_CALL + 26;
        const noteW = panel.note.text.length * CH_PILL + 20;
        const noteTone = panel.note.tone === "accent" ? accent : "var(--insight)";
        const noteInk = panel.note.tone === "accent" ? accentText : "var(--insight)";

        return (
          <g key={panel.call}>
            {/* Panel plate — a faint dot texture rather than a flat fill */}
            <rect x={panelX} y={top} width={panelW} height={panelH} rx={14} fill="var(--surface)" />
            <rect x={panelX} y={top} width={panelW} height={panelH} rx={14} fill="url(#cis-dots)" fillOpacity={0.5} />
            <rect
              x={panelX}
              y={top}
              width={panelW}
              height={panelH}
              rx={14}
              fill="none"
              stroke="var(--border)"
              strokeWidth={1}
            />

            {/* The call itself */}
            <rect
              x={panelX + PANEL_PAD}
              y={top + callY}
              width={callW}
              height={callH}
              rx={callH / 2}
              fill="var(--elevated)"
              stroke={accent}
              strokeWidth={1.5}
            />
            <CallIcon x={panelX + PANEL_PAD + 14} y={top + callY + 6} size={13} color={accent} />
            <text
              x={panelX + PANEL_PAD + 14 + 8 + 13}
              y={top + callY + 16.5}
              fontSize={12}
              fontWeight={600}
              fill={accentText}
              fontFamily={mono}
            >
              {panel.call}
            </text>
            <text
              x={panelX + PANEL_PAD + callW + 14}
              y={top + callY + 16.5}
              fontSize={9.5}
              fill="var(--muted)"
              fontFamily={sans}
            >
              {panel.scope}
            </text>

            {/* Shared header label row */}
            <Layout x={bandX} y={top + bandLabelY + 2} size={13} color="var(--muted)" />
            <text
              x={bandX + 13 + 8}
              y={top + bandLabelY + 13}
              fontSize={9.5}
              fontWeight={600}
              fill="var(--muted)"
              fontFamily={sans}
              letterSpacing={1.1}
            >
              {BAND_LABEL}
            </text>
            <rect
              x={tagPillX(bandX)}
              y={top + bandLabelY}
              width={tagPillW}
              height={PILL_H}
              rx={PILL_H / 2}
              fill="var(--elevated)"
              stroke={accent}
              strokeOpacity={0.6}
              strokeWidth={1}
            />
            <text
              x={tagPillX(bandX) + 11}
              y={top + bandLabelY + 12.5}
              fontSize={9}
              fontWeight={600}
              fill={accentText}
              fontFamily={mono}
            >
              {tagPill}
            </text>

            {/* The band: one fetch, rendered into every column */}
            <rect x={bandX} y={top + bandY} width={bandW} height={BAND_H} rx={12} fill="var(--elevated)" stroke="var(--border)" strokeWidth={1} />

            {/* The purged set, drawn as a shape: a column, or a row. Painted
                *after* the band so the column's dotted outline stays visible
                where it crosses it — drawn before the band, the band's opaque
                fill hid exactly the stretch that carries the point. */}
            {panel.shape.kind === "column" ? (
              <rect
                x={colX(panel.shape.index) - 10}
                y={top + bandY - 8}
                width={colW + 20}
                height={routeY + ROUTE_H + 8 - (bandY - 8)}
                rx={14}
                fill={accent}
                fillOpacity={0.1}
                stroke={accent}
                strokeOpacity={0.5}
                strokeWidth={1}
                strokeDasharray="1 4"
                strokeLinecap="round"
              />
            ) : (
              <rect
                x={bandX - 8}
                y={top + bandY - 8}
                width={bandW + 16}
                height={BAND_H + 16}
                rx={14}
                fill={accent}
                fillOpacity={0.1}
                stroke={accent}
                strokeOpacity={0.5}
                strokeWidth={1}
                strokeDasharray="1 4"
                strokeLinecap="round"
              />
            )}
            <line
              x1={colMid(0)}
              y1={top + bandY + 8 + CHIP_H / 2}
              x2={colMid(routes.length - 1)}
              y2={top + bandY + 8 + CHIP_H / 2}
              stroke={panel.shape.kind === "row" ? accent : "var(--border)"}
              strokeWidth={1.25}
              strokeDasharray="1 4"
              strokeLinecap="round"
            />

            {routes.map((route, ci) => {
              const inShape = panel.shape.kind === "row" || panel.shape.index === ci;
              const badge = panel.badge[ci];
              const state = panel.route[ci];
              const badgeInk = badge.state === "purged" ? accent : "var(--bad)";
              const chipX = colMid(ci) - chipW / 2;
              const statePillW = state.label.length * CH_PILL + 20;

              return (
                <g key={route.path}>
                  {/* The header's badge entry for this column */}
                  <rect
                    x={chipX}
                    y={top + bandY + 8}
                    width={chipW}
                    height={CHIP_H}
                    rx={CHIP_H / 2}
                    fill="var(--surface)"
                    stroke={badgeInk}
                    strokeWidth={1.5}
                  />
                  <Tag x={chipX + 11} y={top + bandY + 8 + 5} size={12} color={badgeInk} />
                  <text
                    x={chipX + 11 + 12 + 6}
                    y={top + bandY + 8 + 15}
                    fontSize={9.5}
                    fontWeight={600}
                    fill="var(--foreground)"
                    fontFamily={mono}
                  >
                    {BADGE_LABEL}
                  </text>
                  <text
                    x={colMid(ci)}
                    y={top + bandY + 46}
                    fontSize={9.5}
                    fontWeight={600}
                    fill={badge.state === "purged" ? accentText : "var(--bad)"}
                    textAnchor="middle"
                    fontFamily={sans}
                  >
                    {badge.label}
                  </text>

                  {/* Rendered into this route */}
                  <line
                    x1={colMid(ci)}
                    y1={top + bandY + BAND_H + 3}
                    x2={colMid(ci)}
                    y2={top + routeY - 5}
                    stroke={inShape ? accent : "var(--muted)"}
                    strokeWidth={1.25}
                    strokeDasharray="1 4"
                    strokeLinecap="round"
                    markerEnd={inShape ? "url(#cis-arrow-accent)" : "url(#cis-arrow-muted)"}
                  />

                  {/* The route's own cached render */}
                  <rect
                    x={colX(ci)}
                    y={top + routeY}
                    width={colW}
                    height={ROUTE_H}
                    rx={12}
                    fill="var(--elevated)"
                    stroke={state.state === "purged" ? accent : "var(--border)"}
                    strokeWidth={state.state === "purged" ? 1.5 : 1}
                  />
                  <text
                    x={colMid(ci)}
                    y={top + routeY + 23}
                    fontSize={12.5}
                    fontWeight={600}
                    fill="var(--foreground)"
                    textAnchor="middle"
                    fontFamily={mono}
                  >
                    {route.path}
                  </text>
                  <text
                    x={colMid(ci)}
                    y={top + routeY + 39}
                    fontSize={9.5}
                    fill="var(--muted)"
                    textAnchor="middle"
                    fontFamily={sans}
                  >
                    {route.renders}
                  </text>
                  <rect
                    x={colMid(ci) - statePillW / 2}
                    y={top + routeY + 45}
                    width={statePillW}
                    height={PILL_H}
                    rx={PILL_H / 2}
                    fill="var(--surface)"
                    stroke={state.state === "purged" ? accent : "var(--border)"}
                    strokeOpacity={state.state === "purged" ? 0.6 : 1}
                    strokeWidth={1}
                  />
                  <text
                    x={colMid(ci)}
                    y={top + routeY + 57.5}
                    fontSize={9}
                    fontWeight={600}
                    fill={state.state === "purged" ? accentText : "var(--muted)"}
                    textAnchor="middle"
                    fontFamily={sans}
                  >
                    {state.label}
                  </text>
                </g>
              );
            })}

            {/* What this call does to the route's own, separately cached data */}
            <rect
              x={colMid(panel.note.col) - noteW / 2}
              y={top + noteY}
              width={noteW}
              height={PILL_H}
              rx={PILL_H / 2}
              fill="var(--elevated)"
              stroke={noteTone}
              strokeOpacity={0.55}
              strokeWidth={1}
            />
            <text
              x={colMid(panel.note.col)}
              y={top + noteY + 12.5}
              fontSize={9}
              fontWeight={600}
              fill={noteInk}
              textAnchor="middle"
              fontFamily={sans}
            >
              {panel.note.text}
            </text>

            <text
              x={panelX + panelW / 2}
              y={top + verdictY}
              fontSize={9.5}
              fill="var(--muted)"
              textAnchor="middle"
              fontFamily={sans}
            >
              {panel.verdict}
            </text>
          </g>
        );
      })}

      <line
        x1={PAD + 40}
        y1={height - 40}
        x2={width - PAD - 40}
        y2={height - 40}
        stroke="url(#cis-fade-x)"
        strokeWidth={1.5}
        strokeDasharray="1 4"
        strokeLinecap="round"
      />
      <text x={width / 2} y={height - 22} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily={sans}>
        {caption[0]}
      </text>
      <text x={width / 2} y={height - 7} fontSize={9.5} fill="var(--muted)" textAnchor="middle" fontFamily={sans}>
        {caption[1]}
      </text>
    </svg>
  );
}
