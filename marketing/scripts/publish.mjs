#!/usr/bin/env node
// Publish a staged post package to Instagram via the Graph API. Handles image
// posts, image carousels, reels and video carousels; the kind is read from the
// files prepare.mjs staged.
//
//   node marketing/scripts/publish.mjs marketing/instagram/<slug> --account leetexpert --dry-run
//   node marketing/scripts/publish.mjs marketing/instagram/<slug> --account leetexpert --publish
//   ... [--poll-timeout <seconds>]   # default 60 s images, 600 s video
//
// --account (leetexpert | 10xtharun, see ACCOUNTS in lib.mjs) is required on
// every run: there is no default account to post to by accident.
//
// Run prepare.mjs first and DEPLOY the site: Instagram fetches each file from
// its public URL, so an undeployed file fails container creation with a
// media-download error. --dry-run makes NO Graph API call and needs no
// credentials: it HEAD-checks every public URL and re-probes the staged video
// against Instagram's limits, then stops. After a real post, remove the staged
// files with `prepare.mjs --clean <slug>`.
import { readdir, readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import {
  REPO, SITE, ACCOUNTS, parseAccount, parseEnv, resolveAccount, readPackage, detectKind, validateVideo, validatePackage, probeVideo,
  imageParams, imageChildParams, reelParams, videoChildParams, carouselParams, pollPlan,
} from "./lib.mjs";

const GRAPH = "https://graph.facebook.com/v21.0";

const argv = process.argv.slice(2);
const dir = resolve(argv[0] ?? "");
const publish = argv.includes("--publish");
const dryRun = argv.includes("--dry-run");
const pollIdx = argv.indexOf("--poll-timeout");
const pollOverride = pollIdx === -1 ? undefined : argv[pollIdx + 1];
const usage = `usage: publish.mjs <package-dir> --account (${Object.keys(ACCOUNTS).join(" | ")}) (--dry-run | --publish) [--poll-timeout <seconds>]`;
if (!argv[0] || argv[0].startsWith("--") || (!publish && !dryRun)) {
  console.error(usage);
  process.exit(2);
}
let account;
try {
  account = parseAccount(argv);
} catch (e) {
  console.error(`${e.message}\n${usage}`);
  process.exit(2);
}
const { handle } = ACCOUNTS[account];

// Credentials live outside the repo's tracked files; never log their values.
// Read only for --publish so a dry run cannot reach for the token at all.
let IG;
let TOKEN;
if (publish) {
  const env = parseEnv(await readFile(join(REPO, "marketing/.env.local"), "utf8"));
  ({ id: IG, token: TOKEN } = resolveAccount(env, account));
}

async function graph(path, params, method = "POST") {
  const body = new URLSearchParams({ ...params, access_token: TOKEN });
  const url = method === "GET" ? `${GRAPH}/${path}?${body}` : `${GRAPH}/${path}`;
  const res = await fetch(url, method === "GET" ? {} : { method, body });
  const json = await res.json();
  if (json.error) {
    // Surface Meta's own wording: the message names the real cause (a bad
    // media URL, an expired token) far better than the HTTP status does.
    throw new Error(`${path}: ${json.error.message} (code ${json.error.code})`);
  }
  return json;
}

// Meta downloads and transcodes asynchronously; publishing an unfinished
// container fails, so wait for FINISHED rather than sleeping a fixed time.
async function waitFinished(id, { timeoutMs, intervalMs }) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const { status_code, status } = await graph(id, { fields: "status_code,status" }, "GET");
    if (status_code === "FINISHED") return;
    if (status_code === "ERROR" || status_code === "EXPIRED") {
      throw new Error(`container ${id} ${status_code}: ${status ?? "unknown"}`);
    }
    if (Date.now() + intervalMs > deadline) {
      throw new Error(`container ${id} still ${status_code} after ${timeoutMs / 1000}s (raise --poll-timeout)`);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

const { slug, caption } = await readPackage(dir);
const stagedDir = join(REPO, "web/public/social", slug);
let staged;
try {
  staged = await readdir(stagedDir);
} catch {
  throw new Error(`nothing staged for ${slug} — run prepare.mjs first`);
}
const { kind, media } = detectKind(staged, "jpg");
const isVideo = kind !== "images";
const urls = media.map((f) => `${SITE}/social/${slug}/${f}`);
const coverUrl = staged.includes("cover.jpg") ? `${SITE}/social/${slug}/cover.jpg` : undefined;
if (kind === "reel" && !coverUrl) throw new Error(`no staged cover.jpg for ${slug} — run prepare.mjs first`);

const problems = validatePackage(kind, media.length, caption);
if (isVideo) {
  // The staged copy is what Instagram will fetch, so it is what gets checked.
  for (const f of media) {
    const probe = await probeVideo(join(stagedDir, f));
    for (const p of validateVideo(probe, kind === "reel" ? "reel" : "carousel-item")) problems.push(`${f}: ${p}`);
  }
}
if (problems.length) throw new Error(`${slug} fails Instagram's limits:\n  - ${problems.join("\n  - ")}`);

// Prove every file is publicly fetchable before asking Meta to fetch it.
const checks = [...urls.map((u) => [u, isVideo ? "video/mp4" : "image/"])];
if (kind === "reel") checks.push([coverUrl, "image/"]);
console.log(`target: @${handle}\nchecking ${checks.length} ${kind} URL(s)...`);
for (const [u, want] of checks) {
  const r = await fetch(u, { method: "HEAD" });
  const type = r.headers.get("content-type") ?? "";
  if (!r.ok || !type.startsWith(want)) {
    throw new Error(`${u} -> ${r.status} ${type}\n  Deploy the site so this file is live, then re-run.`);
  }
  console.log(`  200 ${type}  ${u}`);
}

if (dryRun) {
  console.log(`\nDry run OK for @${handle}. ${kind}, ${urls.length} file(s) reachable and within limits, caption ${caption.length} chars.`);
  console.log("Nothing was posted. Re-run with --publish to post.");
  process.exit(0);
}

// An id copied into the wrong key would post to the other account. Ask Meta
// whose id it is before creating anything, so that mistake stops here.
const { username } = await graph(IG, { fields: "username" }, "GET");
if (username !== handle) {
  throw new Error(`--account ${account} expects @${handle}, but its id belongs to @${username}. Nothing was posted.`);
}
console.log(`account: @${username}`);

const plan = pollPlan(kind, pollOverride);
const container = (params) => graph(`${IG}/media`, params);

let containerId;
if (kind === "reel") {
  containerId = (await container(reelParams({ videoUrl: urls[0], coverUrl, caption }))).id;
} else if (kind === "images" && urls.length === 1) {
  containerId = (await container(imageParams(urls[0], caption))).id;
} else {
  const children = [];
  for (const [i, u] of urls.entries()) {
    const { id } = await container(isVideo ? videoChildParams(u) : imageChildParams(u));
    console.log(`  item ${i + 1}/${urls.length} container ${id}`);
    // A video child must finish transcoding before it can join the parent.
    if (isVideo) await waitFinished(id, plan);
    children.push(id);
  }
  containerId = (await container(carouselParams(children, caption))).id;
}
console.log(`container ${containerId}`);
await waitFinished(containerId, plan);

const { id } = await graph(`${IG}/media_publish`, { creation_id: containerId });
const { permalink } = await graph(id, { fields: "permalink" }, "GET");
console.log(`\nPublished: ${permalink}`);
console.log(`Update marketing/LEDGER.md: set ${slug}'s row for @${handle} to posted, then run prepare.mjs --clean ${slug}.`);
