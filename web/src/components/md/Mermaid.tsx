"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Maximize2, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface MermaidProps {
  chart: string;
}

type MermaidAPI = typeof import("mermaid").default;

let mermaidModule: MermaidAPI | null = null;
let mermaidImport: Promise<MermaidAPI> | null = null;

async function loadMermaid(): Promise<MermaidAPI> {
  if (mermaidModule) return mermaidModule;
  if (!mermaidImport) {
    mermaidImport = import("mermaid").then((mod) => {
      const api = mod.default;
      api.initialize({
        startOnLoad: false,
        // Without this, failed parses leave a "Syntax error in text" SVG on <body>.
        suppressErrorRendering: true,
        securityLevel: "loose",
      });
      mermaidModule = api;
      return api;
    });
  }
  return mermaidImport;
}

function themeConfig(isDark: boolean) {
  return {
    theme: (isDark ? "dark" : "neutral") as "dark" | "neutral",
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui",
    themeVariables: isDark
      ? {
          primaryColor: "#1a1a1a",
          primaryTextColor: "#ededed",
          primaryBorderColor: "#333",
          lineColor: "#a1a1aa",
          secondaryColor: "#111",
          tertiaryColor: "#0a0a0a",
          background: "#0a0a0a",
          mainBkg: "#171717",
          nodeBorder: "#3f3f46",
          clusterBkg: "#111",
        }
      : {
          primaryColor: "#f4f4f5",
          primaryTextColor: "#18181b",
          primaryBorderColor: "#d4d4d8",
          lineColor: "#71717a",
          secondaryColor: "#fafafa",
          tertiaryColor: "#ffffff",
          background: "#ffffff",
          mainBkg: "#fafafa",
          nodeBorder: "#d4d4d8",
        },
  };
}

/** Remove orphan Mermaid temp / error nodes left on document.body. */
function scrubMermaidOrphans(renderId: string) {
  if (typeof document === "undefined") return;
  document.getElementById(`d${renderId}`)?.remove();
  document.getElementById(renderId)?.remove();
  document.querySelectorAll("body > div").forEach((el) => {
    if (
      el.id.startsWith("dmermaid") ||
      (el.querySelector("svg") &&
        /Syntax error in text/i.test(el.textContent ?? ""))
    ) {
      el.remove();
    }
  });
}

export function Mermaid({ chart }: MermaidProps) {
  const id = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    const source = chart.trim();
    if (!source) {
      setError("Empty mermaid diagram");
      setSvg("");
      return;
    }

    async function render() {
      const renderId = `mermaid-${id}-${resolvedTheme === "dark" ? "d" : "l"}-${Date.now()}`;
      try {
        const mermaid = await loadMermaid();
        const isDark = resolvedTheme === "dark";
        mermaid.initialize(themeConfig(isDark));

        const { svg: rendered } = await mermaid.render(renderId, source);
        scrubMermaidOrphans(renderId);
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (err) {
        scrubMermaidOrphans(renderId);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
          setSvg("");
        }
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [chart, id, resolvedTheme]);

  useEffect(() => {
    if (!expanded) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false);
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [expanded]);

  if (error) {
    return (
      <pre className="overflow-x-auto rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-800 dark:text-amber-200">
        {chart}
      </pre>
    );
  }

  return (
    <>
      <div className="group relative my-6">
        <button
          type="button"
          onClick={() => svg && setExpanded(true)}
          disabled={!svg}
          className={cn(
            "mermaid-diagram w-full overflow-x-auto rounded-lg border border-border bg-surface p-4 text-left transition",
            svg && "cursor-zoom-in hover:border-foreground/20",
          )}
          aria-label="Expand diagram to fullscreen"
        >
          {svg ? (
            <div
              ref={containerRef}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <div className="flex h-24 items-center justify-center text-sm text-muted">
              Rendering diagram…
            </div>
          )}
        </button>
        {svg ? (
          <span className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-md border border-border bg-background/90 px-2 py-1 text-[10px] font-medium text-muted opacity-0 shadow-sm transition group-hover:opacity-100">
            <Maximize2 className="h-3 w-3" />
            Expand
          </span>
        ) : null}
      </div>

      <AnimatePresence>
        {expanded && svg ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reducedDuration(reduceMotion)}
            onClick={() => setExpanded(false)}
            role="dialog"
            aria-modal
            aria-label="Fullscreen diagram"
          >
            <motion.div
              className="relative max-h-[92vh] w-full max-w-5xl overflow-auto rounded-2xl border border-border bg-background p-6 shadow-2xl"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted transition hover:text-foreground"
                aria-label="Close fullscreen diagram"
              >
                <X className="h-4 w-4" />
              </button>
              <div
                className="mermaid-diagram flex min-h-[40vh] items-center justify-center [&_svg]:max-h-[80vh] [&_svg]:w-auto"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
              <p className="mt-4 text-center text-xs text-muted">
                Press Esc or click outside to close
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function reducedDuration(reduce: boolean | null) {
  return reduce ? { duration: 0 } : { duration: 0.2 };
}
