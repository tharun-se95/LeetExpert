"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useCodeLang } from "@/lib/codeLang";
import type { LessonArtifact } from "@/lib/course/lessonArtifacts";
import { cn } from "@/lib/utils";

/**
 * Shows a lesson's interactive artifact. The page is same-origin static HTML
 * with its own tokens, so it cannot read the app's `.dark` class or code
 * language; the app posts both, and the page follows. The frame stays hidden
 * until the first post lands, so a learner in light mode never sees the page
 * flash in the operating system's theme.
 */
export function LessonArtifactFrame({ artifact }: { artifact: LessonArtifact }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const { resolvedTheme } = useTheme();
  const [lang] = useCodeLang();
  const [ready, setReady] = useState(false);

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
    return true;
  }, [resolvedTheme, lang]);

  useEffect(() => {
    if (post()) setReady(true);
  }, [post]);

  return (
    <iframe
      ref={frame}
      src={`${artifact.src}?embed=1`}
      title={artifact.title}
      onLoad={() => {
        if (post()) setReady(true);
      }}
      className={cn(
        "block h-full w-full border-0 bg-transparent transition-opacity duration-[var(--dur-fast)] motion-reduce:transition-none",
        ready ? "opacity-100" : "opacity-0",
      )}
    />
  );
}

/**
 * The workspace tab panel that holds the frame. It is its own component, not a
 * class switch on the description panel, so that panel keeps the single plain
 * class string the layout tests read; the frame needs no padding and manages
 * its own scrolling.
 */
export function LessonArtifactPanel({
  artifact,
  id,
  labelledBy,
}: {
  artifact: LessonArtifact;
  id: string;
  labelledBy: string;
}) {
  return (
    <div role="tabpanel" id={id} aria-labelledby={labelledBy} className="min-h-0 flex-1 overflow-hidden">
      <LessonArtifactFrame artifact={artifact} />
    </div>
  );
}
