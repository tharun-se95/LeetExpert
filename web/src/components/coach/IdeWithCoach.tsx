"use client";

import type { ReactNode } from "react";
import { PanelSplit } from "@/components/problems/PanelSplit";
import { useCoach } from "./CoachProvider";
import { CoachRail } from "./CoachRail";

export function IdeWithCoach({ sandbox }: { sandbox: ReactNode }) {
  const { open } = useCoach();

  // Always PanelSplit, never a bare div in the closed branch: switching which
  // element wraps `sandbox` at this position makes React treat it as a new
  // tree and remount everything inside it — which was silently wiping the
  // learner's just-run test results on the very first coach auto-open. See
  // PanelSplit's secondaryCollapsed for the mechanism that avoids it.
  return (
    <PanelSplit
      orientation="horizontal"
      initialPrimary={0.62}
      minPrimary={0.55}
      maxPrimary={0.82}
      resizeLabel="Resize editor and coach"
      secondaryCollapsed={!open}
      primary={
        <div className="h-full min-h-0 min-w-0 overflow-hidden">{sandbox}</div>
      }
      secondary={open ? <CoachRail /> : null}
    />
  );
}
