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

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
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
                "group relative flex items-center gap-3 overflow-hidden rounded-[length:var(--radius-md)] border p-2 text-left transition-all duration-[var(--dur-fast)] ease-[var(--ease)] shadow-elevation motion-reduce:transition-none touch-manipulation cursor-pointer hover:-translate-y-0.5",
                isActive
                  ? "border-accent bg-accent/[0.12] ring-1 ring-accent"
                  : "border-border/80 bg-elevated hover:border-accent/60",
              )}
            >
              {/* Family-themed atmospheric radial back-glow */}
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -right-4 -bottom-4 h-28 w-28 rounded-full transition-opacity duration-300",
                  isActive
                    ? "bg-[radial-gradient(circle,_color-mix(in_srgb,var(--accent)_28%,transparent),_transparent_70%)] opacity-100"
                    : "bg-[radial-gradient(circle,_color-mix(in_srgb,var(--accent)_18%,transparent),_transparent_70%)] opacity-35 group-hover:opacity-90",
                )}
              />

              {/* Compact Thumbnail with specular inner rim */}
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[length:var(--radius-xs)] bg-surface border border-border/60">
                <Image
                  src={track.image}
                  alt={track.title}
                  fill
                  sizes="48px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent pointer-events-none" aria-hidden />
                {/* 1px specular inner rim */}
                <div className="pointer-events-none absolute inset-0 rounded-[length:var(--radius-xs)] ring-1 ring-inset ring-elevated/40" aria-hidden />
              </div>

              {/* Title and stats */}
              <div className="relative min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Icon size={13} weight="bold" className="text-accent shrink-0" aria-hidden />
                  <p className="truncate text-xs font-bold text-foreground group-hover:text-mark transition-colors">
                    {track.title}
                  </p>
                </div>
                <div className="mt-0.5 flex items-center justify-between text-[11px] text-muted">
                  <span className="font-mono text-[10px] text-muted">{count} Qs</span>
                  <span
                    className={cn(
                      "font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                      isActive ? "bg-accent/20 text-accent" : "text-muted group-hover:text-foreground",
                    )}
                  >
                    {isActive ? "Active ✓" : track.pillTag}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
