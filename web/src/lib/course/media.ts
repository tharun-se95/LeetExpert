import { existsSync } from "node:fs";
import { join } from "node:path";

const MEDIA_ROOT = join(process.cwd(), "public", "media");

function publicPathIfExists(...segments: string[]): string | undefined {
  if (!existsSync(join(MEDIA_ROOT, ...segments))) return undefined;
  return `/media/${segments.join("/")}`;
}

/** Chapter-level video, audio walkthrough, and infographic — generated per concept lesson. */
export function getChapterMedia(moduleSlug: string, lessonSlug: string) {
  return {
    videoSrc: publicPathIfExists(moduleSlug, `video-${lessonSlug}.mp4`),
    audioSrc: publicPathIfExists(moduleSlug, `audio-${lessonSlug}.m4a`),
    infographicSrc: publicPathIfExists(
      moduleSlug,
      `infographic-${lessonSlug}.webp`,
    ),
  };
}
