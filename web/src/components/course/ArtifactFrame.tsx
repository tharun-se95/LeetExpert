"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useCodeLang } from "@/lib/codeLang";
import { cn } from "@/lib/utils";

/**
 * Shows a built lesson-artifact page (same-origin static HTML) in a frame. The
 * page has its own tokens and cannot read the app's `.dark` class or code
 * language, so the app posts both and the page follows (the embedding contract
 * in `lesson-artifacts/README.md`). The frame stays hidden until the first post
 * lands, so a learner in light mode never sees the page flash in the operating
 * system's theme.
 *
 * Same contract as `lesson-artifacts/app-integration/src/LessonArtifactFrame.tsx`
 * (parked for the Lesson tab); when that returns it should use this frame.
 */
interface ArtifactFrameProps {
  src: string;
  title: string;
  /**
   * "concept": Full lesson presentation inside the main course desk. Preserves
   * the 2-column desktop hero, 3D visual art, and permanently displays the
   * "On this page" TOC rail without duplicate top bars.
   *
   * "problem": Compact single-column presentation inside ProblemWorkspace's
   * narrow side tab beside the code editor.
   */
  mode?: "concept" | "problem";
}

export function ArtifactFrame({ src, title, mode = "concept" }: ArtifactFrameProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const { resolvedTheme } = useTheme();
  const [lang] = useCodeLang();
  const [ready, setReady] = useState(false);

  const injectConceptStyles = useCallback(() => {
    if (mode !== "concept") return;
    try {
      const doc = frame.current?.contentDocument;
      if (!doc || doc.getElementById("concept-frame-enhancements")) return;

      const style = doc.createElement("style");
      style.id = "concept-frame-enhancements";
      style.textContent = `
        /* Hide redundant inside-iframe header since app chrome sits above */
        .top { display: none !important; }

        /* Permanently display and style the 'On this page' contents rail */
        .split .toc {
          opacity: 1 !important;
          visibility: visible !important;
          transform: translateY(-50%) !important;
          display: flex !important;
          gap: 6px !important;
          padding: 12px 14px !important;
          min-width: 170px !important;
        }
        .split .toc .kick {
          display: block !important;
          font-family: 'JetBrains Mono', monospace !important;
          font-size: 11px !important;
          letter-spacing: 0.1em !important;
          text-transform: uppercase !important;
          color: var(--mut) !important;
          margin-bottom: 6px !important;
        }
        .split .toc a {
          font-size: 13px !important;
          gap: 8px !important;
          padding: 4px 8px !important;
          display: flex !important;
          align-items: center !important;
          white-space: nowrap !important;
        }

        /* Guarantee 2-column hero with visual component side-by-side with text */
        @media (min-width: 900px) {
          .hero2 {
            display: grid !important;
            grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr) !important;
            gap: 48px !important;
            align-items: center !important;
          }
        }
      `;
      doc.head.appendChild(style);
    } catch {
      /* cross-origin guard (though same-origin in practice) */
    }
  }, [mode]);

  const post = useCallback(() => {
    const target = frame.current?.contentWindow;
    if (!target || !resolvedTheme) return false;
    target.postMessage(
      {
        source: "leetexpert",
        theme: resolvedTheme === "dark" ? "dark" : "light",
        // The page has Python and TypeScript blocks; JavaScript reads as TypeScript.
        code: lang === "python" ? "python" : "typescript",
      },
      window.location.origin,
    );
    injectConceptStyles();
    return true;
  }, [resolvedTheme, lang, injectConceptStyles]);

  useEffect(() => {
    if (post()) setReady(true);
  }, [post]);

  const frameSrc = mode === "problem" ? `${src}?embed=1` : src;

  return (
    <iframe
      ref={frame}
      src={frameSrc}
      title={title}
      onLoad={() => {
        injectConceptStyles();
        if (post()) setReady(true);
      }}
      className={cn(
        "block h-full w-full border-0 bg-transparent transition-opacity duration-[var(--dur-fast)] motion-reduce:transition-none",
        ready ? "opacity-100" : "opacity-0",
      )}
    />
  );
}
