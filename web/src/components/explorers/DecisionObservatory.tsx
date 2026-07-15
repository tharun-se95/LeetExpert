"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowLeft, Orbit, Sparkles, RotateCcw } from "lucide-react";
import {
  MASTER_DECISION_TREE,
  collectNodes,
  isLeaf,
  type DecisionBranch,
  type DecisionLeaf,
  type DecisionNode,
} from "@/lib/visual/decisionTreeData";
import { getFamilyTheme } from "@/lib/visual/familyTheme";
import { cn } from "@/lib/utils";

type TrailStep = {
  nodeId: string;
  label: string;
  answer?: "yes" | "no";
};

function findNode(root: DecisionNode, id: string): DecisionNode | null {
  if (root.id === id) return root;
  if (root.kind === "branch") {
    return findNode(root.yes, id) || findNode(root.no, id);
  }
  return null;
}

function MiniMap({
  root,
  currentId,
  trailIds,
}: {
  root: DecisionBranch;
  currentId: string;
  trailIds: Set<string>;
}) {
  const nodes = useMemo(() => collectNodes(root), [root]);
  const branches = nodes.filter((n) => n.kind === "branch") as DecisionBranch[];
  const leaves = nodes.filter((n) => n.kind === "leaf") as DecisionLeaf[];

  // Simple layered layout: branch column left, leaves right
  const W = 220;
  const H = 280;
  const branchX = 36;
  const leafX = 170;

  const branchPos = new Map(
    branches.map((b, i) => [
      b.id,
      {
        x: branchX,
        y: 24 + (i / Math.max(branches.length - 1, 1)) * (H - 48),
      },
    ]),
  );
  const leafPos = new Map(
    leaves.map((l, i) => [
      l.id,
      {
        x: leafX,
        y: 20 + (i / Math.max(leaves.length - 1, 1)) * (H - 40),
      },
    ]),
  );

  function pos(id: string) {
    return branchPos.get(id) ?? leafPos.get(id) ?? { x: W / 2, y: H / 2 };
  }

  const edges: { from: string; to: string }[] = [];
  for (const b of branches) {
    edges.push({ from: b.id, to: b.yes.id }, { from: b.id, to: b.no.id });
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-[240px] w-full max-w-[220px]"
      aria-hidden
    >
      {edges.map((e) => {
        const a = pos(e.from);
        const b = pos(e.to);
        const onTrail = trailIds.has(e.from) && trailIds.has(e.to);
        return (
          <line
            key={`${e.from}-${e.to}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="currentColor"
            className="text-border"
            strokeWidth={onTrail ? 1.75 : 1}
            opacity={onTrail ? 0.85 : 0.35}
          />
        );
      })}
      {nodes.map((n) => {
        const p = pos(n.id);
        const active = n.id === currentId;
        const onTrail = trailIds.has(n.id);
        const accent =
          n.kind === "leaf"
            ? getFamilyTheme(n.familyId).accent
            : "var(--accent)";
        return (
          <g key={n.id} transform={`translate(${p.x}, ${p.y})`}>
            <circle
              r={active ? 7 : 4.5}
              fill={n.kind === "leaf" ? accent : "var(--background)"}
              stroke={accent}
              strokeWidth={active ? 2.5 : 1.25}
              opacity={active || onTrail ? 1 : 0.4}
            />
            {active ? (
              <circle
                r={12}
                fill="none"
                stroke={accent}
                strokeWidth={1}
                opacity={0.45}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function DecisionObservatory() {
  const reduceMotion = useReducedMotion();
  const root = MASTER_DECISION_TREE;
  const [trail, setTrail] = useState<TrailStep[]>([
    { nodeId: root.id, label: "Start" },
  ]);

  const currentId = trail[trail.length - 1]?.nodeId ?? root.id;
  const current = findNode(root, currentId) ?? root;
  const trailIds = useMemo(
    () => new Set(trail.map((t) => t.nodeId)),
    [trail],
  );

  function answer(choice: "yes" | "no") {
    if (!isLeaf(current) && current.kind === "branch") {
      const next = choice === "yes" ? current.yes : current.no;
      setTrail((t) => [
        ...t,
        {
          nodeId: next.id,
          label: isLeaf(next) ? next.title : next.question.slice(0, 42) + "…",
          answer: choice,
        },
      ]);
    }
  }

  function rewindTo(index: number) {
    setTrail((t) => t.slice(0, index + 1));
  }

  function reset() {
    setTrail([{ nodeId: root.id, label: "Start" }]);
  }

  const leaf = isLeaf(current) ? current : null;
  const branch = !leaf && current.kind === "branch" ? current : null;
  const leafAccent = leaf ? getFamilyTheme(leaf.familyId).accent : undefined;

  return (
    <section
      className="lab-stage lab-mesh relative overflow-hidden"
      aria-label="Decision observatory"
    >
      <div className="relative z-[1] mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            Observatory
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            Route the question to a pattern
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Answer yes / no. Follow the comet trail. When you land, open the
            lab — especially watch the dual-home trap for subarray sum = k.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background/70 px-3 text-xs font-medium text-muted transition hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset path
        </button>
      </div>

      {/* Comet breadcrumb trail */}
      <div className="relative z-[1] mb-5 flex flex-wrap items-center gap-1.5">
        <Orbit className="h-3.5 w-3.5 text-accent" aria-hidden />
        {trail.map((step, i) => (
          <button
            key={`${step.nodeId}-${i}`}
            type="button"
            onClick={() => rewindTo(i)}
            className={cn(
              "inline-flex max-w-[140px] items-center gap-1 truncate rounded-full border px-2 py-0.5 text-[11px] transition",
              i === trail.length - 1
                ? "border-accent/40 bg-accent/10 text-foreground"
                : "border-border bg-background/60 text-muted hover:text-foreground",
            )}
            title={step.label}
          >
            {step.answer ? (
              <span className="font-semibold uppercase text-accent">
                {step.answer}
              </span>
            ) : null}
            <span className="truncate">{step.label}</span>
          </button>
        ))}
      </div>

      <div className="relative z-[1] grid gap-5 lg:grid-cols-[1fr_auto]">
        <AnimatePresence mode="wait">
          {branch ? (
            <motion.div
              key={branch.id}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="rounded-2xl border border-border bg-background/55 p-5 shadow-[0_8px_40px_rgb(0,0,0,0.04)] backdrop-blur-md dark:bg-background/40"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Question
              </p>
              <p className="mt-2 text-lg font-semibold leading-snug tracking-tight text-balance">
                {branch.question}
              </p>
              {branch.hint ? (
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {branch.hint}
                </p>
              ) : null}
              {branch.trapNote ? (
                <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/8 px-3 py-2.5 text-sm text-amber-900 dark:text-amber-100">
                  <span className="font-semibold">Dual-home trap. </span>
                  {branch.trapNote}
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => answer("yes")}
                  className="inline-flex h-11 min-w-[7rem] items-center justify-center rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => answer("no")}
                  className="inline-flex h-11 min-w-[7rem] items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold transition hover:border-foreground/20"
                >
                  No
                </button>
                {trail.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => rewindTo(trail.length - 2)}
                    className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm text-muted transition hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                ) : null}
              </div>
            </motion.div>
          ) : leaf ? (
            <motion.div
              key={leaf.id}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.32 }}
              className="rounded-2xl border border-border bg-background/55 p-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] backdrop-blur-md"
              style={{
                boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${leafAccent} 35%, transparent), 0 8px 40px rgb(0 0 0 / 0.04)`,
              }}
            >
              <div className="flex items-center gap-2">
                <Sparkles
                  className="h-4 w-4"
                  style={{ color: leafAccent }}
                  aria-hidden
                />
                <p
                  className="text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: leafAccent }}
                >
                  Pattern locked
                </p>
              </div>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                {leaf.title}
              </h3>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
                {leaf.summary}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href={leaf.patternHref}
                  className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ background: leafAccent }}
                >
                  Open {leaf.patternLabel}
                </Link>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex h-11 items-center rounded-xl border border-border px-4 text-sm font-medium text-muted transition hover:text-foreground"
                >
                  Try another path
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <aside className="hidden rounded-2xl border border-border bg-background/40 p-3 lg:block">
          <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
            Path map
          </p>
          <MiniMap root={root} currentId={currentId} trailIds={trailIds} />
        </aside>
      </div>
    </section>
  );
}
