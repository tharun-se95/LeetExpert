import Image from "next/image";
import { Headphones, ImageSquare } from "@phosphor-icons/react/dist/ssr";

interface ChapterMediaProps {
  /** Public path to the chapter's Audio Overview, e.g. /media/hash-tables/audio-hashing-fundamentals.m4a */
  audioSrc?: string;
  /** Public path to the chapter's infographic, e.g. /media/hash-tables/infographic-hashing-fundamentals.webp */
  infographicSrc?: string;
  infographicAlt: string;
  lessonTitle: string;
}

/**
 * Optional per-lesson companions generated from the analogy rewrite's
 * NotebookLM pass: a spoken walkthrough and a one-page visual summary.
 * Renders nothing for lessons that don't have either asset yet.
 */
export function ChapterMedia({
  audioSrc,
  infographicSrc,
  infographicAlt,
  lessonTitle,
}: ChapterMediaProps) {
  if (!audioSrc && !infographicSrc) return null;

  return (
    <div className="mt-6 grid gap-4 print:hidden sm:grid-cols-2">
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
      {infographicSrc ? (
        <details className="group rounded-[length:var(--radius-lg)] border border-border bg-elevated p-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
            <ImageSquare weight="bold" className="h-4 w-4 text-accent" />
            At-a-glance infographic
            <span className="ml-auto text-[10px] normal-case text-muted/70 group-open:hidden">
              show
            </span>
            <span className="ml-auto hidden text-[10px] normal-case text-muted/70 group-open:inline">
              hide
            </span>
          </summary>
          <div className="mt-3 overflow-hidden rounded-[length:var(--radius-md)] border border-border">
            <Image
              src={infographicSrc}
              alt={infographicAlt}
              width={1200}
              height={675}
              className="h-auto w-full"
              sizes="(min-width: 640px) 50vw, 100vw"
            />
          </div>
        </details>
      ) : null}
    </div>
  );
}
