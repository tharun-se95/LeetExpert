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
 * Trace code pane — same brand Shiki palette and code-surface chrome as
 * handbook CodeTabs / CodeBlock. Per-line tokens (not one HTML blob) so the
 * active-line highlight bar and auto-scroll still work.
 */
export function CodePanel({
  code,
  line,
  reduced,
  large = false,
  flush = false,
}: {
  code: VizCode;
  line: VizLineRef;
  reduced: boolean;
  /** Fullscreen mode: bigger type, taller (near-uncapped) scroll area */
  large?: boolean;
  /** No extra border when the parent player is already framed. */
  flush?: boolean;
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
    <div className={cn("code-surface", flush && "border-0")}>
      <div className="code-surface-header">
        <div className="code-surface-tabs" role="tablist" aria-label="Language">
          {TABS.map((tab) => (
            <button
              key={tab.lang}
              type="button"
              role="tab"
              aria-selected={lang === tab.lang}
              data-active={lang === tab.lang ? "true" : "false"}
              onClick={() => setLang(tab.lang)}
              className="code-tab"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={scrollRef}
        className={cn(
          "viz-shiki code-body overflow-y-auto",
          large ? "max-h-[70vh]" : "max-h-[26rem]",
        )}
      >
        {lines.map((text, i) => {
          const isActive = i + 1 === active;
          const tokensForLine = lineTokens?.[i];
          return (
            <div
              key={i}
              ref={isActive ? activeRef : undefined}
              className="relative flex min-w-max"
            >
              {isActive ? (
                <motion.div
                  layoutId={highlightId}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 500, damping: 40 }
                  }
                  className="absolute inset-0 border-l-2 border-accent bg-accent/12"
                  aria-hidden
                />
              ) : null}
              <span className="code-gutter relative">{i + 1}</span>
              <span className="relative pr-4 whitespace-pre">
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
