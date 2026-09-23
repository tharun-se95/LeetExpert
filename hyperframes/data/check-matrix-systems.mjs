// Cross-check: the Python traces (rows-matrix-systems.json) must equal the
// artifact's JavaScript implementation, frame for frame. Two languages
// disagree on rounding and iteration details; agreement is the evidence.
import { builders } from "./matrix-systems-artifact.mjs";
import { readFileSync } from "node:fs";
const rows = JSON.parse(readFileSync(new URL("./rows-matrix-systems.json", import.meta.url)));
const byOut = { "matrix-framebuffer":"framebuffer","matrix-photo-filters":"filter","matrix-alert-storms":"alerts","matrix-camera-rotation":"rotate","matrix-cnc-toolpaths":"spiral","matrix-data-masking":"mask","matrix-sorted-pages":"pages","matrix-chip-routing":"route" };
const fault = process.env.FAULT; // e.g. FAULT=matrix-data-masking proves the check can fail
let bad = 0;
const strip = (s) => (s || "").replace(" Press play.", "");
for (const row of rows) {
  const js = builders[byOut[row._out]]();
  const py = { frames: JSON.parse(row.frames), boards: JSON.parse(row.boards) };
  if (fault === row._out) py.frames[py.frames.length - 1].b[Object.keys(py.frames[0].b)[0]][0][1] = "X";
  const errs = [];
  if (js.frames.length !== py.frames.length) errs.push(`frame count js=${js.frames.length} py=${py.frames.length}`);
  const n = Math.min(js.frames.length, py.frames.length);
  for (let k = 0; k < n && errs.length < 5; k++) {
    const a = js.frames[k], b = py.frames[k];
    if (strip(a.note) !== strip(b.note)) errs.push(`frame ${k} note\n   js: ${a.note}\n   py: ${b.note}`);
    if (JSON.stringify(a.stats) !== JSON.stringify(b.stats)) errs.push(`frame ${k} stats ${JSON.stringify(a.stats)} vs ${JSON.stringify(b.stats)}`);
    if ((a.ev || null) !== (b.ev || null)) errs.push(`frame ${k} ev ${a.ev} vs ${b.ev}`);
    for (const id of Object.keys(a.b)) {
      const A = a.b[id], B = b.b[id];
      if (!B || A.length !== B.length) { errs.push(`frame ${k} board ${id} size`); continue; }
      for (let i = 0; i < A.length; i++) {
        const sa = A[i].s == null ? null : A[i].s, sb = B[i][2];
        if (A[i].k !== B[i][0] || (A[i].t || "") !== B[i][1] || (sa === null) !== (sb === null) || (sa !== null && Math.abs(sa - sb) > 1e-9))
          errs.push(`frame ${k} board ${id} cell ${i}: js ${JSON.stringify(A[i])} py ${JSON.stringify(B[i])}`);
      }
    }
    const oa = JSON.stringify(a.ov || null), ob = JSON.stringify(b.ov || null);
    if (oa !== ob) errs.push(`frame ${k} overlay ${oa} vs ${ob}`);
  }
  console.log(`${errs.length ? "FAIL" : "ok  "} ${row._out.padEnd(24)} ${js.frames.length} frames`);
  errs.forEach((e) => console.log("   ", e));
  bad += errs.length;
}
process.exit(bad ? 1 : 0);
