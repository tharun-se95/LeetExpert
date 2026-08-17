"use client";

import type { ReactNode } from "react";
import { PanelSplit } from "@/components/problems/PanelSplit";
import { useCoach } from "./CoachProvider";
import { CoachHandle, CoachRail } from "./CoachRail";

export function IdeWithCoach({ sandbox }: { sandbox: ReactNode }) {
  const { railOpen } = useCoach();
  const ide = (
    <div className="h-full min-h-0 min-w-0 overflow-hidden">{sandbox}</div>
  );

  if (!railOpen) {
    return (
      <div className="flex h-full min-h-0 min-w-0">
        <div className="min-h-0 min-w-0 flex-1">{ide}</div>
        <CoachHandle />
      </div>
    );
  }

  return (
    <PanelSplit
      orientation="horizontal"
      initialPrimary={0.72}
      minPrimary={0.55}
      maxPrimary={0.82}
      resizeLabel="Resize editor and coach"
      primary={ide}
      secondary={<CoachRail />}
    />
  );
}
