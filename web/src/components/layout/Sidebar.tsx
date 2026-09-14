"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DotsSixVertical } from "@phosphor-icons/react";
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
 * The opener floats at the viewport's bottom-left (FloatingLessonsButton)
 * rather than living in a collapsed rail. A problem page already has the
 * description, the editor, and the coach competing for horizontal space, so a
 * drawer nobody has open should cost none of it. Closing lives in the nav's
 * own pinned header row (CourseNavPanel), which this passes onClose to.
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
        // .sidebar-rail + .grain-paper (globals.css): the app header's grainy
        // paper. --grain-paper tells the grain veil that paper is the rail's.
        // z-45: above the sticky header (z-40) so the header's shadow-edge-bottom
        // stops falling across the rail's top edge, and still below the search
        // dialog and mobile sheet (z-50), which must cover everything.
        //
        // In flow, not fixed: the drawer pushes the article aside rather than
        // covering it. That means the open/close animation is a width change
        // and so relayouts the column each frame — the cost of pushing; a
        // transform slide can only be smooth because it moves nothing else.
        // No overflow-hidden here: the resize grip's pill overhangs the right
        // edge, and the aside clipping its own overflow would cut it off.
        // The inner wrapper does the clipping instead.
        //
        // clip-path keeps the edge shadow off the header: the rail sits above
        // it (z-45), and a box-shadow's blur spreads upward too, across the
        // rail's whole width onto the header's bottom edge. Clipped at top,
        // bottom and left; 3rem open on the right — past the grip's pill and
        // its focus ring, and past the shadow's own reach, which it keeps.
        "sidebar-rail print:hidden relative z-[45] hidden h-full shrink-0 flex-col lg:flex [clip-path:inset(0_-3rem_0_0)] grain-paper [--grain-paper:var(--rail-surface)]",
        // The drag handle must track the pointer 1:1, so it opts out.
        !dragging &&
          "transition-[width] duration-[var(--dur-gentle)] ease-[var(--ease-gentle)] motion-reduce:transition-none",
        // box-shadow isn't clipped by the element's own overflow-hidden, so a
        // 0-width closed drawer would still show a shadow sliver.
        open ? "border-r border-border shadow-edge-right" : "",
      )}
    >
      {/*
        Takes the clipping the aside gave up, at exactly the animating width:
        the fixed-width column inside has to clip as the panel collapses
        rather than reflow its contents down to nothing on the way.
      */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="flex h-full flex-col" style={{ width }}>
          {/* No top padding here: the nav's pinned header row carries it along
              with the close button, so rows scrolling under the row have no
              gap above it to show through. */}
          <CourseNavTree compact onClose={onClose} className="px-5 pb-6" />
        </div>
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
