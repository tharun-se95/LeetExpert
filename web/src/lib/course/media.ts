import { existsSync } from "node:fs";
import { join } from "node:path";

const MEDIA_ROOT = join(process.cwd(), "public", "media");

function publicPathIfExists(...segments: string[]): string | undefined {
  if (!existsSync(join(MEDIA_ROOT, ...segments))) return undefined;
  return `/media/${segments.join("/")}`;
}

/**
 * Per-module card art — one generated still, re-inked at build time into a
 * light and a dark file. Both are rendered and swapped in CSS rather than by
 * reading the theme in JS: the curriculum hub is a server component, and
 * `useTheme()` would make all 24 cards client-rendered and flash on load.
 *
 * Returns undefined unless BOTH files exist, so a module whose art failed
 * falls back to its SVG glyph rather than rendering one theme's art in both.
 */
export function getModuleArt(moduleSlug: string) {
  const light = publicPathIfExists("module-art", `${moduleSlug}-light.webp`);
  const dark = publicPathIfExists("module-art", `${moduleSlug}-dark.webp`);
  return light && dark ? { light, dark } : undefined;
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
