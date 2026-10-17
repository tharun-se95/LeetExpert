import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  MagnifyingGlass,
  MapTrifold,
  Target,
} from "@phosphor-icons/react/dist/ssr";
import { Lamp } from "@/components/brand/Lamp";
import { LOGO_LAMP_SIZE } from "@/components/layout/headerChrome";

export const metadata: Metadata = {
  title: "Page Not Found · leetExpert",
  description: "The page or lesson you were looking for does not exist or has moved.",
};

export default function NotFound() {
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      {/* Background radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--accent)_14%,transparent),_transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-xl text-center">
        {/* Brand mark with lamp */}
        <div className="mb-6 inline-flex items-center justify-center gap-2.5 rounded-full border border-border bg-surface/80 px-4 py-1.5 shadow-elevation backdrop-blur-sm">
          <span className="font-display text-sm font-bold tracking-tight uppercase">
            <span className="text-foreground">leet</span>
            <span className="text-mark">Expert</span>
          </span>
          <Lamp size={LOGO_LAMP_SIZE} bloom />
        </div>

        {/* 404 Headline */}
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Error 404 · Unresolved Destination
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground uppercase sm:text-5xl">
          Page Not Found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted">
          The lesson, problem drill, or view you are looking for does not exist,
          has been reorganized, or the link may be outdated.
        </p>

        {/* Search recommendation */}
        <div className="mt-8 rounded-[length:var(--radius-lg)] border border-border bg-elevated/70 p-4 text-left shadow-elevation">
          <div className="flex items-center gap-3 text-xs text-muted">
            <MagnifyingGlass className="h-4 w-4 shrink-0 text-accent" aria-hidden />
            <span>
              Looking for a specific algorithmic pattern or problem? Press{" "}
              <kbd className="rounded-[length:var(--radius-xs)] border border-border bg-surface px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                ⌘K
              </kbd>{" "}
              or{" "}
              <kbd className="rounded-[length:var(--radius-xs)] border border-border bg-surface px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                Ctrl+K
              </kbd>{" "}
              to search the entire curriculum.
            </span>
          </div>
        </div>

        {/* Quick Recovery Links Grid */}
        <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-left">
          <Link
            href="/courses/dsa"
            className="group flex items-center gap-3 rounded-[length:var(--radius-md)] border border-border bg-elevated px-4 py-3 shadow-elevation transition hover:border-accent/40 hover:bg-surface"
          >
            <BookOpen weight="bold" className="h-4 w-4 text-accent shrink-0" />
            <div className="min-w-0">
              <span className="block text-sm font-medium text-foreground group-hover:text-accent">
                DSA Curriculum
              </span>
              <span className="block text-xs text-muted truncate">
                All 24 core modules & lessons
              </span>
            </div>
          </Link>

          <Link
            href="/courses/dsa/problems"
            className="group flex items-center gap-3 rounded-[length:var(--radius-md)] border border-border bg-elevated px-4 py-3 shadow-elevation transition hover:border-accent/40 hover:bg-surface"
          >
            <Target weight="bold" className="h-4 w-4 text-accent shrink-0" />
            <div className="min-w-0">
              <span className="block text-sm font-medium text-foreground group-hover:text-accent">
                Practice Problems
              </span>
              <span className="block text-xs text-muted truncate">
                Interactive sandbox drills
              </span>
            </div>
          </Link>

          <Link
            href="/courses/dsa/roadmap"
            className="group flex items-center gap-3 rounded-[length:var(--radius-md)] border border-border bg-elevated px-4 py-3 shadow-elevation transition hover:border-accent/40 hover:bg-surface"
          >
            <MapTrifold weight="bold" className="h-4 w-4 text-accent shrink-0" />
            <div className="min-w-0">
              <span className="block text-sm font-medium text-foreground group-hover:text-accent">
                Curriculum Roadmap
              </span>
              <span className="block text-xs text-muted truncate">
                Visual stage progression & dependencies
              </span>
            </div>
          </Link>

          <Link
            href="/courses/dsa/cheatsheets"
            className="group flex items-center gap-3 rounded-[length:var(--radius-md)] border border-border bg-elevated px-4 py-3 shadow-elevation transition hover:border-accent/40 hover:bg-surface"
          >
            <FileText weight="bold" className="h-4 w-4 text-accent shrink-0" />
            <div className="min-w-0">
              <span className="block text-sm font-medium text-foreground group-hover:text-accent">
                Cheatsheets Hub
              </span>
              <span className="block text-xs text-muted truncate">
                Cues, patterns, and complexity targets
              </span>
            </div>
          </Link>
        </div>

        {/* Primary back to home */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-[length:var(--radius-md)] bg-pop px-5 text-sm font-semibold text-on-pop shadow-elevation transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowLeft weight="bold" className="h-4 w-4" />
            Return to leetExpert Home
          </Link>
        </div>
      </div>
    </div>
  );
}
