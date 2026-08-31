"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { ArrowsOut as Maximize2, WarningCircle, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface MermaidProps {
  chart: string;
}

type MermaidAPI = typeof import("mermaid").default;

let mermaidModule: MermaidAPI | null = null;
let mermaidImport: Promise<MermaidAPI> | null = null;
/** Serialize initialize + render — concurrent calls corrupt Mermaid's singleton. */
let renderChain: Promise<unknown> = Promise.resolve();

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

function enqueueMermaid<T>(task: () => Promise<T>): Promise<T> {
  const run = renderChain.then(task, task);
  // Keep the chain alive even when a task fails.
  renderChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

/**
 * Mermaid needs resolved hex — CSS vars / alpha borders are ignored or wash out.
 * Values mirror Blueprint (globals.css); see design-tokens allowlist for this file.
 */
function themeConfig(isDark: boolean) {
  const accent = isDark ? "#22d3ee" : "#0891b2";
  const fontFamily =
    "var(--font-sans), Inter, ui-sans-serif, system-ui, sans-serif";

  const flowchart = {
    htmlLabels: true as const,
    curve: "basis" as const,
    padding: 16,
    nodeSpacing: 36,
    rankSpacing: 48,
    diagramPadding: 8,
    useMaxWidth: true,
  };

  if (isDark) {
    return {
      theme: "base" as const,
      fontFamily,
      flowchart,
      themeVariables: {
        darkMode: true,
        background: "transparent",
        fontFamily,
        fontSize: "14px",
        primaryColor: "#1b1b1f",
        primaryTextColor: "#e6edf4",
        primaryBorderColor: accent,
        secondaryColor: "#17171a",
        secondaryTextColor: "#e6edf4",
        secondaryBorderColor: "#2a2a2f",
        tertiaryColor: "#17171a",
        tertiaryTextColor: "#9ca9b8",
        tertiaryBorderColor: "#2a2a2f",
        mainBkg: "#1b1b1f",
        nodeBkg: "#1b1b1f",
        nodeBorder: accent,
        nodeTextColor: "#e6edf4",
        lineColor: "#9ca9b8",
        edgeLabelBackground: "#17171a",
        clusterBkg: "#17171a",
        clusterBorder: "#2a2a2f",
        titleColor: "#9ca9b8",
        textColor: "#e6edf4",
        noteBkgColor: "#1b1b1f",
        noteTextColor: "#e6edf4",
        noteBorderColor: "#2a2a2f",
        activeBorderColor: accent,
      },
    };
  }

  return {
    theme: "base" as const,
    fontFamily,
    flowchart,
    themeVariables: {
      darkMode: false,
      background: "transparent",
      fontFamily,
      fontSize: "14px",
      primaryColor: "#ffffff",
      primaryTextColor: "#16202e",
      primaryBorderColor: accent,
      secondaryColor: "#f3f4f6",
      secondaryTextColor: "#16202e",
      secondaryBorderColor: "#e5e7eb",
      tertiaryColor: "#f3f4f6",
      tertiaryTextColor: "#56606e",
      tertiaryBorderColor: "#e5e7eb",
      mainBkg: "#ffffff",
      nodeBkg: "#ffffff",
      nodeBorder: accent,
      nodeTextColor: "#16202e",
      lineColor: "#56606e",
      edgeLabelBackground: "#ffffff",
      clusterBkg: "#f3f4f6",
      clusterBorder: "#e5e7eb",
      titleColor: "#56606e",
      textColor: "#16202e",
      noteBkgColor: "#f3f4f6",
      noteTextColor: "#16202e",
      noteBorderColor: "#e5e7eb",
      activeBorderColor: accent,
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
  const [retry, setRetry] = useState(0);
  const reduceMotion = useReducedMotion();
  const source = chart.trim();
  // next-themes is undefined on the first client paint — wait so we don't
  // paint light then immediately tear down for dark (and race Mermaid).
  const themeReady = resolvedTheme === "light" || resolvedTheme === "dark";

  useEffect(() => {
    if (!source) {
      setError("Empty mermaid diagram");
      setSvg("");
      return;
    }
    if (!themeReady) return;

    let cancelled = false;
    const renderId = `mermaid-${id}-${resolvedTheme}-${retry}-${Math.random().toString(36).slice(2, 8)}`;

    void enqueueMermaid(async () => {
      try {
        const mermaid = await loadMermaid();
        mermaid.initialize({
          startOnLoad: false,
          suppressErrorRendering: true,
          securityLevel: "loose",
          ...themeConfig(resolvedTheme === "dark"),
        });
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
    });

    return () => {
      cancelled = true;
    };
  }, [source, id, resolvedTheme, themeReady, retry]);

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
      <div className="my-6 overflow-hidden rounded-[length:var(--radius-md)] border border-warn/30 bg-warn/5 p-4">
        <p className="flex items-center gap-1.5 text-sm font-medium text-warn">
          <WarningCircle className="h-4 w-4 shrink-0" aria-hidden />
          Diagram failed to render
        </p>
        <p className="mt-1 text-xs text-muted">{error}</p>
        <button
          type="button"
          className="mt-3 rounded-[length:var(--radius-md)] border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition hover:border-accent/40"
          onClick={() => {
            setError(null);
            setRetry((n) => n + 1);
          }}
        >
          Retry
        </button>
        <pre className="mt-3 max-h-40 overflow-auto font-mono text-[0.7rem] leading-relaxed text-muted">
          {source}
        </pre>
      </div>
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
            "mermaid-diagram w-full overflow-x-auto rounded-[length:var(--radius-md)] border border-border bg-surface px-5 py-6 text-left transition-[border-color] duration-[var(--dur-fast)] ease-[var(--ease)]",
            svg && "cursor-zoom-in hover:border-accent/35",
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
          <span
            className="pointer-events-none absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-[length:var(--radius-sm)] text-muted opacity-0 transition-opacity duration-[var(--dur-fast)] group-hover:opacity-100 group-focus-within:opacity-100"
            aria-hidden
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </div>

      <AnimatePresence>
        {expanded && svg ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/70 p-4"
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
              // bg-elevated, not bg-surface: this floats over a dark scrim —
              // surface is the recessed tier and reads as sunk, the opposite
              // of what a fullscreen lightbox over the page should look like.
              className="relative max-h-[92vh] w-full max-w-5xl overflow-auto rounded-[length:var(--radius-lg)] border border-border bg-elevated shadow-elevation p-8"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="absolute top-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-[length:var(--radius-md)] border border-border bg-elevated text-muted transition hover:text-foreground"
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
