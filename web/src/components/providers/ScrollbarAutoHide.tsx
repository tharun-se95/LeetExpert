"use client";

import { useEffect } from "react";

const IDLE_MS = 900;

/**
 * Marks the element that just scrolled with `data-scrolling` so global
 * scrollbar CSS can reveal the thumb, then clears it after idle. Capture
 * phase covers nested overflow panes (sidebar, IDE splits, markdown).
 */
export function ScrollbarAutoHide() {
  useEffect(() => {
    const timers = new WeakMap<Element, number>();

    const onScroll = (event: Event) => {
      const raw = event.target;
      const el =
        raw instanceof Document
          ? document.documentElement
          : raw instanceof Element
            ? raw
            : null;
      if (!el) return;

      el.setAttribute("data-scrolling", "");
      const prev = timers.get(el);
      if (prev !== undefined) window.clearTimeout(prev);
      timers.set(
        el,
        window.setTimeout(() => {
          el.removeAttribute("data-scrolling");
          timers.delete(el);
        }, IDLE_MS),
      );
    };

    document.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    });
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, []);

  return null;
}
