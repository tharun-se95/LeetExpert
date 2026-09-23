"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether a media query matches, kept in step with the window. False on the
 * server and in the first client render, so markup hydrates identically; the
 * real value arrives right after.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
