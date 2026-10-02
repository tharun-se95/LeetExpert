#!/usr/bin/env node
// Stage a post package's media under web/public/social/<slug>/ so the
// deployed site can serve it. Instagram fetches media from a public URL, so
// the files have to ship with the site before publish.mjs runs.
//
// Three package kinds, detected from the files:
//   NN.png            image post or image carousel -> NN.jpg
//   reel.mp4          reel -> reel.mp4 + cover.jpg (from cover.png)
//   slide1..N.mp4     video carousel -> slideN.mp4 + cover.jpg
// Video is validated with ffprobe (h264/aac, aspect, duration, size) BEFORE
// anything is copied; an over-limit video is an error, not a warning.
//
//   node marketing/scripts/prepare.mjs marketing/instagram/<slug>
//   node marketing/scripts/prepare.mjs --clean <slug>   # after posting
//
// Staged video is ~10-15 MB per reel and web/public ships in every deploy:
// stage one week's post, deploy, publish, then --clean and do not commit it.
import { readdir, copyFile, rm, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  REPO, SITE, toJpeg, checkRatio, readPackage, detectKind, validateVideo,
  validatePackage, probeVideo, assertSlug,
} from "./lib.mjs";

const args = process.argv.slice(2);

if (args[0] === "--clean") {
  if (!args[1]) {
    console.error("usage: prepare.mjs --clean <slug>");
    process.exit(2);
  }
  const target = join(REPO, "web/public/social", assertSlug(args[1]));
  await rm(target, { recursive: true, force: true });
  console.log(`removed ${target}`);
  process.exit(0);
}

if (!args[0]) {
  console.error("usage: prepare.mjs <package-dir> | --clean <slug>");
  process.exit(2);
}
const dir = resolve(args[0]);

const { slug, caption } = await readPackage(dir);
const { kind, media } = detectKind(await readdir(dir));
const outDir = join(REPO, "web/public/social", assertSlug(slug));
const urls = [];
const url = (name) => `${SITE}/social/${slug}/${name}`;

const problems = validatePackage(kind, media.length, caption);

if (kind === "images") {
  if (problems.length) throw new Error(problems.join("\n"));
  for (const name of media) {
    const out = name.replace(/\.png$/, ".jpg");
    const { bytes, width, height } = await toJpeg(join(dir, name), join(outDir, out));
    const ratio = checkRatio(width, height);
    if (bytes > 8 * 1024 * 1024) throw new Error(`${name}: ${bytes} bytes exceeds Instagram's 8MB`);
    urls.push(url(out));
    console.log(`  ${name} -> ${width}x${height} ratio ${ratio.toFixed(3)} ${(bytes / 1024).toFixed(0)}KB`);
  }
} else {
  const role = kind === "reel" ? "reel" : "carousel-item";
  // Validate everything first so a bad slide 6 does not leave 1-5 staged.
  for (const name of media) {
    const probe = await probeVideo(join(dir, name));
    for (const p of validateVideo(probe, role)) problems.push(`${name}: ${p}`);
    console.log(
      `  ${name}: ${probe.videoCodec}/${probe.audioCodec ?? "no audio"} ${probe.width}x${probe.height} ` +
        `${probe.duration.toFixed(1)}s ${(probe.bytes / 1048576).toFixed(1)}MB`,
    );
  }
  if (problems.length) {
    throw new Error(`${slug} fails Instagram's limits, nothing staged:\n  - ${problems.join("\n  - ")}`);
  }
  await mkdir(outDir, { recursive: true });
  for (const name of media) {
    await copyFile(join(dir, name), join(outDir, name));
    urls.push(url(name));
  }
  // The cover is a JPEG like every image Instagram fetches. Only a reel takes
  // cover_url; a carousel's video items cannot, so its cover is staged for
  // reference and publish.mjs does not send it.
  const { width, height } = await toJpeg(join(dir, "cover.png"), join(outDir, "cover.jpg"));
  urls.push(url("cover.jpg"));
  console.log(`  cover.png -> cover.jpg ${width}x${height}`);
}

console.log(`\n${kind}: ${media.length} file(s) staged in web/public/social/${slug}/`);
console.log(`caption: ${caption.length} chars (Instagram allows 2200)`);
console.log("\nURLs (live only after the site is deployed):");
for (const u of urls) console.log("  " + u);
console.log(`\nAfter posting: node marketing/scripts/prepare.mjs --clean ${slug}`);
