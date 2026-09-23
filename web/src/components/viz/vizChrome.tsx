"use client";

import { createContext, useContext } from "react";

/**
 * Whether the viz player sits inside an already-framed surface, and whether
 * it shows its code panel (the landing page shows the stage alone; the
 * fullscreen view still brings the code back).
 */
export const VizChromeContext = createContext({ embedded: false, code: true });

export function useVizChrome() {
  return useContext(VizChromeContext);
}
