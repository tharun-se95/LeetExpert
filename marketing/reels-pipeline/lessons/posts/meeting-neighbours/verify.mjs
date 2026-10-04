// The same facts from the JavaScript twin; lessons.py fails unless both print the same JSON.
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const source = readFileSync(new URL("./code/meetings.js", import.meta.url), "utf8");
const load = (text) => { const module = { exports: {} }; new Function("module", text)(module); return module.exports; };
const { canAttendBrute, canAttendMeetings } = load(source);
const strict = "intervals[i][0] < intervals[i - 1][1]";
assert.equal(source.split(strict).length, 2);
const loose = load(source.replace(strict, strict.replace("<", "<="))).canAttendMeetings;

const copy = (ms) => ms.map((m) => [...m]);
for (const [meetings, want] of [[[[0, 30], [5, 10], [15, 20]], false], [[[7, 10], [2, 4]], true], [[[1, 5], [5, 8]], true]]) {
  assert.equal(canAttendBrute(copy(meetings)), want);
  assert.equal(canAttendMeetings(copy(meetings)), want);
}
assert.equal(loose([[1, 5], [5, 8]]), false);

// a [start, end] that counts reads of its end
let ends = 0;
const meeting = (m) => new Proxy([...m], { get(t, p) { if (p === "1") ends++; return t[p]; } });
const endsRead = (fn, meetings) => { ends = 0; return [fn(meetings.map(meeting)), ends]; };

const N = 1000;
const day = Array.from({ length: N }, (_, i) => [10 * ((i * 37) % N), 10 * ((i * 37) % N) + 7]);
const [a, bruteEnds] = endsRead(canAttendBrute, day);
const [b, fastEnds] = endsRead(canAttendMeetings, day);
assert.equal(a, true);
assert.equal(b, true);
const clash = [...day, [5005, 5012]];
assert.equal(canAttendBrute(copy(clash)), false);
assert.equal(canAttendMeetings(copy(clash)), false);

console.log(JSON.stringify({ n: N, pairs: bruteEnds / 2, neighbours: fastEnds }));
