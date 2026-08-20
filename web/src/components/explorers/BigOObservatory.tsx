"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type CurveKey = "o1" | "logn" | "n" | "nlogn" | "n2";

const CURVES: {
  key: CurveKey;
  label: string;
  color: string;
  fn: (n: number) => number;
}[] = [
  { key: "o1", label: "O(1)", color: "var(--good)", fn: () => 1 },
  {
    key: "logn",
    label: "O(log n)",
    color: "var(--mark)",
    fn: (n) => Math.log2(Math.max(n, 2)),
  },
  { key: "n", label: "O(n)", color: "var(--warn)", fn: (n) => n },
  {
    key: "nlogn",
    label: "O(n log n)",
    color: "var(--accent)",
    fn: (n) => n * Math.log2(Math.max(n, 2)),
  },
  { key: "n2", label: "O(n²)", color: "var(--bad)", fn: (n) => n * n },
];

type Preset = {
  id: string;
  label: string;
  n: number;
  /** ops/sec teaching budget for “Will it finish?” */
  budgetOps: number;
};

const PRESETS: Preset[] = [
  { id: "classroom", label: "Classroom", n: 32, budgetOps: 1e6 },
  { id: "interview", label: "Interview", n: 1e5, budgetOps: 1e8 },
  { id: "production", label: "Production", n: 1e7, budgetOps: 1e9 },
];

const W = 640;
const H = 300;
const PAD = { l: 44, r: 16, t: 16, b: 36 };

function buildPath(
  fn: (n: number) => number,
  nMax: number,
  yMax: number,
): string {
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const steps = 80;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const n = 1 + t * (nMax - 1);
    const yVal = fn(n);
    const x = PAD.l + t * plotW;
    const y = PAD.t + plotH - (Math.min(yVal, yMax) / yMax) * plotH;
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

function formatN(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}K`;
  return String(Math.round(n));
}

function formatOps(ops: number) {
  if (!Number.isFinite(ops)) return "∞";
  if (ops >= 1e12) return `${(ops / 1e12).toFixed(1)}T`;
  if (ops >= 1e9) return `${(ops / 1e9).toFixed(1)}B`;
  if (ops >= 1e6) return `${(ops / 1e6).toFixed(1)}M`;
  if (ops >= 1e3) return `${(ops / 1e3).toFixed(1)}K`;
  return String(Math.round(ops));
}

export function BigOObservatory() {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState<Record<CurveKey, boolean>>({
    o1: true,
    logn: true,
    n: true,
    nlogn: true,
    n2: true,
  });
  const [n, setN] = useState(1e5);
  const [presetId, setPresetId] = useState("interview");
  const [focus, setFocus] = useState<CurveKey>("n");

  const nMax = Math.max(n, 8);
  // Scale Y so the enabled mid curves fit; cap using O(n log n) at nMax unless only n² shown
  const yMax = useMemo(() => {
    const samples = CURVES.filter((c) => enabled[c.key]).map((c) =>
      c.fn(nMax),
    );
    const raw = Math.max(...samples, 1);
    // Soft-cap: if n² dominates, keep chart readable using ~3× n log n
    const soft = CURVES.find((c) => c.key === "nlogn")!.fn(nMax) * 3;
    return Math.min(raw, soft);
  }, [enabled, nMax]);

  const paths = useMemo(
    () =>
      CURVES.map((c) => ({
        ...c,
        d: buildPath(c.fn, nMax, yMax),
      })),
    [nMax, yMax],
  );

  const focusCurve = CURVES.find((c) => c.key === focus)!;
  const focusOps = focusCurve.fn(n);
  const budget =
    PRESETS.find((p) => p.id === presetId)?.budgetOps ?? 1e8;
  const willFinish = focusOps <= budget;
  const finishRatio = Math.min(focusOps / budget, 2);

  function applyPreset(p: Preset) {
    setPresetId(p.id);
    setN(p.n);
  }

  return (
    <section
      className="lab-stage lab-mesh relative overflow-hidden"
      aria-label="Big O observatory"
      data-family="ordering-search"
      style={
        {
          "--family-accent": "var(--mark)",
          "--family-wash": "color-mix(in oklab, var(--mark) 12%, transparent)",
        } as CSSProperties
      }
    >
      <div className="relative z-[1] mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mark">
          Complexity stage
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">
          Big O observatory
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Drag <strong className="font-medium text-foreground">n</strong> and
          watch the curves. Toggle legends. Ask “Will it finish?” against a
          classroom, interview, or production time budget.
        </p>
      </div>

      <div className="relative z-[1] mb-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => applyPreset(p)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              presetId === p.id
                ? "border-accent/40 bg-accent/10 text-foreground"
                : "border-border bg-background/60 text-muted hover:text-foreground",
            )}
          >
            {p.label}
            <span className="ml-1.5 tabular-nums opacity-70">
              n={formatN(p.n)}
            </span>
          </button>
        ))}
      </div>

      <div className="relative z-[1] grid gap-5 lg:grid-cols-[1fr_220px]">
        <div className="rounded-[length:var(--radius-lg)] border border-border bg-surface p-3">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-[240px] w-full sm:h-[300px]"
            role="img"
            aria-label="Growth curves for common Big O classes"
          >
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const y = PAD.t + (1 - t) * (H - PAD.t - PAD.b);
              return (
                <line
                  key={t}
                  x1={PAD.l}
                  x2={W - PAD.r}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  className="text-border"
                  strokeWidth={1}
                  opacity={0.7}
                />
              );
            })}
            <line
              x1={PAD.l}
              x2={PAD.l}
              y1={PAD.t}
              y2={H - PAD.b}
              stroke="currentColor"
              className="text-border"
              strokeWidth={1.25}
            />
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={H - PAD.b}
              y2={H - PAD.b}
              stroke="currentColor"
              className="text-border"
              strokeWidth={1.25}
            />
            <text
              x={PAD.l}
              y={H - 10}
              className="fill-[var(--muted)] text-[11px]"
            >
              n →
            </text>
            <text
              x={8}
              y={PAD.t + 10}
              className="fill-[var(--muted)] text-[11px]"
            >
              ops
            </text>

            {paths.map((c) =>
              enabled[c.key] ? (
                <motion.path
                  key={c.key}
                  d={c.d}
                  fill="none"
                  stroke={c.color}
                  strokeWidth={focus === c.key ? 3 : 1.75}
                  strokeLinecap="round"
                  opacity={focus === c.key ? 1 : 0.45}
                  initial={false}
                  animate={reduceMotion ? undefined : { pathLength: 1 }}
                  transition={{ duration: 0.6 }}
                  onClick={() => setFocus(c.key)}
                  className="cursor-pointer"
                />
              ) : null,
            )}

            {/* n scrubber marker */}
            <line
              x1={PAD.l + ((n - 1) / (nMax - 1 || 1)) * (W - PAD.l - PAD.r)}
              x2={PAD.l + ((n - 1) / (nMax - 1 || 1)) * (W - PAD.l - PAD.r)}
              y1={PAD.t}
              y2={H - PAD.b}
              stroke="var(--accent)"
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.7}
            />
          </svg>

          <label className="mt-2 flex flex-col gap-1 px-1">
            <span className="flex justify-between text-xs text-muted">
              <span>Input size n</span>
              <span className="tabular-nums font-medium text-foreground">
                {formatN(n)}
              </span>
            </span>
            <input
              type="range"
              min={1}
              max={7}
              step={0.01}
              value={Math.log10(n)}
              onChange={(e) => {
                const next = Math.pow(10, Number(e.target.value));
                setN(next);
                setPresetId("custom");
              }}
              className="accent-[var(--accent)]"
              aria-label="Logarithmic scrubber for n"
            />
            <span className="flex justify-between text-[10px] text-muted">
              <span>10⁰</span>
              <span>10³</span>
              <span>10⁷</span>
            </span>
          </label>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-[length:var(--radius-lg)] border border-border bg-background/50 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
              Curves
            </p>
            <ul className="space-y-1.5">
              {CURVES.map((c) => (
                <li key={c.key}>
                  <button
                    type="button"
                    onClick={() =>
                      setEnabled((e) => ({ ...e, [c.key]: !e[c.key] }))
                    }
                    onDoubleClick={() => setFocus(c.key)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-[length:var(--radius-md)] px-2 py-1.5 text-left text-xs transition",
                      enabled[c.key]
                        ? "bg-surface text-foreground"
                        : "text-muted opacity-50",
                      focus === c.key && "ring-1 ring-border",
                    )}
                  >
                    <span
                      className="h-2 w-5 rounded-full"
                      style={{
                        background: enabled[c.key] ? c.color : "var(--border)",
                      }}
                    />
                    <span className="font-medium">{c.label}</span>
                    <span className="ml-auto tabular-nums text-muted">
                      {formatOps(c.fn(n))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[10px] text-muted">
              Click to toggle · double-click to focus meter
            </p>
          </div>

          <div
            className="rounded-[length:var(--radius-lg)] border border-border p-3"
            style={{
              background: willFinish
                ? "color-mix(in oklab, var(--good) 10%, var(--surface))"
                : "color-mix(in oklab, var(--bad) 10%, var(--surface))",
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Will it finish?
            </p>
            <p className="mt-1 text-sm font-semibold tracking-tight">
              {focusCurve.label} at n={formatN(n)}
            </p>
            <p className="mt-1 text-xs text-muted">
              ~{formatOps(focusOps)} ops vs budget {formatOps(budget)}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-border/80">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: willFinish ? "var(--good)" : "var(--bad)",
                  width: `${Math.min(finishRatio * 50, 100)}%`,
                }}
                initial={false}
                animate={{ width: `${Math.min(finishRatio * 50, 100)}%` }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.35 }}
              />
            </div>
            <p
              className="mt-2 text-xs font-semibold"
              style={{ color: willFinish ? "var(--good)" : "var(--bad)" }}
            >
              {willFinish
                ? "Yes — under the teaching budget."
                : "Probably not — redesign or shrink n."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
