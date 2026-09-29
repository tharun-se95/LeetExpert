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
export function ArtifactFrame({ src, title }: { src: string; title: string }) {
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
      src={`${src}?embed=1`}
      title={title}
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
