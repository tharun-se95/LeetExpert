// Writes matrix-systems-vignettes.json from the artifact's SVG generators.
import { VG } from "./matrix-systems-artifact.mjs";
import { writeFileSync } from "node:fs";
const out = {};
for (const [k, f] of Object.entries(VG)) out[k] = f();
writeFileSync(new URL("./matrix-systems-vignettes.json", import.meta.url), JSON.stringify(out, null, 2));
console.log("vignettes:", Object.keys(out).join(", "));
