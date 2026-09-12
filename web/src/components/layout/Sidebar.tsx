"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CaretLeft, DotsSixVertical } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { CourseNavTree } from "@/components/layout/CourseNavTree";

interface SidebarProps {
  open: boolean;
  /**
   * Touch devices cannot hover, so they keep an explicit close control; on
   * hover-capable pointers the drawer closes itself when the pointer leaves.
   */
  showClose?: boolean;
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
  showClose = true,
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
      // Stays mounted so the slide has something to animate, and inert while
      // closed so the off-screen tree leaves the tab order with it.
      inert={!open}
      style={{ width }}
      className={cn(
        // sidebar-rail (globals.css): whole-panel wash of the topic's
        // primary colour, split by theme — see the comment there for why
        // light and dark can't share one strength.
        // z-45: above the sticky header (z-40) so the header's shadow-edge-bottom
        // stops falling across the rail's top edge, and still below the search
        // dialog and mobile sheet (z-50), which must cover everything.
        //
        // Fixed, not in flow: the drawer overlays the article instead of
        // pushing it, so opening on hover never reflows the text being read.
        // top-14 clears the sticky header.
        "sidebar-rail print:hidden fixed top-14 bottom-0 left-0 z-[45] hidden flex-col overflow-hidden lg:flex",
        // Transform, not width: it composites on the GPU, so the slide stays
        // smooth where animating width relayouts the whole column each frame.
        // The drag handle must track the pointer 1:1, so it opts out.
        !dragging &&
          "transition-transform duration-[var(--dur)] ease-[var(--ease)] motion-reduce:transition-none",
        open
          ? "translate-x-0 border-r border-border shadow-edge-right"
          : "-translate-x-full",
      )}
    >
      {/*
        Fixed inner width: the panel has to clip as it collapses rather than
        reflow its contents down to nothing on the way.
      */}
      <div className="flex h-full flex-col" style={{ width }}>
        {/*
          No title bar: the panel already names where you are (Overview, or a
          section + module header). What survives is the collapse control —
          FloatingLessonsButton hides itself while the drawer is open, so this
          is the only way to close it on desktop.
        */}
        {/*
          No title bar: the panel names where you are (Overview, or a section +
          module header). The close control only renders where the pointer
          cannot hover — elsewhere the drawer closes itself on pointer-leave.
        */}
        {showClose ? (
          <div className="flex h-9 shrink-0 items-center justify-end px-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] border border-border text-muted transition hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close lessons drawer"
            >
              <CaretLeft className="h-4 w-4" weight="bold" />
            </button>
          </div>
        ) : null}
        <CourseNavTree
          compact
          className={cn("px-5 pb-6", showClose ? undefined : "pt-5")}
        />
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
