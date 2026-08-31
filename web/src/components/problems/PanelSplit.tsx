"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DotsSixVertical } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * Two-pane split with a drag handle. Fractions are of the container along
 * the split axis; clamped so neither pane collapses into unreadability.
 */
export function PanelSplit({
  orientation,
  primary,
  secondary,
  initialPrimary = 0.5,
  minPrimary = 0.25,
  maxPrimary = 0.75,
  className,
  resizeLabel,
}: {
  orientation: "horizontal" | "vertical";
  primary: ReactNode;
  secondary: ReactNode;
  initialPrimary?: number;
  minPrimary?: number;
  maxPrimary?: number;
  className?: string;
  resizeLabel?: string;
}) {
  const [primaryFrac, setPrimaryFrac] = useState(initialPrimary);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const raw =
        orientation === "horizontal"
          ? (e.clientX - rect.left) / rect.width
          : (e.clientY - rect.top) / rect.height;
      setPrimaryFrac(Math.min(maxPrimary, Math.max(minPrimary, raw)));
    },
    [orientation, minPrimary, maxPrimary],
  );

  const stopDrag = useCallback(() => {
    dragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDrag);
    window.addEventListener("pointercancel", stopDrag);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDrag);
      window.removeEventListener("pointercancel", stopDrag);
    };
  }, [onPointerMove, stopDrag]);

  const startDrag = () => {
    dragging.current = true;
    document.body.style.cursor =
      orientation === "horizontal" ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";
  };

  const horizontal = orientation === "horizontal";
  const primaryStyle = horizontal
    ? { width: `${primaryFrac * 100}%` }
    : { height: `${primaryFrac * 100}%` };

  return (
    <div
      ref={containerRef}
      className={cn(
        // h-full/w-full fill a sized block parent (nested splits). flex-1
        // fills when this node is itself a flex item. Without both, the
        // inner IDE column sizes to content and leaves a dead band below.
        "flex h-full min-h-0 min-w-0 w-full flex-1",
        horizontal ? "flex-row" : "flex-col",
        className,
      )}
    >
      <div
        className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden"
        style={primaryStyle}
      >
        {primary}
      </div>
      {/*
        The bar itself stays the app's usual hairline weight — every other
        divider in this app is this same low-alpha --border, and making
        just this one loud would read as inconsistent chrome rather than a
        deliberate control. What was missing was an affordance that says
        "this splits, and it moves" — that's the grip chip below, which is
        the one thing here that departs from a plain line, on purpose.
      */}
      <button
        type="button"
        aria-label={
          resizeLabel ??
          (horizontal
            ? "Resize description and editor"
            : "Resize editor and tests")
        }
        onPointerDown={(e) => {
          e.preventDefault();
          startDrag();
        }}
        className={cn(
          "group relative shrink-0 touch-none bg-border transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
          horizontal ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize",
        )}
      >
        {/*
          Same bg-elevated + shadow-elevation chip idiom CodeEditor already
          uses for its own focus hint — a small floating surface reads as
          "there's a control here" precisely because the rest of the app
          reserves that treatment for exactly that. Visible at rest (a
          hover-only affordance can't be discovered without already
          suspecting the seam is interactive) at reduced opacity, full
          strength and accent-tinted once you're actually on the handle.
        */}
        <span
          aria-hidden
          className={cn(
            "shadow-elevation pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-elevated text-muted opacity-70 transition-all duration-[var(--dur-fast)] ease-[var(--ease)] group-hover:border-accent/40 group-hover:text-foreground group-hover:opacity-100 group-focus-visible:border-accent/40 group-focus-visible:text-foreground group-focus-visible:opacity-100 motion-reduce:transition-none",
            horizontal ? "h-9 w-4" : "h-4 w-9",
          )}
        >
          <DotsSixVertical
            size={12}
            weight="bold"
            className={horizontal ? undefined : "rotate-90"}
          />
        </span>
      </button>
      <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
        {secondary}
      </div>
    </div>
  );
}
