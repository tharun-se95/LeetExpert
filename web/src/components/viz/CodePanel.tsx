"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import type { ThemedToken } from "shiki";
import { cn } from "@/lib/utils";
import { tokenizeVizCode, type VizLang } from "@/lib/viz/highlightVizCode";
import type { VizCode, VizLineRef } from "@/components/viz/types";

const TABS: { lang: VizLang; label: string }[] = [
  { lang: "python", label: "Python" },
  { lang: "typescript", label: "TypeScript" },
];

/**
 * The trace's code pane: Python/TypeScript tabs (styled like CodeTabs) with
 * a layout-animated highlight bar behind the line executing at the current
 * step. Scrolls the active line into view within its own scroll container —
 * never the page. Syntax colors come from Shiki, tokenized client-side per
 * line (rather than rendered as one HTML blob like CodeBlock does) so each
 * line can still carry its own ref for the highlight bar and auto-scroll.
 */
export function CodePanel({
  code,
  line,
  reduced,
  large = false,
}: {
  code: VizCode;
  line: VizLineRef;
  reduced: boolean;
  /** Fullscreen mode: bigger type, taller (near-uncapped) scroll area */
  large?: boolean;
}) {
  const [lang, setLang] = useState<VizLang>("python");
  const [tokens, setTokens] = useState<Partial<Record<VizLang, ThemedToken[][]>>>({});
  const highlightId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  const lines = code[lang].split("\n");
  const active = line[lang];
  const lineTokens = tokens[lang];

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      tokenizeVizCode(code.python, "python"),
      tokenizeVizCode(code.typescript, "typescript"),
    ]).then(([python, typescript]) => {
      if (!cancelled) setTokens({ python, typescript });
    });
    return () => {
      cancelled = true;
    };
  }, [code.python, code.typescript]);

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
                ? "bg-background text-foreground"
                : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        ref={scrollRef}
        className={cn(
          "viz-shiki overflow-x-auto overflow-y-auto py-2 font-mono leading-relaxed",
          large ? "max-h-[70vh] text-[0.95rem]" : "max-h-[26rem] text-[0.8rem]",
        )}
      >
        {lines.map((text, i) => {
          const isActive = i + 1 === active;
          const tokensForLine = lineTokens?.[i];
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
              <span className="relative whitespace-pre">
                {tokensForLine && tokensForLine.length > 0
                  ? tokensForLine.map((tok, ti) => (
                      <span key={ti} className="viz-code-token" style={tok.htmlStyle}>
                        {tok.content}
                      </span>
                    ))
                  : text || " "}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
