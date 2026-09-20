// Shared helpers for the Instagram publishing pipeline.
// Kept separate from publish.mjs so the parsing and image steps can be
// exercised without touching the Graph API.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, basename } from "node:path";
import sharp from "../../web/node_modules/sharp/lib/index.js";

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
  const buf = await sharp(src)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4", mozjpeg: true })
    .toBuffer();
  await mkdir(join(dest, ".."), { recursive: true });
  await writeFile(dest, buf);
  const { width, height } = await sharp(buf).metadata();
  return { bytes: buf.length, width, height };
}

/** Instagram rejects a carousel whose slides are not all 4:5..1.91:1. */
export function checkRatio(width, height) {
  const r = width / height;
  if (r < 0.8 || r > 1.7778) {
    throw new Error(`aspect ratio ${r.toFixed(3)} is outside Instagram's 4:5 - 16:9`);
  }
  return r;
}

export async function readPackage(dir) {
  const md = await readFile(join(dir, "post.md"), "utf8");
  return { slug: basename(dir), md, caption: caption(md) };
}
