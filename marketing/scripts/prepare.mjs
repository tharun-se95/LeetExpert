#!/usr/bin/env node
// Stage a post package's slides as JPEGs under web/public/social/<slug>/ so
// the deployed site can serve them. Instagram fetches the image from a public
// URL, so the images have to ship with the site before publish.mjs runs.
//
//   node marketing/scripts/prepare.mjs marketing/instagram/<slug>
import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { REPO, SITE, toJpeg, checkRatio, readPackage } from "./lib.mjs";

const dir = resolve(process.argv[2] ?? "");
if (!process.argv[2]) {
  console.error("usage: prepare.mjs <package-dir>");
  process.exit(2);
}

const { slug, caption } = await readPackage(dir);
const slides = (await readdir(dir)).filter((f) => /^\d+\.png$/.test(f)).sort();
if (slides.length === 0) throw new Error(`no NN.png slides in ${dir}`);
if (slides.length > 10) throw new Error(`Instagram carousels hold 10 slides, found ${slides.length}`);

const outDir = join(REPO, "web/public/social", slug);
const urls = [];
for (const name of slides) {
  const dest = join(outDir, name.replace(/\.png$/, ".jpg"));
  const { bytes, width, height } = await toJpeg(join(dir, name), dest);
  const ratio = checkRatio(width, height);
  if (bytes > 8 * 1024 * 1024) throw new Error(`${name}: ${bytes} bytes exceeds Instagram's 8MB`);
  const url = `${SITE}/social/${slug}/${name.replace(/\.png$/, ".jpg")}`;
  urls.push(url);
  console.log(`  ${name} -> ${width}x${height} ratio ${ratio.toFixed(3)} ${(bytes / 1024).toFixed(0)}KB`);
}

console.log(`\n${slides.length} slide(s) staged in web/public/social/${slug}/`);
console.log(`caption: ${caption.length} chars (Instagram allows 2200)`);
if (caption.length > 2200) throw new Error("caption exceeds Instagram's 2200-character limit");
console.log("\nURLs (live only after the site is deployed):");
for (const u of urls) console.log("  " + u);
