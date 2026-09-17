"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import type { ThemedToken } from "shiki";
import { cn } from "@/lib/utils";
import { LanguageMark } from "@/components/kit/languageMarks";
import { tokenizeVizCode, type VizLang } from "@/lib/viz/highlightVizCode";
import { useCodeLang } from "@/lib/codeLang";
import { resolveCodeLang } from "@/lib/codeLanguages";
import type { VizCode, VizLineRef } from "@/components/viz/types";

const LABEL: Record<VizLang, string> = {
  python: "Python",
  typescript: "TypeScript",
};

const VIZ_LANGS: VizLang[] = ["python", "typescript"];

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
  // The language is chosen once in the header, not per panel.
  const [codeLang] = useCodeLang();
  const lang = resolveCodeLang(codeLang, VIZ_LANGS);
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
        <span className="code-lang-label">
          <LanguageMark language={lang} />
          {LABEL[lang]}
        </span>
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
                  className="absolute inset-0 border-l-2 border-[var(--family-accent,var(--accent))] bg-[var(--family-accent,var(--accent))]/12"
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
