"use client";

import { useState } from "react";
import { FunnelSimple, Code, Sparkle, Target, ShieldCheck } from "@phosphor-icons/react";
import type { ProblemGroup } from "@/lib/course/manifest";
import { CatalogTrackShowcase } from "@/components/problems/CatalogTrackShowcase";
import { CatalogCategoryCards } from "@/components/problems/CatalogCategoryCards";
import { CatalogMetricsBar, type ViewMode } from "@/components/problems/CatalogMetricsBar";
import { CatalogCuratedListTabs } from "@/components/problems/CatalogCuratedListTabs";
import { CatalogFilterPanel } from "@/components/problems/CatalogFilterPanel";
import { CatalogFilterSheet } from "@/components/problems/CatalogFilterSheet";
import { CatalogFlatList } from "@/components/problems/CatalogFlatList";
import { ProblemSearch } from "@/components/problems/ProblemSearch";
import { useCatalogFilters } from "@/components/problems/useCatalogFilters";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ProblemsListClient(_props: {
  groups?: ProblemGroup[];
} = {}) {
  const {
    query,
    setQuery,
    activeList,
    setActiveList,
    difficulty,
    setDifficulty,
    status,
    setStatus,
    selectedTopics,
    toggleTopic,
    clearTopics,
    sortBy,
    setSortBy,
    listCounts,
    topicCountMap,
    topics,
    filtered,
    combinedSolved,
    toggleSolved,
    activeFilterCount,
    hasActiveFilters,
    emptyMessage,
    clearFilters,
  } = useCatalogFilters();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="relative flex min-h-full flex-col">
      {/* Dual-tier atmospheric radial glow backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,_color-mix(in_oklab,var(--accent)_18%,transparent),_transparent_70%)]" />
        <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,_color-mix(in_oklab,var(--mark)_14%,transparent),_transparent_60%)]" />
      </div>

      {/* Main container: Expansive max-w-7xl matching Fanout scaling */}
      <div className="relative mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Header and Visual Showcase */}
        <div className="space-y-6">
          {/* Hero Header Card */}
          <div className="relative overflow-hidden rounded-[length:var(--radius-xl)] border border-border bg-elevated/85 backdrop-blur-md p-6 sm:p-8 lg:p-10 shadow-elevation">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent" aria-hidden />
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/[0.1] px-3 py-1 font-mono text-xs uppercase tracking-wider text-mark font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" aria-hidden />
              <span>Curated Problem Library · Dual-Runtime Sandboxes</span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-balance uppercase sm:text-3xl lg:text-4xl">
              DSA Problem Catalog
            </h1>
            <p className="mt-2.5 max-w-3xl text-sm sm:text-base leading-relaxed text-muted">
              Master canonical interview algorithms across 21 core topics.
              Solve all 157 canonical problems directly in live Python &amp; JavaScript sandboxes, or drill targeted tracks.
            </p>
          </div>

          {/* Production Feature Highlights */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="group flex items-center gap-4 rounded-[length:var(--radius-lg)] border border-info-line/30 bg-elevated p-5 sm:p-6 shadow-elevation transition-all duration-[var(--dur-fast)] ease-[var(--ease)] hover:-translate-y-0.5 hover:border-info-line/60">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] border border-info-line/30 bg-info-surface/40 text-info">
                <Code size={22} weight="bold" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm sm:text-base font-bold text-foreground">Dual Python &amp; JS</p>
                <p className="truncate text-xs text-muted mt-0.5">In-browser Pyodide &amp; Node</p>
              </div>
            </div>
            <div className="group flex items-center gap-4 rounded-[length:var(--radius-lg)] border border-accent/25 bg-elevated p-5 sm:p-6 shadow-elevation transition-all duration-[var(--dur-fast)] ease-[var(--ease)] hover:-translate-y-0.5 hover:border-accent/50">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] border border-accent/30 bg-accent/[0.1] text-accent">
                <Sparkle size={22} weight="bold" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm sm:text-base font-bold text-foreground">157 Live Sandboxes</p>
                <p className="truncate text-xs text-muted mt-0.5">Interactive test runners</p>
              </div>
            </div>
            <div className="group flex items-center gap-4 rounded-[length:var(--radius-lg)] border border-warn-line/30 bg-elevated p-5 sm:p-6 shadow-elevation transition-all duration-[var(--dur-fast)] ease-[var(--ease)] hover:-translate-y-0.5 hover:border-warn-line/60">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] border border-warn-line/30 bg-warn-surface/40 text-warn">
                <Target size={22} weight="bold" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm sm:text-base font-bold text-foreground">4 Mastery Tracks</p>
                <p className="truncate text-xs text-muted mt-0.5">Blind 75 &amp; NeetCode 150</p>
              </div>
            </div>
            <div className="group flex items-center gap-4 rounded-[length:var(--radius-lg)] border border-good-line/30 bg-elevated p-5 sm:p-6 shadow-elevation transition-all duration-[var(--dur-fast)] ease-[var(--ease)] hover:-translate-y-0.5 hover:border-good-line/60">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] border border-good-line/30 bg-good-surface/40 text-good">
                <ShieldCheck size={22} weight="bold" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm sm:text-base font-bold text-foreground">Zero Leaked Solutions</p>
                <p className="truncate text-xs text-muted mt-0.5">Solve-first derivation</p>
              </div>
            </div>
          </div>

          {/* Featured Visual Track Showcase (Real Module Art) */}
          <CatalogTrackShowcase
            activeList={activeList}
            onListChange={setActiveList}
            listCounts={listCounts}
          />

          {/* Visual Category Cards Carousel */}
          <CatalogCategoryCards
            selectedTopics={selectedTopics}
            onToggleTopic={toggleTopic}
            topicCounts={topicCountMap}
          />

          {/* Metrics & Layout Switcher Toolbar */}
          <CatalogMetricsBar
            problems={filtered}
            solvedIds={combinedSolved}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Sticky Toolbar: Curated list selection pills & Search */}
          <div className="sticky top-14 z-20 -mx-4 border-y border-border/70 bg-surface/95 px-4 py-3 backdrop-blur-md shadow-edge-bottom sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <CatalogCuratedListTabs
                activeList={activeList}
                onListChange={setActiveList}
                listCounts={listCounts}
              />

              <div className="flex items-center gap-2 sm:w-80 shrink-0">
                <ProblemSearch
                  query={query}
                  onQueryChange={setQuery}
                  className="w-full"
                />

                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  aria-label={
                    activeFilterCount > 0
                      ? `Open filters, ${activeFilterCount} active`
                      : "Open filters"
                  }
                  className="flex min-h-10 min-w-10 shrink-0 touch-manipulation items-center justify-center gap-1.5 rounded-[length:var(--radius-md)] border border-border bg-elevated text-xs font-medium text-foreground lg:hidden"
                >
                  <FunnelSimple className="h-4 w-4" aria-hidden />
                  {activeFilterCount > 0 ? (
                    <span className="badge-glow-accent inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-on-pop ring-2 ring-accent/30">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Responsive Workspace Layout */}
        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[280px_1fr] xl:grid-cols-[310px_1fr]">
          {/* Desktop Left Sidebar: Sticky Filter Panel */}
          <aside className="hidden lg:block sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2 pb-6 [scrollbar-width:thin]">
            <CatalogFilterPanel
              activeList={activeList}
              onListChange={setActiveList}
              listCounts={listCounts}
              status={status}
              onStatusChange={setStatus}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              topics={topics}
              selectedTopics={selectedTopics}
              onToggleTopic={toggleTopic}
              onClearTopics={clearTopics}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          </aside>

          {/* Main Content Area: Problem List or Card Grid */}
          <section className="min-w-0 flex-1 pb-20">
            <CatalogFlatList
              problems={filtered}
              solved={combinedSolved}
              onToggleSolved={toggleSolved}
              sortBy={sortBy}
              onSortChange={setSortBy}
              hasActiveFilters={hasActiveFilters}
              emptyMessage={emptyMessage}
              onClearFilters={clearFilters}
              viewMode={viewMode}
            />
          </section>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <CatalogFilterSheet
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        resultCount={filtered.length}
        activeList={activeList}
        onListChange={setActiveList}
        listCounts={listCounts}
        status={status}
        onStatusChange={setStatus}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        topics={topics}
        selectedTopics={selectedTopics}
        onToggleTopic={toggleTopic}
        onClearTopics={clearTopics}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
