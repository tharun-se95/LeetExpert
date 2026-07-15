"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { FAMILIES, type FamilyMeta } from "@/lib/content/manifest";
import { getFamilyTheme } from "@/lib/visual/familyTheme";
import { cn } from "@/lib/utils";

const W = 1100;
const H = 420;
const PAD_X = 72;
const ARC_Y = 210;

type NodePos = {
  family: FamilyMeta;
  x: number;
  y: number;
  accent: string;
};

function buildStarfield(count: number) {
  const stars: { x: number; y: number; r: number; o: number }[] = [];
  let seed = 7;
  for (let i = 0; i < count; i++) {
    seed = (seed * 16807) % 2147483647;
    const x = (seed % 1000) / 1000;
    seed = (seed * 16807) % 2147483647;
    const y = (seed % 1000) / 1000;
    seed = (seed * 16807) % 2147483647;
    const r = 0.6 + (seed % 1000) / 1000;
    seed = (seed * 16807) % 2147483647;
    const o = 0.12 + ((seed % 1000) / 1000) * 0.35;
    stars.push({ x: x * W, y: y * H, r, o });
  }
  return stars;
}

function familyPathId(familyId: string) {
  return `family-${familyId}`;
}

function patternPathId(familyId: string, slug: string) {
  return `pattern-${familyId}-${slug}`;
}

function quadraticPath(nodes: NodePos[]) {
  if (nodes.length < 2) return "";
  let d = `M ${nodes[0].x} ${nodes[0].y}`;
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];
    const cpx = (prev.x + curr.x) / 2;
    const cpy = ARC_Y + (i % 2 === 0 ? -48 : 48);
    d += ` Q ${cpx} ${cpy} ${curr.x} ${curr.y}`;
  }
  return d;
}

export function ConstellationJourney() {
  const router = useRouter();
  const { visited } = useProgress();
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);

  const stars = useMemo(() => buildStarfield(64), []);

  const nodes: NodePos[] = useMemo(
    () =>
      FAMILIES.map((family, i) => {
        const t = FAMILIES.length === 1 ? 0.5 : i / (FAMILIES.length - 1);
        const x = PAD_X + t * (W - PAD_X * 2);
        const y = ARC_Y + Math.sin(t * Math.PI) * -36 + (i % 2 === 0 ? -8 : 16);
        return {
          family,
          x,
          y,
          accent: getFamilyTheme(family.id).accent,
        };
      }),
    [],
  );

  const pathD = useMemo(() => quadraticPath(nodes), [nodes]);

  const allPatternIds = useMemo(
    () =>
      FAMILIES.flatMap((f) =>
        f.patterns.map((p) => patternPathId(f.id, p.slug)),
      ),
    [],
  );

  const visitedPatterns = allPatternIds.filter((id) => visited.has(id)).length;
  const progress =
    allPatternIds.length === 0
      ? 0
      : visitedPatterns / allPatternIds.length;

  const pathProgress = reduceMotion ? 1 : progress;

  return (
    <section
      className="lab-stage relative overflow-hidden !p-0"
      aria-label="Constellation journey across seven pattern families"
    >
      <div className="relative z-[1] flex flex-wrap items-end justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            Journey map
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            Constellation of seven families
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Each star is a family. The arc lights up as you visit patterns —
            hover a family to see its satellites, click to enter the lab.
          </p>
        </div>
        <div className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs tabular-nums text-muted">
          <span className="font-semibold text-foreground">
            {visitedPatterns}
          </span>
          <span> / {allPatternIds.length} patterns visited</span>
          <span className="mx-2 text-border">·</span>
          <span style={{ color: "var(--accent)" }}>
            {Math.round(progress * 100)}%
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="relative z-[1] h-[280px] w-full sm:h-[360px] lg:h-[420px]"
        role="img"
        aria-label="Arc linking seven pattern family nodes"
      >
        <defs>
          <linearGradient id="constellation-glow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0A7A6A" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#2F6FED" stopOpacity="0.55" />
            <stop offset="65%" stopColor="#6B4CE6" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#E11D48" stopOpacity="0.55" />
          </linearGradient>
          <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Starfield */}
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="currentColor"
            className="text-foreground"
            opacity={s.o * 0.45}
          />
        ))}

        {/* Base arc (faint) */}
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          className="text-border"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.55}
        />

        {/* Progress arc */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="url(#constellation-glow)"
          strokeWidth={3.5}
          strokeLinecap="round"
          filter="url(#soft-glow)"
          initial={{ pathLength: reduceMotion ? 1 : 0 }}
          animate={{ pathLength: pathProgress }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
          }
        />

        {nodes.map((node) => {
          const theme = getFamilyTheme(node.family.id);
          const patternIds = node.family.patterns.map((p) =>
            patternPathId(node.family.id, p.slug),
          );
          const done = patternIds.filter((id) => visited.has(id)).length;
          const complete = done === patternIds.length && patternIds.length > 0;
          const familyVisited =
            visited.has(familyPathId(node.family.id)) || done > 0;
          const isHover = hovered === node.family.id;
          const ring = 26 + (complete ? 4 : 0);

          return (
            <g
              key={node.family.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseEnter={() => setHovered(node.family.id)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              {/* Completion ring */}
              <circle
                r={ring}
                fill="none"
                stroke={node.accent}
                strokeWidth={complete ? 2.5 : 1.25}
                opacity={complete ? 0.9 : familyVisited ? 0.45 : 0.2}
              />
              {(done > 0 || familyVisited) && (
                <circle
                  r={ring}
                  fill="none"
                  stroke={node.accent}
                  strokeWidth={2.5}
                  strokeDasharray={`${(done / Math.max(patternIds.length, 1)) * 2 * Math.PI * ring} ${2 * Math.PI * ring}`}
                  strokeLinecap="round"
                  transform="rotate(-90)"
                  opacity={0.85}
                />
              )}

              <circle
                r={14}
                fill="var(--background)"
                stroke={node.accent}
                strokeWidth={2.25}
                filter={isHover ? "url(#soft-glow)" : undefined}
                onClick={() => router.push(`/patterns/${node.family.id}`)}
              />
              <circle
                r={5}
                fill={node.accent}
                opacity={familyVisited || isHover ? 1 : 0.55}
                style={{ pointerEvents: "none" }}
              />

              <text
                y={48}
                textAnchor="middle"
                className="fill-foreground text-[12px] font-semibold"
                style={{ pointerEvents: "none" }}
              >
                {theme.label}
              </text>
              <text
                y={64}
                textAnchor="middle"
                className="fill-[var(--muted)] text-[10px]"
                style={{ pointerEvents: "none" }}
              >
                {done}/{patternIds.length}
              </text>

              {/* Pattern mini-dots on hover */}
              {isHover
                ? node.family.patterns.map((p, pi) => {
                    const angle =
                      (-Math.PI * 0.75) +
                      (pi / Math.max(node.family.patterns.length - 1, 1)) *
                        (Math.PI * 1.5);
                    const r = 52;
                    const px = Math.cos(angle) * r;
                    const py = Math.sin(angle) * r - 6;
                    const pid = patternPathId(node.family.id, p.slug);
                    const seen = visited.has(pid);
                    return (
                      <g
                        key={p.slug}
                        transform={`translate(${px}, ${py})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/patterns/${node.family.id}/${p.slug}`,
                          );
                        }}
                      >
                        <title>{p.title}</title>
                        <circle
                          r={7}
                          fill="var(--background)"
                          stroke={node.accent}
                          strokeWidth={1.5}
                          opacity={0.95}
                        />
                        <circle
                          r={2.8}
                          fill={node.accent}
                          opacity={seen ? 1 : 0.4}
                        />
                      </g>
                    );
                  })
                : null}
            </g>
          );
        })}
      </svg>

      <div className="relative z-[1] flex flex-wrap gap-2 border-t border-border/60 px-5 py-3">
        {FAMILIES.map((f) => {
          const accent = getFamilyTheme(f.id).accent;
          return (
            <Link
              key={f.id}
              href={`/patterns/${f.id}`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-2.5 py-1 text-[11px] font-medium transition hover:border-foreground/20",
              )}
              style={{
                boxShadow: `inset 3px 0 0 ${accent}`,
              }}
              onMouseEnter={() => setHovered(f.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: accent }}
              />
              {f.shortTitle}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
