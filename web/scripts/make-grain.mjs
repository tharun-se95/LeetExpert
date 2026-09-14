// Generates public/textures/grain.png — the landing page's paper grain.
//
//   node scripts/make-grain.mjs [out] [size] [levels] [seed]
//
// The PNG is opaque greyscale noise; its strength is applied in CSS
// (--grain-opacity) so light and dark can be tuned without regenerating it.
// Pixel generation is a pure, seeded function separate from PNG encoding:
// tests/paperGrain.test.ts compares the committed file's decoded pixels to
// grainPixels(), because the compressed bytes depend on the zlib build Node
// bundles and could change on a Node upgrade with no visible difference.
// Spec: docs/superpowers/specs/2026-09-14-landing-header-and-grain-design.md
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";

/** The arguments the committed grain.png was generated with. */
export const GRAIN = { size: 400, levels: 8, seed: 20260914 };

/**
 * size×size grey values, one byte per pixel, row-major.
 * @param {number} size
 * @param {number} levels
 * @param {number} seed
 * @returns {Uint8Array}
 */
export function grainPixels(size, levels, seed) {
  let state = seed >>> 0;
  // mulberry32: tiny, seedable, and identical across JS engines.
  const rand = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = new Uint8Array(size * size);
  for (let i = 0; i < out.length; i++) {
    // Quantised levels compress far better than 256 and read identically at
    // single-digit opacity.
    const q = Math.floor(rand() * levels);
    out[i] = Math.round((q / (levels - 1)) * 255);
  }
  return out;
}

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

/** @param {Uint8Array} buf */
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** @param {string} type @param {Buffer} data */
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/**
 * An 8-bit greyscale PNG of `pixels`, every row using filter type 0 (None).
 * @param {Uint8Array} pixels
 * @param {number} size
 * @returns {Buffer}
 */
export function encodeGreyPng(pixels, size) {
  const raw = Buffer.alloc((size + 1) * size);
  for (let y = 0; y < size; y++) {
    const row = y * (size + 1);
    raw[row] = 0;
    raw.set(pixels.subarray(y * size, (y + 1) * size), row + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 0; // colour type: greyscale
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Run only as a CLI, never when a test imports the pure functions above.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , out = "public/textures/grain.png", size, levels, seed] = process.argv;
  const s = Number(size ?? GRAIN.size);
  const png = encodeGreyPng(
    grainPixels(s, Number(levels ?? GRAIN.levels), Number(seed ?? GRAIN.seed)),
    s,
  );
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, png);
  console.log(`${out}: ${s}x${s}, ${png.length} bytes`);
}
