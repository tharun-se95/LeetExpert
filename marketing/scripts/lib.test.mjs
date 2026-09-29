// Unit tests for the pure helpers in lib.mjs. The repo has no root
// package.json and no test-runner convention for marketing/, so these use the
// built-in runner (Node 22 reads a bare directory as a module, so use a glob):
//   node --test "marketing/scripts/*.test.mjs"
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  detectKind, validateVideo, validatePackage, reelParams, videoChildParams, imageParams,
  imageChildParams, carouselParams, pollPlan, assertSlug, parseProbe, REEL_MAX_SECONDS,
  POLL_IMAGE, POLL_VIDEO,
} from "./lib.mjs";

const goodReel = { videoCodec: "h264", audioCodec: "aac", width: 1080, height: 1920, duration: 45, bytes: 10e6 };

test("detectKind: images sort numerically", () => {
  const r = detectKind(["10.png", "2.png", "1.png", "post.md"]);
  assert.deepEqual(r, { kind: "images", media: ["1.png", "2.png", "10.png"] });
});

test("detectKind: staged images use jpg", () => {
  assert.equal(detectKind(["01.jpg", "cover.jpg"], "jpg").kind, "images");
});

test("detectKind: a reel ignores its cover", () => {
  assert.deepEqual(detectKind(["reel.mp4", "cover.png", "post.md"]), { kind: "reel", media: ["reel.mp4"] });
});

test("detectKind: video carousel orders slide10 after slide2 and ignores preview.mp4", () => {
  const r = detectKind(["slide10.mp4", "slide2.mp4", "slide1.mp4", "preview.mp4", "cover.png"]);
  assert.equal(r.kind, "video-carousel");
  assert.deepEqual(r.media, ["slide1.mp4", "slide2.mp4", "slide10.mp4"]);
});

test("detectKind: empty and mixed packages throw", () => {
  assert.throws(() => detectKind(["post.md"]), /no NN\.png/);
  assert.throws(() => detectKind(["reel.mp4", "1.png"]), /ambiguous/);
});

test("validateVideo: a good reel passes", () => {
  assert.deepEqual(validateVideo(goodReel, "reel"), []);
});

test("validateVideo: 136.5 s reel is over the API limit", () => {
  const p = validateVideo({ ...goodReel, duration: 136.52 }, "reel");
  assert.equal(p.length, 1);
  assert.match(p[0], new RegExp(`over the ${REEL_MAX_SECONDS}s API limit`));
});

test("validateVideo: duration boundaries are inclusive", () => {
  assert.deepEqual(validateVideo({ ...goodReel, duration: 3 }, "reel"), []);
  assert.deepEqual(validateVideo({ ...goodReel, duration: REEL_MAX_SECONDS }, "reel"), []);
  assert.equal(validateVideo({ ...goodReel, duration: 2.9 }, "reel").length, 1);
});

test("validateVideo: wrong codec, audio and aspect are each reported", () => {
  const p = validateVideo({ ...goodReel, videoCodec: "hevc", audioCodec: "opus", width: 1080, height: 1350 }, "reel");
  assert.equal(p.length, 3);
});

test("validateVideo: silent video is allowed, missing video stream is not", () => {
  assert.deepEqual(validateVideo({ ...goodReel, audioCodec: undefined }, "reel"), []);
  assert.ok(validateVideo({ ...goodReel, videoCodec: undefined }, "reel").length > 0);
});

test("validateVideo: carousel item takes 4:5 but not 9:16, and caps at 60 s", () => {
  const item = { ...goodReel, width: 1080, height: 1350, duration: 12 };
  assert.deepEqual(validateVideo(item, "carousel-item"), []);
  assert.equal(validateVideo({ ...item, width: 1080, height: 1920 }, "carousel-item").length, 1);
  assert.equal(validateVideo({ ...item, duration: 61 }, "carousel-item").length, 1);
});

test("validatePackage: item count and caption length", () => {
  assert.deepEqual(validatePackage("reel", 1, "x"), []);
  assert.equal(validatePackage("video-carousel", 11, "x").length, 1);
  assert.equal(validatePackage("reel", 1, "x".repeat(2201)).length, 1);
});

test("container params", () => {
  assert.deepEqual(reelParams({ videoUrl: "v", coverUrl: "c", caption: "t" }), {
    media_type: "REELS", video_url: "v", cover_url: "c", share_to_feed: "true", caption: "t",
  });
  assert.deepEqual(videoChildParams("v"), { media_type: "VIDEO", video_url: "v", is_carousel_item: "true" });
  assert.deepEqual(carouselParams(["1", "2"], "t"), { media_type: "CAROUSEL", children: "1,2", caption: "t" });
  assert.deepEqual(imageParams("i", "t"), { image_url: "i", caption: "t" });
  assert.deepEqual(imageChildParams("i"), { image_url: "i", is_carousel_item: "true" });
});

test("pollPlan: defaults, override and bad input", () => {
  assert.deepEqual(pollPlan("images"), POLL_IMAGE);
  assert.equal(pollPlan("reel").timeoutMs, 600_000);
  assert.deepEqual(pollPlan("video-carousel"), POLL_VIDEO);
  assert.equal(pollPlan("reel", "120").timeoutMs, 120_000);
  assert.throws(() => pollPlan("reel", "abc"), /positive number/);
  assert.throws(() => pollPlan("reel", "0"), /positive number/);
});

test("assertSlug refuses path-like names", () => {
  assert.equal(assertSlug("2026-09-28-list-vs-set"), "2026-09-28-list-vs-set");
  for (const bad of ["", "..", "../x", "a/b", "/abs", ".hidden", "a..b"]) {
    assert.throws(() => assertSlug(bad), /not a package slug/, bad);
  }
});

test("parseProbe flattens ffprobe json", () => {
  const p = parseProbe({
    streams: [{ codec_type: "video", codec_name: "h264", width: 1080, height: 1920 }, { codec_type: "audio", codec_name: "aac" }],
    format: { duration: "136.520000", size: "14713600" },
  });
  assert.deepEqual(p, { videoCodec: "h264", audioCodec: "aac", width: 1080, height: 1920, duration: 136.52, bytes: 14713600 });
});
