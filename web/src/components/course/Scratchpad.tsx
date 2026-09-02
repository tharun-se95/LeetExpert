"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowCounterClockwise as RotateCcw,
  Code as CodeIcon,
} from "@phosphor-icons/react";

const ScratchpadEditor = dynamic(
  () =>
    import("@/components/course/ScratchpadEditor").then(
      (m) => m.ScratchpadEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 animate-pulse border-t border-border bg-code" />
    ),
  },
);

/**
 * A free-write code area for practice drills that aren't a judged pure
 * function (Next.js/React snippets, not DSA algorithm problems) — no
 * grading, since arbitrary React/Next.js code genuinely can't be judged
 * the way a pure function's output can. Pairs with a `reveal` fence
 * placed right after it in the lesson markdown, holding a reference
 * approach to compare against once the learner has made their own
 * attempt. `storageKey` is the fence's meta string, so each lesson's
 * draft persists under its own key without needing a manifest field.
 */
export function Scratchpad({
  source,
  storageKey,
}: {
  source: string;
  storageKey: string;
}) {
  const key = `nextjs:scratchpad:${storageKey}`;
  const [value, setValue] = useState(source);

  // Restoring localStorage during render would desync server/client HTML.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved !== null) setValue(saved);
    } catch {
      /* private mode or a full quota — starter code is a fine fallback */
    }
  }, [key]);

  function onChange(next: string) {
    setValue(next);
    try {
      window.localStorage.setItem(key, next);
    } catch {
      /* losing the draft is survivable */
    }
  }

  function reset() {
    setValue(source);
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* nothing to clean up */
    }
  }

  return (
    <div className="my-6 overflow-hidden rounded-[length:var(--radius-lg)] border border-border bg-surface/30 shadow-elevation">
      <div className="flex items-center justify-between border-b border-border bg-elevated px-3 py-2">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-wide text-muted uppercase">
          <CodeIcon size={13} aria-hidden />
          Your workspace
        </span>
        <button
          type="button"
          onClick={reset}
          title="Restore the starter code"
          className="inline-flex items-center gap-1.5 rounded-[length:var(--radius-md)] px-2 py-1 text-[0.7rem] text-muted transition-colors hover:bg-code hover:text-foreground"
        >
          <RotateCcw size={12} aria-hidden />
          Reset
        </button>
      </div>
      <div className="border-b border-border bg-code">
        <ScratchpadEditor
          value={value}
          onChange={onChange}
          ariaLabel="Practice workspace editor"
        />
      </div>
      <p className="px-3 py-2 text-[0.72rem] text-muted">
        Write your attempt here — it&rsquo;s saved locally in your browser.
        Then open the reveal below to compare against a reference approach.
      </p>
    </div>
  );
}
