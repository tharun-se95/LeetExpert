// Shared helpers for the Instagram publishing pipeline.
// Kept separate from publish.mjs so the parsing and image steps can be
// exercised without touching the Graph API.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join, basename } from "node:path";

// sharp lives in web/node_modules; load it on first use so the pure helpers
// (and their tests) work in a checkout where web/ has not been installed.
async function loadSharp() {
  return (await import("../../web/node_modules/sharp/lib/index.js")).default;
}

export const REPO = new URL("../../", import.meta.url).pathname.replace(/\/$/, "");
// Where the staged slides are served from. Overridable so a post can be
// rehearsed against a Vercel preview deployment before the images reach
// production — Instagram only needs the URL to be publicly fetchable.
export const SITE = (process.env.SOCIAL_BASE_URL ?? "https://www.leetexpert.com").replace(/\/$/, "");

// Instagram's content-publishing API takes a URL it fetches itself, and the
// documented image format is JPEG — a PNG url is rejected at container
// creation. 1440px is the widest it stores, so anything larger is wasted
// bytes on a file Meta downloads over the wire.
export const MAX_WIDTH = 1440;

/** Pull one "## Heading" section's body out of a post.md. */
export function section(md, heading) {
  const re = new RegExp(`^## ${heading}\\s*$([\\s\\S]*?)(?=^## |\\Z)`, "m");
  const m = md.match(re);
  if (!m) throw new Error(`post.md has no "## ${heading}" section`);
  return m[1].trim();
}

/**
 * The caption as Instagram should receive it. post.md is hard-wrapped for
 * reading; Instagram renders a single newline literally, so unwrap each
 * paragraph back to one line and keep only the blank-line breaks.
 */
export function caption(md) {
  const body = section(md, "Caption")
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
  // post.md is Markdown for humans; Instagram has no rich text and would
  // print the ** and ` markers verbatim, so strip them from the emphasis
  // spans while keeping the words.
  const plain = body
    .replace(/\*\*(.+?)\*\*/gs, "$1")
    .replace(/(?<!`)`([^`]+)`(?!`)/g, "$1");
  const tags = section(md, "Hashtags").replace(/\s*\n\s*/g, " ").trim();
  return `${plain}\n\n${tags}`;
}

/** Convert one slide to the JPEG Instagram will accept, return its bytes. */
export async function toJpeg(src, dest) {
  const sharp = await loadSharp();
  const buf = await sharp(src)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4", mozjpeg: true })
    .toBuffer();
  await mkdir(join(dest, ".."), { recursive: true });
  await writeFile(dest, buf);
  const { width, height } = await sharp(buf).metadata();
  return { bytes: buf.length, width, height };
}

// Aspect band for carousel items. The existing image check tops out at 16:9.
export const CAROUSEL_RATIO_MIN = 0.8;
export const CAROUSEL_RATIO_MAX = 1.7778;

/** Instagram rejects a carousel whose slides are not all 4:5..1.91:1. */
export function checkRatio(width, height) {
  const r = width / height;
  if (r < CAROUSEL_RATIO_MIN || r > CAROUSEL_RATIO_MAX) {
    throw new Error(`aspect ratio ${r.toFixed(3)} is outside Instagram's 4:5 - 16:9`);
  }
  return r;
}

export async function readPackage(dir) {
  const md = await readFile(join(dir, "post.md"), "utf8");
  return { slug: basename(dir), md, caption: caption(md) };
}

// ---------------------------------------------------------------------------
// Video: package kinds, limits, container params (all pure, tested in
// lib.test.mjs), and the one ffprobe call.
// ---------------------------------------------------------------------------

// Limits from Meta's Instagram Platform "Content Publishing" reference
// (Reels and carousel video specs). Reels: MP4/MOV, H.264 video, AAC audio,
// 9:16 recommended, at most 300 MB. The reel DURATION ceiling is the one
// number we are not certain of: Meta's Content Publishing reference has said
// 3-90 s for API reels, while the Instagram app itself now allows longer
// reels. Until it is confirmed against a live account we enforce the
// conservative documented 90 s, so a longer reel is a clear error here
// instead of a container that fails minutes later. Raise REEL_MAX_SECONDS
// (only) once a longer post has succeeded, and say so in the commit.
export const REEL_MIN_SECONDS = 3;
export const REEL_MAX_SECONDS = 90;
export const REEL_MAX_BYTES = 300 * 1024 * 1024;
export const REEL_RATIO = 9 / 16;
export const REEL_RATIO_TOLERANCE = 0.01;
// Video items inside a carousel: 3-60 s each, 100 MB, at most 10 items.
export const CAROUSEL_VIDEO_MIN_SECONDS = 3;
export const CAROUSEL_VIDEO_MAX_SECONDS = 60;
export const CAROUSEL_VIDEO_MAX_BYTES = 100 * 1024 * 1024;
export const CAROUSEL_MAX_ITEMS = 10;
export const CAPTION_MAX = 2200;

// Meta fetches and transcodes video asynchronously: seconds for an image,
// minutes for a reel. Configurable so a slow day is a flag, not an edit.
export const POLL_IMAGE = { timeoutMs: 60_000, intervalMs: 2_000 };
export const POLL_VIDEO = { timeoutMs: 10 * 60_000, intervalMs: 5_000 };

/** Order slideN.mp4 numerically: slide10 sorts after slide2. */
function byNumber(a, b) {
  return Number(a.match(/\d+/)) - Number(b.match(/\d+/));
}

/**
 * What a directory of files is. Throws for ambiguity, because posting the
 * wrong shape of a package is not recoverable once Instagram has it.
 * `stem` is the file extension of the images ("png" in a package, "jpg" once
 * staged) so the same rule serves prepare.mjs and publish.mjs.
 */
export function detectKind(files, imageExt = "png") {
  const imgRe = new RegExp(`^\\d+\\.${imageExt}$`);
  const images = files.filter((f) => imgRe.test(f)).sort(byNumber);
  const slides = files.filter((f) => /^slide\d+\.mp4$/.test(f)).sort(byNumber);
  const reel = files.includes("reel.mp4");
  const found = [images.length && "images", slides.length && "video-carousel", reel && "reel"].filter(Boolean);
  if (found.length === 0) throw new Error(`no NN.${imageExt}, reel.mp4 or slideN.mp4 files`);
  if (found.length > 1) throw new Error(`ambiguous package: has ${found.join(" and ")}`);
  if (found[0] === "images") return { kind: "images", media: images };
  if (found[0] === "reel") return { kind: "reel", media: ["reel.mp4"] };
  return { kind: "video-carousel", media: slides };
}

/**
 * Problems with one video, as strings (empty = fine). `probe` is the shape
 * probeVideo returns; `role` is "reel" or "carousel-item".
 */
export function validateVideo(probe, role) {
  const reel = role === "reel";
  const [min, max, maxBytes] = reel
    ? [REEL_MIN_SECONDS, REEL_MAX_SECONDS, REEL_MAX_BYTES]
    : [CAROUSEL_VIDEO_MIN_SECONDS, CAROUSEL_VIDEO_MAX_SECONDS, CAROUSEL_VIDEO_MAX_BYTES];
  const problems = [];
  if (probe.videoCodec !== "h264") problems.push(`video codec is ${probe.videoCodec ?? "missing"}, Instagram needs h264`);
  if (probe.audioCodec && probe.audioCodec !== "aac") problems.push(`audio codec is ${probe.audioCodec}, Instagram needs aac`);
  if (probe.duration < min) problems.push(`duration ${probe.duration.toFixed(1)}s is under the ${min}s minimum`);
  if (probe.duration > max) {
    problems.push(`duration ${probe.duration.toFixed(1)}s is over the ${max}s API limit for a ${reel ? "reel" : "carousel video"}`);
  }
  if (probe.bytes > maxBytes) problems.push(`${probe.bytes} bytes is over the ${maxBytes} byte limit`);
  const ratio = probe.width / probe.height;
  if (reel) {
    if (Math.abs(ratio - REEL_RATIO) > REEL_RATIO_TOLERANCE) {
      problems.push(`aspect ${ratio.toFixed(3)} (${probe.width}x${probe.height}) is not 9:16`);
    }
  } else if (ratio < CAROUSEL_RATIO_MIN || ratio > CAROUSEL_RATIO_MAX) {
    problems.push(`aspect ${ratio.toFixed(3)} is outside Instagram's 4:5 - 16:9`);
  }
  return problems;
}

/** Problems with the package as a whole (item count, caption). */
export function validatePackage(kind, count, captionText) {
  const problems = [];
  if (kind === "video-carousel" || kind === "images") {
    if (count > CAROUSEL_MAX_ITEMS) problems.push(`Instagram carousels hold ${CAROUSEL_MAX_ITEMS} items, found ${count}`);
  }
  if (captionText.length > CAPTION_MAX) problems.push(`caption is ${captionText.length} chars, Instagram allows ${CAPTION_MAX}`);
  return problems;
}

// --- container parameters (what publish.mjs POSTs to /{ig-id}/media) -------

export const imageParams = (image_url, caption) => ({ image_url, caption });
export const imageChildParams = (image_url) => ({ image_url, is_carousel_item: "true" });
export const reelParams = ({ videoUrl, coverUrl, caption }) => ({
  media_type: "REELS",
  video_url: videoUrl,
  cover_url: coverUrl,
  share_to_feed: "true",
  caption,
});
export const videoChildParams = (video_url) => ({
  media_type: "VIDEO",
  video_url,
  is_carousel_item: "true",
});
export const carouselParams = (childIds, caption) => ({
  media_type: "CAROUSEL",
  children: childIds.join(","),
  caption,
});

/** Timeout and interval for polling a container of this kind. */
export function pollPlan(kind, overrideSeconds) {
  const base = kind === "images" ? POLL_IMAGE : POLL_VIDEO;
  if (overrideSeconds === undefined) return base;
  const s = Number(overrideSeconds);
  if (!Number.isFinite(s) || s <= 0) throw new Error(`poll timeout must be a positive number of seconds, got "${overrideSeconds}"`);
  return { ...base, timeoutMs: s * 1000 };
}

/** A slug names a directory we may delete; refuse anything path-like. */
export function assertSlug(slug) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(slug) || slug.includes("..")) {
    throw new Error(`"${slug}" is not a package slug`);
  }
  return slug;
}

/** Turn ffprobe's JSON into the flat shape validateVideo reads. */
export function parseProbe(json) {
  const v = json.streams?.find((s) => s.codec_type === "video");
  const a = json.streams?.find((s) => s.codec_type === "audio");
  return {
    videoCodec: v?.codec_name,
    audioCodec: a?.codec_name,
    width: v?.width ?? 0,
    height: v?.height ?? 1,
    duration: Number(json.format?.duration ?? 0),
    bytes: Number(json.format?.size ?? 0),
  };
}

export async function probeVideo(path) {
  const { stdout } = await promisify(execFile)("ffprobe", [
    "-v", "error", "-print_format", "json", "-show_streams", "-show_format", path,
  ]);
  return parseProbe(JSON.parse(stdout));
}
