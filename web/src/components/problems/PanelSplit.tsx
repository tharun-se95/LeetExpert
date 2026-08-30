"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
  secondaryCollapsed = false,
}: {
  orientation: "horizontal" | "vertical";
  primary: ReactNode;
  secondary: ReactNode;
  initialPrimary?: number;
  minPrimary?: number;
  maxPrimary?: number;
  className?: string;
  resizeLabel?: string;
  /**
   * Primary fills the container; the handle and secondary are not rendered.
   * This is how a caller closes the secondary pane WITHOUT switching which
   * element type wraps `primary` at the call site — doing that (e.g.
   * returning a bare div instead of <PanelSplit>) makes React treat it as a
   * different tree and remount everything inside `primary`, discarding any
   * state it holds. PanelSplit itself stays mounted across the toggle, so
   * `primary`'s subtree never unmounts.
   */
  secondaryCollapsed?: boolean;
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
  const primaryStyle = secondaryCollapsed
    ? undefined
    : horizontal
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
        className={cn(
          "flex h-full min-h-0 min-w-0 flex-col overflow-hidden",
          secondaryCollapsed ? "w-full flex-1" : "w-full",
        )}
        style={primaryStyle}
      >
        {primary}
      </div>
      {secondaryCollapsed ? null : (
        <>
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
              "shrink-0 touch-none bg-border transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
              horizontal ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize",
            )}
          />
          <div className="flex h-full min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden">
            {secondary}
          </div>
        </>
      )}
    </div>
  );
}
