"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FilmSlate, X } from "@phosphor-icons/react/dist/ssr";
import { VideoPlayer } from "@/components/course/VideoPlayer";

interface WatchLessonLinkProps {
  videoSrc: string;
  lessonTitle: string;
}

/**
 * Sits in the header meta row next to the audio control, styled as the same
 * kind of accent-tinted pill — a selling point worth noticing, not a plain
 * text link. The video itself only exists inside the dialog it opens — no
 * card in the article body, no autoplaying media the learner didn't ask for.
 */
export function WatchLessonLink({ videoSrc, lessonTitle }: WatchLessonLinkProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/[0.08] py-1 pr-3 pl-2.5 font-medium text-mark transition hover:border-accent/50 hover:bg-accent/[0.14]"
      >
        <FilmSlate weight="fill" className="h-3.5 w-3.5 text-accent" />
        Watch this lesson
      </button>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 p-4 backdrop-blur-[2px]"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setOpen(false);
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-label={`Video: ${lessonTitle}`}
                className="relative w-full max-w-3xl"
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close video"
                  className="absolute -top-11 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-elevated text-foreground transition hover:bg-surface"
                >
                  <X weight="bold" className="h-4 w-4" />
                </button>
                <VideoPlayer
                  src={videoSrc}
                  ariaLabel={`Video walkthrough of ${lessonTitle}`}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
