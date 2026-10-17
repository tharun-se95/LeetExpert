"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  ArrowClockwise,
  ArrowLeft,
  WarningCircle,
} from "@phosphor-icons/react";
import { Lamp } from "@/components/brand/Lamp";
import { LOGO_LAMP_SIZE } from "@/components/layout/headerChrome";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected errors for telemetry
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      {/* Background radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--bad)_12%,transparent),_transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-lg text-center">
        {/* Brand mark with lamp */}
        <div className="mb-6 inline-flex items-center justify-center gap-2.5 rounded-full border border-border bg-surface/80 px-4 py-1.5 shadow-elevation backdrop-blur-sm">
          <span className="font-display text-sm font-bold tracking-tight uppercase">
            <span className="text-foreground">leet</span>
            <span className="text-mark">Expert</span>
          </span>
          <Lamp size={LOGO_LAMP_SIZE} bloom />
        </div>

        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-bad/30 bg-bad/10 text-bad mb-3">
          <WarningCircle size={28} weight="bold" />
        </div>

        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-bad">
          Runtime Exception
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground uppercase sm:text-4xl">
          Something went wrong
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          An unexpected error interrupted this view. Your progress and drafts in
          local storage have not been lost.
        </p>

        {error.digest ? (
          <div className="mt-4 inline-block rounded-[length:var(--radius-xs)] border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-muted">
            Digest: {error.digest}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-10 items-center gap-2 rounded-[length:var(--radius-md)] bg-pop px-4 text-sm font-semibold text-on-pop shadow-elevation transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
          >
            <ArrowClockwise weight="bold" className="h-4 w-4" />
            Try again
          </button>

          <Link
            href="/courses/dsa"
            className="inline-flex h-10 items-center gap-2 rounded-[length:var(--radius-md)] border border-border bg-elevated px-4 text-sm font-medium text-foreground shadow-elevation transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowLeft weight="bold" className="h-4 w-4" />
            Back to Curriculum
          </Link>
        </div>
      </div>
    </div>
  );
}
