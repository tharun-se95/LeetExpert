"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { VizCode, VizLineRef } from "@/components/viz/types";

type Lang = "python" | "typescript";

const TABS: { lang: Lang; label: string }[] = [
  { lang: "python", label: "Python" },
  { lang: "typescript", label: "TypeScript" },
];

/**
 * The trace's code pane: Python/TypeScript tabs (styled like CodeTabs) with
 * a layout-animated highlight bar behind the line executing at the current
 * step. Scrolls the active line into view within its own scroll container —
 * never the page.
 */
export function CodePanel({
  code,
  line,
  reduced,
}: {
  code: VizCode;
  line: VizLineRef;
  reduced: boolean;
}) {
  const [lang, setLang] = useState<Lang>("python");
  const highlightId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  const lines = code[lang].split("\n");
  const active = line[lang];

  useEffect(() => {
    const container = scrollRef.current;
    const el = activeRef.current;
    if (!container || !el) return;
    const top = el.offsetTop - container.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < container.scrollTop || bottom > container.scrollTop + container.clientHeight) {
      container.scrollTo({
        top: top - container.clientHeight / 2,
        behavior: reduced ? "auto" : "smooth",
      });
    }
  }, [active, lang, reduced]);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-code">
      <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.lang}
            type="button"
            onClick={() => setLang(tab.lang)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition",
              lang === tab.lang
                ? "bg-background text-foreground shadow-sm"
                : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        ref={scrollRef}
        className="max-h-72 overflow-x-auto overflow-y-auto py-2 font-mono text-[0.8rem] leading-relaxed"
      >
        {lines.map((text, i) => {
          const isActive = i + 1 === active;
          return (
            <div
              key={i}
              ref={isActive ? activeRef : undefined}
              className="relative flex min-w-max px-3"
            >
              {isActive ? (
                <motion.div
                  layoutId={highlightId}
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
                  className="absolute inset-0 border-l-2 border-accent bg-accent/12"
                  aria-hidden
                />
              ) : null}
              <span className="relative w-6 shrink-0 select-none pr-3 text-right text-muted/60">
                {i + 1}
              </span>
              <span className="relative whitespace-pre">{text || " "}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
