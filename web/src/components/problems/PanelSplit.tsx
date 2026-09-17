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

/** A computed length in px, or null for "none", "auto" or unset. */
function computedPx(value: string | undefined): number | null {
  const n = parseFloat(value ?? "");
  return Number.isFinite(n) ? n : null;
}

function readStoredRem(key: string | undefined): number | null {
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

/**
 * Two-pane split with a drag handle. By default the handle sizes the primary
 * as a fraction of the container, clamped so neither pane collapses into
 * unreadability. With sizedPane="secondary" it sizes the secondary in rem
 * instead (optionally remembered), and the primary takes the rest.
 *
 * The primary is always the first child, in every mode: a secondary that
 * comes, goes or stops resizing never remounts it. The problem workspace's
 * sandbox lives there, and a remount would wipe its run results.
 */
export function PanelSplit({
  orientation,
  primary,
  secondary,
  initialPrimary = 0.5,
  minPrimary = 0.25,
  maxPrimary = 0.75,
  className,
  primaryClassName,
  secondaryClassName,
  sizedPane = "primary",
  resizable = true,
  storageKey,
  resizeLabel,
}: {
  orientation: "horizontal" | "vertical";
  primary: ReactNode;
  /** null: the primary fills the split and there is no handle. */
  secondary: ReactNode | null;
  initialPrimary?: number;
  minPrimary?: number;
  maxPrimary?: number;
  className?: string;
  /** Classes for the primary pane; a CSS max- or min-width there also bounds the drag. */
  primaryClassName?: string;
  /** Classes for the secondary pane; with sizedPane="secondary" its CSS limits bound the drag. */
  secondaryClassName?: string;
  /** Which pane the handle sizes. */
  sizedPane?: "primary" | "secondary";
  /** false: no handle and no applied size, for a fixed secondary such as a collapsed strip. */
  resizable?: boolean;
  /** Remembers the secondary's size in rem (sizedPane="secondary" only). */
  storageKey?: string;
  resizeLabel?: string;
}) {
  const [primaryFrac, setPrimaryFrac] = useState(initialPrimary);
  const [secondaryRem, setSecondaryRem] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLDivElement>(null);
  const secondaryRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const dragging = useRef(false);
  const draggedRem = useRef<number | null>(null);

  // Read after mount: storage does not exist during the server render.
  useEffect(() => {
    setSecondaryRem(readStoredRem(storageKey));
  }, [storageKey]);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const horizontal = orientation === "horizontal";
      const size = horizontal ? rect.width : rect.height;
      if (size <= 0) return;

      if (sizedPane === "secondary") {
        const secondaryEl = secondaryRef.current;
        const primaryEl = primaryRef.current;
        if (!secondaryEl || !primaryEl) return;
        const s = getComputedStyle(secondaryEl);
        const p = getComputedStyle(primaryEl);
        const handleBox = handleRef.current?.getBoundingClientRect();
        const handle = (horizontal ? handleBox?.width : handleBox?.height) ?? 0;
        const wanted = horizontal ? rect.right - e.clientX : rect.bottom - e.clientY;
        const floor = computedPx(horizontal ? s.minWidth : s.minHeight) ?? 0;
        const cap = computedPx(horizontal ? s.maxWidth : s.maxHeight) ?? Infinity;
        // The primary's own floor caps the secondary too: dragging the coach
        // wider must never squeeze the editor below its minimum.
        const primaryFloor = computedPx(horizontal ? p.minWidth : p.minHeight) ?? 0;
        const px = Math.max(floor, Math.min(cap, size - handle - primaryFloor, wanted));
        const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        // rem, not px: the app steps its root size with the viewport, and a
        // remembered px width would drift against everything around it.
        const rem = Math.round((px / rootPx) * 1000) / 1000;
        draggedRem.current = rem;
        setSecondaryRem(rem);
        return;
      }

      const raw = horizontal
        ? (e.clientX - rect.left) / rect.width
        : (e.clientY - rect.top) / rect.height;
      // A CSS size limit on the pane bounds the drag too. Past a max-width the
      // pane stops growing while the stored fraction would not, so the handle
      // would run on with nothing following it. A min-width is a floor that
      // holds on any screen, so it relaxes the fractional one: on a wide
      // screen that fraction can exceed the cap and lock the pane in place.
      const style = primaryRef.current ? getComputedStyle(primaryRef.current) : null;
      const px = (value: string | undefined) => {
        const n = parseFloat(value ?? "");
        return Number.isFinite(n) ? n / size : null;
      };
      const cap = px(horizontal ? style?.maxWidth : style?.maxHeight);
      const floor = px(horizontal ? style?.minWidth : style?.minHeight);
      const max = cap === null ? maxPrimary : Math.min(maxPrimary, cap);
      const min = Math.min(floor === null ? minPrimary : Math.min(minPrimary, floor), max);
      setPrimaryFrac(Math.min(max, Math.max(min, raw)));
    },
    [orientation, minPrimary, maxPrimary, sizedPane],
  );

  const stopDrag = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    if (storageKey && draggedRem.current !== null) {
      try {
        window.localStorage.setItem(storageKey, String(draggedRem.current));
      } catch {
        // Private mode: the width still holds for this visit.
      }
    }
    draggedRem.current = null;
  }, [storageKey]);

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
  const hasSecondary = secondary !== null;
  const sizesSecondary = sizedPane === "secondary";
  const primaryStyle =
    hasSecondary && !sizesSecondary
      ? horizontal
        ? { width: `${primaryFrac * 100}%` }
        : { height: `${primaryFrac * 100}%` }
      : undefined;
  const secondaryStyle =
    sizesSecondary && resizable && secondaryRem !== null
      ? horizontal
        ? { width: `${secondaryRem}rem` }
        : { height: `${secondaryRem}rem` }
      : undefined;

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
        ref={primaryRef}
        className={cn(
          "flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden",
          (sizesSecondary || !hasSecondary) && "flex-1",
          primaryClassName,
        )}
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
      {hasSecondary && resizable ? (
        <button
          ref={handleRef}
          type="button"
          data-split-handle
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
      ) : null}
      {hasSecondary ? (
        <div
          ref={secondaryRef}
          className={cn(
            "flex h-full min-h-0 min-w-0 flex-col overflow-hidden",
            // A sized secondary may still shrink to its own floor when the row
            // is narrower than its width; the primary's floor stays intact.
            sizesSecondary ? null : "w-full flex-1",
            secondaryClassName,
          )}
          style={secondaryStyle}
        >
          {secondary}
        </div>
      ) : null}
    </div>
  );
}
