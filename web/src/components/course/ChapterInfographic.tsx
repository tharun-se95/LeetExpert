import Image from "next/image";
import { ImageSquare } from "@phosphor-icons/react/dist/ssr";

interface ChapterInfographicProps {
  src: string;
  alt: string;
}

/**
 * The lesson's visual recap, placed inside the article's own reading flow
 * (after the prose, before prev/next nav) rather than tucked into a side
 * card — it's part of the chapter, not a supplementary widget.
 */
export function ChapterInfographic({ src, alt }: ChapterInfographicProps) {
  return (
    <figure>
      <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
        <ImageSquare weight="bold" className="h-4 w-4 text-accent" />
        This lesson, at a glance
      </p>
      <div className="overflow-hidden rounded-[length:var(--radius-lg)] border border-border">
        <Image
          src={src}
          alt={alt}
          width={1600}
          height={900}
          className="h-auto w-full"
          sizes="(min-width: 1024px) 900px, 100vw"
        />
      </div>
    </figure>
  );
}
