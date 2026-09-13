#!/usr/bin/env node
// Builds every favicon / PWA / apple-touch-icon file from the brand lamp
// sources in src/assets/brand/. Re-run whenever any mark*.svg changes —
// nothing downstream should be hand-edited, and tests/brandLamp.test.tsx
// fails if the outputs are stale.
//
// sharp is not a direct dependency of this project; it rides in transitively
// as Next's own image-optimization engine (next -> sharp). That's fine for a
// one-off/rerunnable build script like this one — we're not shipping it in
// the runtime bundle — but if `npm ls sharp` ever comes back empty, install
// it as a devDependency before rerunning.
import { copyFile, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const brandDir = join(root, "src/assets/brand");
const publicDir = join(root, "public");
const appDir = join(root, "src/app");

async function svgBuffer(name) {
  return readFile(join(brandDir, name));
}

async function toPng(svg, size) {
  return sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();
}

// Minimal ICO container holding PNG-compressed frames. Every current
// browser (and Windows since Vista) accepts PNG-in-ICO at any listed size,
// which avoids reimplementing BMP/DIB encoding for the legacy path.
function packIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  const imageData = [];
  let offset = 6 + count * 16;

  for (const { size, buf } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height (0 = 256)
    entry.writeUInt8(0, 2); // color count (0 = truecolor)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buf.length, 8); // byte size of the PNG blob
    entry.writeUInt32LE(offset, 12); // offset from file start
    dirEntries.push(entry);
    imageData.push(buf);
    offset += buf.length;
  }

  return Buffer.concat([header, ...dirEntries, ...imageData]);
}

async function main() {
  const rasterSvg = await svgBuffer("mark-raster.svg");
  const tileSvg = await svgBuffer("mark-tile.svg");
  const tileRoundedSvg = await svgBuffer("mark-tile-rounded.svg");

  await mkdir(publicDir, { recursive: true });

  // icon.svg is served as-is (it follows the OS theme itself), so it is a
  // copy rather than a render. Next's convention needs it under src/app/.
  await copyFile(join(brandDir, "mark.svg"), join(appDir, "icon.svg"));

  // Browser favicons for anything that doesn't take the SVG: one fixed
  // image on an unknown tab colour, hence the rimmed variant.
  const favicon16 = await toPng(rasterSvg, 16);
  const favicon32 = await toPng(rasterSvg, 32);
  const favicon48 = await toPng(rasterSvg, 48);
  await writeFile(join(publicDir, "favicon-16x16.png"), favicon16);
  await writeFile(join(publicDir, "favicon-32x32.png"), favicon32);

  // Legacy .ico fallback (old browsers / crawlers that GET /favicon.ico
  // directly, no <link> needed). Next's src/app/favicon.ico convention
  // auto-serves this at the site root.
  const ico = packIco([
    { size: 16, buf: favicon16 },
    { size: 32, buf: favicon32 },
    { size: 48, buf: favicon48 },
  ]);
  await writeFile(join(appDir, "favicon.ico"), ico);

  // Apple touch icon (iOS home screen) — opaque full-bleed dark tile; iOS
  // masks it into a squircle itself.
  await writeFile(join(appDir, "apple-icon.png"), await toPng(tileSvg, 180));

  // Android / PWA manifest icons — the same dark tile with rounded corners.
  await writeFile(
    join(publicDir, "android-chrome-192x192.png"),
    await toPng(tileRoundedSvg, 192),
  );
  await writeFile(
    join(publicDir, "android-chrome-512x512.png"),
    await toPng(tileRoundedSvg, 512),
  );

  console.log("Copied    src/app/icon.svg");
  console.log("Generated favicon-16x16.png, favicon-32x32.png,");
  console.log("       src/app/favicon.ico, src/app/apple-icon.png,");
  console.log("       android-chrome-192x192.png, android-chrome-512x512.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
