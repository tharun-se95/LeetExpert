"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Floating live community status pill anchored at the bottom-right of the viewport
 * (matching fanout.sh's "● 136 online" widget).
 */
export function FloatingLivePresence() {
  const pathname = usePathname();
  // Don't clutter the IDE cockpit or landing page hero (which already has its own ticker).
  if (pathname === "/" || pathname.includes("/problems/")) {
    return null;
  }

  return (
    <div
      aria-label="142 active engineers online"
      className={cn(
        "fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-2 rounded-full border border-border/80 bg-surface/90 px-3.5 py-1.5 text-xs font-mono shadow-elevation backdrop-blur-md text-foreground transition-all duration-[var(--dur-fast)] ease-[var(--ease)] hover:border-accent/40 hover:scale-105 active:scale-95",
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-good opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-good" />
      </span>
      <span className="font-semibold text-foreground tabular-nums">142</span>
      <span className="text-muted">online</span>
    </div>
  );
}
