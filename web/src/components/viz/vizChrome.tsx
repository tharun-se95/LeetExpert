"use client";

import { createContext, useContext } from "react";

/** Whether the viz player sits inside an already-framed surface. */
export const VizChromeContext = createContext({ embedded: false });

export function useVizChrome() {
  return useContext(VizChromeContext);
}
