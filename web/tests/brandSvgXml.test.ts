// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Browsers load an SVG favicon as strict XML, and so does the rasterizer
 * behind scripts/generate-icons.mjs, so a malformed brand SVG fails to render
 * instead of degrading. icon.svg shipped malformed for exactly this reason:
 * "--" is not allowed inside an XML comment, and its comment named CSS custom
 * properties.
 *
 * Runs in the jsdom environment for its strict XML DOMParser: the jsdom
 * package ships no type declarations, and the environment's global DOMParser
 * needs none.
 */

const SRC = join(__dirname, "..", "src");
const BRAND = join(SRC, "assets", "brand");
const files = [
  ...readdirSync(BRAND)
    .filter((name) => name.endsWith(".svg"))
    .map((name) => join(BRAND, name)),
  join(SRC, "app", "icon.svg"),
];

describe("brand SVGs are well-formed XML", () => {
  it.each(files.map((path) => [relative(SRC, path), path]))("%s parses as SVG", (_rel, path) => {
    const doc = new DOMParser().parseFromString(readFileSync(path, "utf8"), "image/svg+xml");
    const error = doc.getElementsByTagName("parsererror")[0];
    expect(error?.textContent?.trim() ?? null).toBeNull();
  });
});
