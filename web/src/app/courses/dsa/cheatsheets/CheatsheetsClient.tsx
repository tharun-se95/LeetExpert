"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CaretDown,
  CaretUp,
  FileText,
  MagnifyingGlass,
  Sparkle,
  Target,
  TreeStructure,
  Warning,
} from "@phosphor-icons/react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Cheatsheet } from "@/components/cheatsheet/Cheatsheet";
import { CHEATSHEETS } from "@/lib/course/cheatsheets/registry";
import { MODULES, STAGES } from "@/lib/course/manifest";
import { cn } from "@/lib/utils";

const STAGE_THEMES: Record<number, { pill: string }> = {
  0: { pill: "border border-good/40 bg-good-surface/30 text-good font-semibold" },
  1: { pill: "border border-warn/40 bg-warn-surface/30 text-warn font-semibold" },
  2: { pill: "border border-info/40 bg-info-surface/30 text-info font-semibold" },
  3: { pill: "border border-accent/40 bg-pop/10 text-mark font-semibold" },
  4: { pill: "border border-good/40 bg-good-surface/30 text-good font-semibold" },
};

export function CheatsheetsClient() {
  const [search, setSearch] = useState("");
  const [selectedStage, setSelectedStage] = useState<number | "all">("all");
  const [selectedTier, setSelectedTier] = useState<"all" | "gold">("all");
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const modulesWithSheets = useMemo(() => {
    return MODULES.map((mod) => {
      const sheet = CHEATSHEETS[mod.slug] ?? null;
      return {
        module: mod,
        sheet,
      };
    }).filter((item) => item.sheet !== null);
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return modulesWithSheets.filter(({ module, sheet }) => {
      if (!sheet) return false;
      if (selectedStage !== "all" && module.stage !== selectedStage) return false;
      if (selectedTier === "gold" && sheet.tier !== "gold") return false;

      if (!q) return true;

      // Match module name, pattern names, smells, or complexity labels
      const matchesName =
        module.title.toLowerCase().includes(q) ||
        module.shortTitle.toLowerCase().includes(q);
      const matchesTagline = sheet.tagline.toLowerCase().includes(q);
      const matchesPatterns = sheet.patterns.some(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.smell?.toLowerCase().includes(q),
      );
      const matchesSmells = sheet.smells.some(
        (s) =>
          s.smell.toLowerCase().includes(q) ||
          s.pattern.toLowerCase().includes(q),
      );
      const matchesTraps = sheet.traps.some(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.detail.toLowerCase().includes(q),
      );

      return (
        matchesName ||
        matchesTagline ||
        matchesPatterns ||
        matchesSmells ||
        matchesTraps
      );
    });
  }, [modulesWithSheets, search, selectedStage, selectedTier]);

  const goldCount = useMemo(
    () => modulesWithSheets.filter((m) => m.sheet?.tier === "gold").length,
    [modulesWithSheets],
  );

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      {/* Background multi-stop ambient lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,_color-mix(in_srgb,var(--accent)_18%,transparent),_color-mix(in_srgb,var(--info)_14%,transparent)_50%,_color-mix(in_srgb,var(--warn)_8%,transparent)_80%,_transparent_95%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
        <Breadcrumbs
          items={[
            { label: "DSA Curriculum", href: "/courses/dsa" },
            { label: "Cheatsheets Hub" },
          ]}
        />

        {/* Visual Banner Header */}
        <div className="relative mt-6 overflow-hidden rounded-[length:var(--radius-xl)] border border-border bg-elevated/85 backdrop-blur-md shadow-elevation">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent via-info to-warn/60" />
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 lg:p-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-pop/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-mark mb-3 font-medium">
                <FileText weight="bold" className="h-3.5 w-3.5 text-accent" />
                <span>Interview Quick-Recall Synthesis</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-foreground">
                DSA Cheatsheets Hub
              </h1>
              <p className="mt-3 text-base sm:text-lg leading-relaxed text-muted">
                The definitive night-before-interview reference. Precise Big-O
                complexity targets, interview pattern smells, core diagram anchors,
                and common implementation traps across all curriculum modules.
              </p>
            </div>
            <div className="relative shrink-0 w-full lg:w-80 aspect-[16/9] rounded-[length:var(--radius-lg)] overflow-hidden border border-border shadow-elevation">
              <Image
                src="/media/banners/banner-cheatsheets.jpg"
                alt="DSA Cheatsheets & Pattern Traps"
                fill
                sizes="(max-width: 1024px) 100vw, 320px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted"
              aria-hidden
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by pattern, smell, complexity, or module…"
              className="w-full rounded-[length:var(--radius-md)] border border-border bg-elevated pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted hover:text-foreground cursor-pointer"
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSelectedTier(selectedTier === "gold" ? "all" : "gold")}
              className={cn(
                "rounded-full px-3 py-1.5 font-medium transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                selectedTier === "gold"
                  ? "bg-warn-surface/40 border border-warn/40 text-warn font-semibold"
                  : "border border-border bg-surface text-muted hover:text-foreground",
              )}
            >
              <Sparkle weight="bold" className="inline mr-1 h-3 w-3 text-warn" />
              Gold Tier Only ({goldCount})
            </button>

            <select
              value={selectedStage}
              onChange={(e) =>
                setSelectedStage(
                  e.target.value === "all" ? "all" : Number(e.target.value),
                )
              }
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none cursor-pointer"
            >
              <option value="all">All Stages (0–4)</option>
              {STAGES.map((s) => (
                <option key={s.number} value={s.number}>
                  Stage {s.number}: {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-xs font-mono text-muted">
          Showing {filteredItems.length} of {modulesWithSheets.length} cheatsheets
        </div>

        {/* Cheatsheet Cards Grid */}
        <div className="mt-6 space-y-6">
          {filteredItems.map(({ module: mod, sheet }) => {
            const isExpanded = expandedSlug === mod.slug;
            const isGold = sheet.tier === "gold";

            return (
              <div
                key={mod.slug}
                id={`sheet-${mod.slug}`}
                className={cn(
                  "overflow-hidden rounded-[length:var(--radius-lg)] border bg-elevated shadow-elevation transition-all",
                  isExpanded ? "border-accent ring-1 ring-accent/30" : "border-border hover:border-accent/40",
                )}
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className={cn("rounded-full px-2.5 py-0.5 font-mono text-[10px]", STAGE_THEMES[mod.stage]?.pill ?? "text-muted")}>
                        Stage {mod.stage} · Module {mod.number}
                      </span>
                      {isGold ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-warn/40 bg-warn-surface/40 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-warn">
                          <Sparkle weight="fill" className="h-2.5 w-2.5" />
                          Gold Tier
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 font-mono text-[10px] text-muted">
                          Template
                        </span>
                      )}
                    </div>

                    <h2 className="font-display text-xl font-bold tracking-tight text-foreground uppercase">
                      <Link
                        href={`/courses/dsa/${mod.slug}`}
                        className="hover:text-accent hover:underline transition-colors"
                      >
                        {mod.title}
                      </Link>
                    </h2>
                    <p className="mt-1 text-sm text-muted leading-relaxed">
                      {sheet.tagline}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <Link
                      href={`/courses/dsa/${mod.slug}/concept-map`}
                      title="View Concept Map"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[length:var(--radius-xs)] border border-border bg-surface text-muted hover:text-accent hover:border-accent/40 transition"
                    >
                      <TreeStructure weight="bold" className="h-4 w-4" />
                    </Link>

                    <Link
                      href={`/courses/dsa/${mod.slug}/practice#cheatsheet`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-[length:var(--radius-xs)] border border-border bg-surface px-3 text-xs font-medium text-foreground hover:bg-surface/80 transition"
                    >
                      <Target weight="bold" className="h-3.5 w-3.5 text-accent" />
                      <span>Drills & Practice</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setExpandedSlug(isExpanded ? null : mod.slug)}
                      className={cn(
                        "inline-flex h-9 items-center gap-1.5 rounded-[length:var(--radius-xs)] px-3.5 text-xs font-semibold shadow-elevation transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        isExpanded
                          ? "bg-accent/20 border border-accent/40 text-accent"
                          : "bg-good text-on-pop hover:brightness-110 active:scale-[0.98]",
                      )}
                    >
                      <span>{isExpanded ? "Collapse" : "View Cheatsheet"}</span>
                      {isExpanded ? (
                        <CaretUp weight="bold" className="h-3.5 w-3.5" />
                      ) : (
                        <CaretDown weight="bold" className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Summary Strip (Shown when collapsed) */}
                {!isExpanded && (
                  <div className="border-t border-border/70 bg-surface/40 px-5 py-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Complexity sample */}
                      <div>
                        <span className="font-semibold text-foreground block mb-1">
                          Key Operations:
                        </span>
                        <div className="space-y-0.5 font-mono text-[11px] text-muted">
                          {sheet.complexity.slice(0, 2).map((c) => (
                            <div key={c.label} className="flex justify-between">
                              <span className="truncate pr-2 text-muted">{c.label}:</span>
                              <span className="text-good font-semibold shrink-0 font-mono">
                                {c.time} / {c.space}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pattern cues sample */}
                      <div>
                        <span className="font-semibold text-foreground block mb-1">
                          Core Patterns ({sheet.patterns.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {sheet.patterns.slice(0, 3).map((p) => (
                            <span
                              key={p.title}
                              className="rounded-[length:var(--radius-xs)] bg-surface/90 px-1.5 py-0.5 text-[11px] text-foreground font-medium border border-border"
                            >
                              {p.title}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Traps sample */}
                      <div>
                        <span className="font-semibold text-foreground block mb-1">
                          Common Pitfall:
                        </span>
                        {sheet.traps[0] ? (
                          <div className="rounded-[length:var(--radius-xs)] border border-warn/30 bg-warn-surface/20 p-2 text-[11px] text-muted">
                            <Warning
                              weight="bold"
                              className="inline mr-1 text-warn h-3 w-3 align-text-bottom"
                            />
                            <span className="font-medium text-warn">
                              {sheet.traps[0].title}:
                            </span>{" "}
                            <span className="line-clamp-2">{sheet.traps[0].detail}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted">
                            Standard implementation rules
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded Full Cheatsheet Component */}
                {isExpanded && (
                  <div className="border-t border-border bg-background/50 p-4 sm:p-6">
                    <Cheatsheet sheet={sheet} moduleTitle={mod.shortTitle} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
