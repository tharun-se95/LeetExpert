#!/usr/bin/env node
// Publish a staged post package to Instagram via the Graph API.
//
//   node marketing/scripts/publish.mjs marketing/instagram/<slug> --dry-run
//   node marketing/scripts/publish.mjs marketing/instagram/<slug> --publish
//
// Run prepare.mjs first and DEPLOY the site: Instagram fetches each image
// from its public URL, so an undeployed slide fails container creation with
// a media-download error. --dry-run stops after proving the URLs are live.
import { readdir, readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { REPO, SITE, readPackage } from "./lib.mjs";

const GRAPH = "https://graph.facebook.com/v21.0";

const dir = resolve(process.argv[2] ?? "");
const publish = process.argv.includes("--publish");
const dryRun = process.argv.includes("--dry-run");
if (!process.argv[2] || (!publish && !dryRun)) {
  console.error("usage: publish.mjs <package-dir> (--dry-run | --publish)");
  process.exit(2);
}

// Credentials live outside the repo's tracked files; never log their values.
const env = Object.fromEntries(
  (await readFile(join(REPO, "marketing/.env.local"), "utf8"))
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const IG = env.INSTAGRAM_USER_ID;
const TOKEN = env.INSTAGRAM_ACCESS_TOKEN;
if (!IG || !TOKEN) throw new Error("marketing/.env.local is missing INSTAGRAM_USER_ID or INSTAGRAM_ACCESS_TOKEN");

async function graph(path, params, method = "POST") {
  const body = new URLSearchParams({ ...params, access_token: TOKEN });
  const url = method === "GET" ? `${GRAPH}/${path}?${body}` : `${GRAPH}/${path}`;
  const res = await fetch(url, method === "GET" ? {} : { method, body });
  const json = await res.json();
  if (json.error) {
    // Surface Meta's own wording: the message names the real cause (a bad
    // image URL, an expired token) far better than the HTTP status does.
    throw new Error(`${path}: ${json.error.message} (code ${json.error.code})`);
  }
  return json;
}

const { slug, caption } = await readPackage(dir);
const files = (await readdir(join(REPO, "web/public/social", slug))).filter((f) => f.endsWith(".jpg")).sort();
if (files.length === 0) throw new Error(`no staged JPEGs for ${slug} — run prepare.mjs first`);
const urls = files.map((f) => `${SITE}/social/${slug}/${f}`);

// Prove every image is publicly fetchable before asking Meta to fetch it.
console.log(`checking ${urls.length} image URL(s)...`);
for (const u of urls) {
  const r = await fetch(u, { method: "HEAD" });
  const type = r.headers.get("content-type") ?? "";
  if (!r.ok || !type.startsWith("image/")) {
    throw new Error(`${u} -> ${r.status} ${type}\n  Deploy the site so this file is live, then re-run.`);
  }
  console.log(`  200 ${type}  ${u}`);
}

if (dryRun) {
  console.log(`\nDry run OK. ${urls.length} slide(s) reachable, caption ${caption.length} chars.`);
  console.log("Nothing was posted. Re-run with --publish to post.");
  process.exit(0);
}

// A single image posts as one container; 2+ become a carousel.
let containerId;
if (urls.length === 1) {
  containerId = (await graph(`${IG}/media`, { image_url: urls[0], caption })).id;
} else {
  const children = [];
  for (const [i, image_url] of urls.entries()) {
    const { id } = await graph(`${IG}/media`, { image_url, is_carousel_item: "true" });
    console.log(`  slide ${i + 1}/${urls.length} container ${id}`);
    children.push(id);
  }
  containerId = (await graph(`${IG}/media`, {
    media_type: "CAROUSEL",
    children: children.join(","),
    caption,
  })).id;
}
console.log(`container ${containerId}`);

// Meta downloads and transcodes asynchronously; publishing an unfinished
// container fails, so wait for FINISHED rather than sleeping a fixed time.
for (let i = 0; i < 30; i++) {
  const { status_code, status } = await graph(containerId, { fields: "status_code,status" }, "GET");
  if (status_code === "FINISHED") break;
  if (status_code === "ERROR") throw new Error(`container failed: ${status ?? "unknown"}`);
  if (i === 29) throw new Error(`container still ${status_code} after 60s`);
  await new Promise((r) => setTimeout(r, 2000));
}

const { id } = await graph(`${IG}/media_publish`, { creation_id: containerId });
const { permalink } = await graph(id, { fields: "permalink" }, "GET");
console.log(`\nPublished: ${permalink}`);
console.log(`Update marketing/LEDGER.md: set ${slug} Status to posted.`);
