"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const FRAMES = [
  {
    tab: "Description",
    caption: "Read the prompt. Attempt before opening the write-up.",
  },
  {
    tab: "Editor",
    caption: "Write in Python or JavaScript. Starter code is scaffolding only.",
  },
  {
    tab: "Testcases",
    caption: "Run cases. See expected vs got. Fix. Repeat.",
  },
  {
    tab: "Explanation",
    caption: "When you’re ready — open the reasoning, then the solution.",
  },
] as const;

/** Light auto-cycling walkthrough; pauses under prefers-reduced-motion. */
export function IdeWalkthrough() {
  const [i, setI] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setI((v) => (v + 1) % FRAMES.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [reduce]);

  const frame = FRAMES[i];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        {FRAMES.map((f, idx) => (
          <button
            key={f.tab}
            type="button"
            onClick={() => setI(idx)}
            className={cn(
              "rounded-md px-2.5 py-1.5 font-mono text-[0.7rem] transition-colors",
              idx === i
                ? "bg-pop text-on-pop"
                : "text-muted hover:text-foreground",
            )}
          >
            {f.tab}
          </button>
        ))}
      </div>
      <div className="space-y-3 p-4">
        <div className="h-24 rounded-lg border border-dashed border-border bg-code/60" />
        <p className="text-sm leading-relaxed text-muted">{frame.caption}</p>
      </div>
    </div>
  );
}
