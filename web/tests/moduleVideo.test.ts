import { existsSync, openSync, readSync, closeSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { MODULES } from "../src/lib/course/manifest";
import { getModuleVideo } from "../src/lib/course/media";

/**
 * Module intro videos are addressed by folder name: the module page looks for
 * `public/media/<slug>/intro.mp4`. A folder named for a slug that does not
 * exist (a typo, or a renamed module) would silently never render — this file
 * turns that into a red CI run.
 *
 * It also asserts every intro is faststart (the `moov` index before `mdat`).
 * Without it a browser must download the whole file before playback can begin,
 * which reads as a broken player on a slow connection.
 */
const MEDIA_DIR = join(process.cwd(), "public", "media");
const SLUGS = new Set(MODULES.map((m) => m.slug));

function introFolders(): string[] {
  return readdirSync(MEDIA_DIR).filter(
    (d) =>
      statSync(join(MEDIA_DIR, d)).isDirectory() &&
      existsSync(join(MEDIA_DIR, d, "intro.mp4")),
  );
}

/** Top-level MP4 atom types in file order. */
function topLevelAtoms(path: string): string[] {
  const fd = openSync(path, "r");
  const size = statSync(path).size;
  const header = Buffer.alloc(16);
  const atoms: string[] = [];
  let pos = 0;
  try {
    while (pos + 8 <= size) {
      readSync(fd, header, 0, 16, pos);
      let atomSize = header.readUInt32BE(0);
      const type = header.toString("latin1", 4, 8);
      if (atomSize === 1) atomSize = Number(header.readBigUInt64BE(8));
      atoms.push(type);
      if (atomSize < 8) break;
      pos += atomSize;
    }
  } finally {
    closeSync(fd);
  }
  return atoms;
}

describe("module intro videos", () => {
  it("only live in folders named for a real module", () => {
    const orphans = introFolders().filter((d) => !SLUGS.has(d));
    expect(orphans).toEqual([]);
  });

  it.each(introFolders())("%s intro is faststart (moov before mdat)", (slug) => {
    const atoms = topLevelAtoms(join(MEDIA_DIR, slug, "intro.mp4"));
    expect(atoms).toContain("moov");
    expect(atoms).toContain("mdat");
    expect(atoms.indexOf("moov")).toBeLessThan(atoms.indexOf("mdat"));
  });

  it("resolves the arrays intro to a public path", () => {
    expect(getModuleVideo("arrays")).toBe("/media/arrays/intro.mp4");
  });

  it("returns undefined for a module with no intro", () => {
    expect(getModuleVideo("not-a-real-module")).toBeUndefined();
  });
});
