"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DotsSixVertical, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { CourseNavTree } from "@/components/layout/CourseNavTree";

interface SidebarProps {
  open: boolean;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  onFocusCapture?: () => void;
  onClose: () => void;
}

const WIDTH_KEY = "dsa-sidebar-width";
const DEFAULT_WIDTH = 320;
const MIN_WIDTH = 240;
const MAX_WIDTH = 480;

function clampWidth(px: number): number {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, px));
}

/**
 * Desktop Lessons drawer (≥ lg): a full panel when open, zero-width when not.
 * Mobile uses {@link MobileLessonsSheet} from the header instead.
 *
 * The opener lives in the header rather than in a collapsed rail. A problem
 * page already has the description, the editor, and the coach competing for
 * horizontal space, so a drawer nobody has open should cost none of it.
 */
export function Sidebar({
  open,
  onClose,
  onPointerEnter,
  onPointerLeave,
  onFocusCapture,
}: SidebarProps) {
  // Always starts at the default so the client's first render matches the
  // server's — reading localStorage during init would hydrate a width the
  // server never rendered. The persisted width is applied right after
  // mount instead, same as AppShell does for the open/closed state.
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WIDTH_KEY);
      const parsed = raw ? Number(raw) : NaN;
      if (Number.isFinite(parsed)) setWidth(clampWidth(parsed));
    } catch {
      /* ignore */
    }
  }, []);
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  // Width at drag start, so the handle can be dragged from anywhere on its
  // track without the panel jumping to the cursor's absolute position first.
  const startX = useRef(0);
  const startWidth = useRef(width);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!draggingRef.current) return;
    setWidth(clampWidth(startWidth.current + (e.clientX - startX.current)));
  }, []);

  const stopDrag = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    setWidth((w) => {
      try {
        localStorage.setItem(WIDTH_KEY, String(w));
      } catch {
        /* ignore */
      }
      return w;
    });
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

  const startDrag = (e: React.PointerEvent) => {
    draggingRef.current = true;
    setDragging(true);
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <aside
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocusCapture={onFocusCapture}
      id="lessons-sidebar"
      // Stays mounted so the width transition has something to collapse, and
      // inert while closed so the clipped tree leaves the tab order with it.
      inert={!open}
      style={{ width: open ? width : 0 }}
      className={cn(
        // sidebar-rail (globals.css): whole-panel wash of the topic's
        // primary colour, split by theme — see the comment there for why
        // light and dark can't share one strength.
        // z-45: above the sticky header (z-40) so the header's shadow-edge-bottom
        // stops falling across the rail's top edge, and still below the search
        // dialog and mobile sheet (z-50), which must cover everything.
        //
        // In flow, not fixed: the drawer pushes the article aside rather than
        // covering it. That means the open/close animation is a width change
        // and so relayouts the column each frame — the cost of pushing; a
        // transform slide can only be smooth because it moves nothing else.
        "sidebar-rail print:hidden relative z-[45] hidden h-full shrink-0 flex-col overflow-hidden lg:flex",
        // The drag handle must track the pointer 1:1, so it opts out.
        !dragging &&
          "transition-[width] duration-[var(--dur-gentle)] ease-[var(--ease-gentle)] motion-reduce:transition-none",
        // box-shadow isn't clipped by the element's own overflow-hidden, so a
        // 0-width closed drawer would still show a shadow sliver.
        open ? "border-r border-border shadow-edge-right" : "",
      )}
    >
      {/*
        Fixed inner width: the panel has to clip as it collapses rather than
        reflow its contents down to nothing on the way.
      */}
      <div className="flex h-full flex-col" style={{ width }}>
        {/*
          No title bar: the panel names where you are (Overview, or a section +
          module header). What sits here is the close button — the deliberate
          way out, and the only one on desktop while the drawer is open, since
          FloatingLessonsButton hides itself then. Hover only opens; the
          pointer-out timer is a slow tidy-up, not the close affordance.
        */}
        <div className="flex h-9 shrink-0 items-center justify-end px-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] text-muted transition hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close lessons drawer"
          >
            <X className="h-4 w-4" weight="bold" />
          </button>
        </div>
        <CourseNavTree compact className="px-5 pb-6" />
      </div>
      {/*
        Same grip-chip idiom as PanelSplit's drag handle: a hairline track
        that's visually part of the existing border, with a floating pill
        that says "this moves" without making every drawer edge in the app
        look draggable.
      */}
      <button
        type="button"
        aria-label="Resize lessons drawer"
        onPointerDown={(e) => {
          e.preventDefault();
          startDrag(e);
        }}
        className="group absolute top-0 right-0 z-10 h-full w-2 cursor-col-resize touch-none focus-visible:outline-none"
      >
        <span
          aria-hidden
          className="shadow-elevation pointer-events-none absolute top-1/2 left-1/2 flex h-9 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-elevated text-muted opacity-0 transition-all duration-[var(--dur-fast)] ease-[var(--ease)] group-hover:opacity-100 group-hover:border-accent/40 group-hover:text-foreground group-focus-visible:opacity-100 group-focus-visible:border-accent/40 group-focus-visible:text-foreground motion-reduce:transition-none"
        >
          <DotsSixVertical size={12} weight="bold" />
        </span>
      </button>
    </aside>
  );
}
