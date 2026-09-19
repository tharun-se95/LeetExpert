"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Bookmark, Code, DownloadSimple } from "@phosphor-icons/react";
import { EvolvingStructure } from "@/components/landing/EvolvingStructure";
import { SIGN_IN_COPY } from "@/lib/auth/signInCopy";
import { STAGE_NAMES } from "@/lib/landing/structureLayouts";

/** The landing hero's cadence: longer than the 0.9 s morph, so each stage lands. */
export const STAGE_MS = 1100;
const LAST_STAGE = STAGE_NAMES.length - 1;

const ICONS = { place: Bookmark, code: Code, own: DownloadSimple } as const;

/**
 * The structure plays array → hash table → tree → graph once and rests on the
 * graph; it never loops, because motion that does not stop competes with the
 * buttons for a learner who is choosing a provider. Server render and the first
 * client render both show stage 0, so reduced motion jumping to the graph is an
 * effect, not a hydration mismatch. This file must not import the auth client:
 * SignInButtons is the route's only module that does (authChunkBoundary test).
 */
export function SignInStory() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (reduce) {
      setStage(LAST_STAGE);
      return;
    }
    setStage(0);
    let next = 0;
    const id = window.setInterval(() => {
      next += 1;
      setStage(next);
      if (next >= LAST_STAGE) window.clearInterval(id);
    }, STAGE_MS);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <div>
      <EvolvingStructure stage={stage} className="w-full max-w-xs" />
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {SIGN_IN_COPY.benefits.map(({ id, title, body }) => {
          const Icon = ICONS[id];
          return (
            <li key={id} className="flex gap-4 py-4">
              <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-mark" />
              <div>
                {/* Not a heading: the h1 and the card's h2 own the outline. */}
                <p className="font-display text-sm font-bold">{title}</p>
                <p className="mt-1 text-sm text-muted">{body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
