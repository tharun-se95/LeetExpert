import { FilmSlate, Headphones } from "@phosphor-icons/react/dist/ssr";
import { VideoPlayer } from "@/components/course/VideoPlayer";

interface ChapterMediaProps {
  /** Public path to the chapter's Video Overview, e.g. /media/hash-tables/video-collision-resolution.mp4 */
  videoSrc?: string;
  /** Public path to the chapter's Audio Overview, e.g. /media/hash-tables/audio-hashing-fundamentals.m4a */
  audioSrc?: string;
  lessonTitle: string;
}

/**
 * Optional per-lesson companions generated from the analogy rewrite's
 * NotebookLM pass: a short video and a spoken walkthrough. The infographic
 * lives inside the article body instead (see ChapterInfographic) — it's
 * part of the reading flow, not a side card. Renders nothing for lessons
 * that don't have either asset yet.
 */
export function ChapterMedia({ videoSrc, audioSrc, lessonTitle }: ChapterMediaProps) {
  if (!videoSrc && !audioSrc) return null;

  return (
    <div className="mt-6 flex flex-col gap-4 print:hidden">
      {videoSrc ? (
        <div className="rounded-[length:var(--radius-lg)] border border-border bg-elevated p-4">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
            <FilmSlate weight="bold" className="h-4 w-4 text-accent" />
            Watch this lesson
          </p>
          <div className="mt-3">
            <VideoPlayer
              src={videoSrc}
              ariaLabel={`Video walkthrough of ${lessonTitle}`}
            />
          </div>
        </div>
      ) : null}
      {audioSrc ? (
        <div className="rounded-[length:var(--radius-lg)] border border-border bg-elevated p-4">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
            <Headphones weight="bold" className="h-4 w-4 text-accent" />
            Listen to this lesson
          </p>
          <audio
            controls
            preload="none"
            className="mt-3 w-full"
            aria-label={`Audio walkthrough of ${lessonTitle}`}
          >
            <source src={audioSrc} type="audio/mp4" />
          </audio>
        </div>
      ) : null}
    </div>
  );
}
