import { existsSync } from "node:fs";
import { join } from "node:path";

const MEDIA_ROOT = join(process.cwd(), "public", "media");

function publicPathIfExists(...segments: string[]): string | undefined {
  if (!existsSync(join(MEDIA_ROOT, ...segments))) return undefined;
  return `/media/${segments.join("/")}`;
}

/** Module-level video overview + concept map, generated per module. */
export function getModuleMedia(moduleSlug: string) {
  return {
    videoSrc: publicPathIfExists(moduleSlug, "video.mp4"),
    mindMapSrc: publicPathIfExists(moduleSlug, "mindmap.webp"),
  };
}

/** Chapter-level audio walkthrough + infographic, generated per concept lesson. */
export function getChapterMedia(moduleSlug: string, lessonSlug: string) {
  return {
    audioSrc: publicPathIfExists(moduleSlug, `audio-${lessonSlug}.m4a`),
    infographicSrc: publicPathIfExists(
      moduleSlug,
      `infographic-${lessonSlug}.webp`,
    ),
  };
}
