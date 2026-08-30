"use client";

import type { ReactNode } from "react";
import { CoachOverlay } from "./CoachOverlay";

/**
 * The sandbox now keeps the full width — the coach floats over it rather
 * than taking a pane beside it, so there is no split to manage here.
 */
export function IdeWithCoach({ sandbox }: { sandbox: ReactNode }) {
  return (
    <div className="h-full min-h-0 min-w-0 overflow-hidden">
      {sandbox}
      <CoachOverlay />
    </div>
  );
}
