"use client";

import Image from "next/image";
import { Lightning, Target, Trophy, Sparkle } from "@phosphor-icons/react";
import type { CuratedListId } from "@/lib/course/catalog/types";
import { familyCssVars } from "@/lib/visual/familyTheme";
import type { FamilyId } from "@/lib/content/manifest";
import { cn } from "@/lib/utils";

interface TrackCard {
  id: CuratedListId;
  familyId: FamilyId;
  kicker: string;
  title: string;
  subtitle: string;
  icon: typeof Lightning;
  image: string;
  badge: string;
  pillTag: string;
}

const TRACKS: TrackCard[] = [
  {
    id: "course",
    familyId: "ordering-search",
    kicker: "Interactive Sandbox",
    title: "Course Drills",
    subtitle: "Dual Python & JavaScript runner with 116 curriculum sandboxes",
    icon: Sparkle,
    image: "/media/cards/track-course-drills.jpg",
    badge: "116 Live Sandboxes",
    pillTag: "SOLVE-FIRST",
  },
  {
    id: "blind75",
    familyId: "pointer-movement",
    kicker: "High-Velocity Core",
    title: "Blind 75",
    subtitle: "The classic high-frequency interview pattern set distilled to essentials",
    icon: Lightning,
    image: "/media/cards/track-blind75.jpg",
    badge: "75 Canonical",
    pillTag: "SPEEDRUN",
  },
  {
    id: "neetcode150",
    familyId: "linear-traversal",
    kicker: "Full Pattern Mastery",
    title: "NeetCode 150",
    subtitle: "Systematic progression ladder from Arrays to Advanced Dynamic Programming",
    icon: Target,
    image: "/media/cards/track-neetcode150.jpg",
    badge: "150 Patterns",
    pillTag: "MASTERY LADDER",
  },
  {
    id: "top150",
    familyId: "relationships",
    kicker: "FAANG & Tier-1 Ready",
    title: "Top Interview 150",
    subtitle: "Curated enterprise interview collection tested at Meta, Google, and Apple",
    icon: Trophy,
    image: "/media/cards/track-top150.jpg",
    badge: "150 Problems",
    pillTag: "TIER-1 INTERVIEW",
  },
];

export function CatalogTrackShowcase({
  activeList,
  onListChange,
  listCounts,
}: {
  activeList: CuratedListId;
  onListChange: (list: CuratedListId) => void;
  listCounts: Record<CuratedListId, number>;
}) {
  return (
    <div className="w-full">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" aria-hidden />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Featured Collections &amp; Tracks
          </h2>
        </div>
        {activeList !== "all" ? (
          <button
            type="button"
            onClick={() => onListChange("all")}
            className="text-xs font-medium text-mark hover:opacity-80 transition-opacity"
          >
            Show All ({listCounts.all})
          </button>
        ) : null}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0 xl:grid-cols-4">
        {TRACKS.map((track) => {
          const isActive = activeList === track.id;
          const count = listCounts[track.id] ?? 0;
          const Icon = track.icon;

          return (
            <button
              key={track.id}
              type="button"
              style={familyCssVars(track.familyId)}
              onClick={() => onListChange(isActive ? "all" : track.id)}
              className={cn(
                "group relative flex shrink-0 w-[280px] sm:w-[320px] lg:w-auto snap-start flex-col overflow-hidden rounded-[length:var(--radius-lg)] border p-3.5 text-left transition-[background-color,border-color,transform,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease)] shadow-elevation motion-reduce:transition-none touch-manipulation",
                isActive
                  ? "border-accent bg-elevated ring-2 ring-accent/30 shadow-elevation"
                  : "border-border bg-elevated hover:-translate-y-1 hover:border-accent/60 hover:shadow-elevation",
              )}
            >
              {/* Marketing Visual Thumbnail */}
              <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-[length:var(--radius-md)] bg-surface border border-border/60">
                <Image
                  src={track.image}
                  alt={track.title}
                  fill
                  sizes="(min-width: 1280px) 340px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />

                {/* Ambient vignette and subtle glow wash */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-surface/90 via-surface/20 to-transparent pointer-events-none"
                  aria-hidden
                />

                {/* Floating pill tag */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full border border-border/80 bg-surface/90 px-2.5 py-0.5 backdrop-blur-md">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: "var(--family-accent)" }}
                    aria-hidden
                  />
                  <span className="font-mono text-[9px] font-bold tracking-wider text-foreground">
                    {track.pillTag}
                  </span>
                </div>

                {/* Question count pill */}
                <div className="absolute top-2.5 right-2.5 rounded-full border border-border/80 bg-surface/90 px-2 py-0.5 backdrop-blur-md">
                  <span className="font-mono text-[10px] font-bold text-foreground">
                    {count} Qs
                  </span>
                </div>
              </div>

              {/* Kicker with themed icon */}
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-mark">
                <Icon size={14} weight="bold" />
                <span className="uppercase tracking-wider">{track.kicker}</span>
              </div>

              {/* Title */}
              <h3 className="mt-1 font-display text-base font-bold text-foreground tracking-tight group-hover:text-mark transition-colors">
                {track.title}
              </h3>

              {/* Subtitle */}
              <p className="mt-1 text-xs text-muted line-clamp-2 leading-relaxed">
                {track.subtitle}
              </p>

              {/* Action indicator bar */}
              <div className="mt-3.5 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]">
                <span className="rounded-[length:var(--radius-xs)] bg-accent/[0.1] px-2 py-0.5 text-foreground font-medium">
                  {track.badge}
                </span>
                <span
                  className={cn(
                    "font-bold transition-colors",
                    isActive ? "text-accent" : "text-muted group-hover:text-foreground",
                  )}
                >
                  {isActive ? "Selected ✓" : "Explore Track →"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
