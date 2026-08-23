import Image from "next/image";
import { FilmSlate, TreeStructure } from "@phosphor-icons/react/dist/ssr";

interface ModuleMediaProps {
  /** Public path to the module's Video Overview, e.g. /media/hash-tables/video.mp4 */
  videoSrc?: string;
  /** Public path to the module's mind map, e.g. /media/hash-tables/mindmap.webp */
  mindMapSrc?: string;
  moduleTitle: string;
}

/**
 * Module-level companions from the analogy rewrite's NotebookLM pass: a
 * short trailer weaving the module's lessons into one arc, and a concept
 * map for orientation before diving into individual lessons. The mind map
 * image ships with a fixed dark background baked in by its source tool, so
 * its card commits to dark rather than following the page theme.
 */
export function ModuleMedia({
  videoSrc,
  mindMapSrc,
  moduleTitle,
}: ModuleMediaProps) {
  if (!videoSrc && !mindMapSrc) return null;

  return (
    <div className="mt-8 grid gap-4 print:hidden sm:grid-cols-2">
      {videoSrc ? (
        <div className="rounded-[length:var(--radius-lg)] border border-border bg-elevated p-4">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
            <FilmSlate weight="bold" className="h-4 w-4 text-accent" />
            Module overview
          </p>
          <video
            controls
            preload="none"
            className="mt-3 w-full rounded-[length:var(--radius-md)]"
            aria-label={`Video overview of ${moduleTitle}`}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>
      ) : null}
      {mindMapSrc ? (
        <div className="rounded-[length:var(--radius-lg)] border border-border bg-elevated p-4">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
            <TreeStructure weight="bold" className="h-4 w-4 text-accent" />
            Concept map
          </p>
          {/* Fixed dark surface — the source image bakes in a black
              background, so a themed card behind it would show seams. */}
          <div className="mt-3 overflow-hidden rounded-[length:var(--radius-md)] border border-border bg-[#050505] p-2">
            <Image
              src={mindMapSrc}
              alt={`Concept map of ${moduleTitle}: how its ideas branch and connect`}
              width={1200}
              height={1200}
              className="h-auto w-full"
              sizes="(min-width: 640px) 50vw, 100vw"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
