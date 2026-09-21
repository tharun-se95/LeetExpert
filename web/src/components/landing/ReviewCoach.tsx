"use client";

import { CoachPanel } from "@/components/coach/CoachPanel";
import { ScriptedCoachProvider } from "@/components/coach/CoachProvider";
import { COACH_LOCKED, reviewThread } from "@/lib/landing/method";

/** Built once: a new array each render would re-run the thread's scroll-to-latest. */
const THREAD = reviewThread();

/** Review's window: the real coach panel over the scripted thread, asking nothing of the AI. */
export function ReviewCoach() {
  return (
    <ScriptedCoachProvider thread={THREAD} lockedReason={COACH_LOCKED}>
      <CoachPanel variant="showcase" />
    </ScriptedCoachProvider>
  );
}
