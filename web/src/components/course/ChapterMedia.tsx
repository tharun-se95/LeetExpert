import { FilmSlate } from "@phosphor-icons/react/dist/ssr";
import { VideoPlayer } from "@/components/course/VideoPlayer";

interface ChapterMediaProps {
  /** Public path to the chapter's Video Overview, e.g. /media/hash-tables/video-collision-resolution.mp4 */
  videoSrc?: string;
  lessonTitle: string;
}

/**
 * The chapter's video companion, when this lesson has one. Audio lives as
 * a minimal inline control in the header (see AudioMini); the infographic
 * lives inside the article body (see ChapterInfographic) — this is the
 * only one still worth a card, since a video needs real width to be usable.
 */
export function ChapterMedia({ videoSrc, lessonTitle }: ChapterMediaProps) {
  if (!videoSrc) return null;

  return (
    <div className="mt-6 print:hidden">
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
    </div>
  );
}
