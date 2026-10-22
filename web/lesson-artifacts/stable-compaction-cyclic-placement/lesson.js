/* ================= Stable Compaction & Cyclic Placement =================
   Every walkthrough is recorded from a real array being changed, every invariant the panel shows is
   judged from the snapshot alone, and every number on the page is counted by instrumented code in the
   PURE block, which check.py re-runs in node and re-derives in Python. */

/* PURE:begin (no DOM below this line until PURE:end) */

function cpRange(n) {
  var a = [];
  for (var i = 1; i <= n; i++) a.push(i);
  return a;
}
function cpGcd(a, b) {
  while (b) { var t = a % b; a = b; b = t; }
  return a;
}
var cpNonZero = function (v) { return v !== 0; };
var cpOdd = function (v) { return v % 2 !== 0; };
var cpEven = function (v) { return v % 2 === 0; };
var cpAlways = function () { return true; };

/* keep_if with its work counted: copies made, and copies that landed on a slot read has not reached */
function cpKeepIf(arr, keep) {
  var a = arr.slice(), w = 0, writes = 0, unread = 0;
  for (var r = 0; r < a.length; r++) {
    if (keep(a[r])) {
      if (w > r) unread++;
      a[w] = a[r]; w++; writes++;
    }
  }
  return { a: a, w: w, writes: writes, unread: unread };
}

/* the correct delete-by-shifting version, counting every car it moves left */
function cpShiftRemove(arr, keep) {
  var a = arr.slice(), i = 0, moves = 0;
  while (i < a.length) {
    if (keep(a[i])) { i++; continue; }
    for (var j = i; j < a.length - 1; j++) { a[j] = a[j + 1]; moves++; }
    a.pop();
  }
  return { a: a, moves: moves };
}

/* the mistake: delete by value while an index walks the list (what for-in does in both languages) */
function cpRemoveWhileIterating(arr, keep) {
  var a = arr.slice(), it = 0, shifted = 0;
  while (it < a.length) {
    var x = a[it];
    if (!keep(x)) { var at = a.indexOf(x); shifted += a.length - at - 1; a.splice(at, 1); }
    it++;
  }
  return { a: a, shifted: shifted };
}

/* every seat's chain under i -> (i + k) mod n, followed by walking it: cycles and the length of each */
function cpCycles(n, k) {
  var seen = [], cycles = 0, len = 0, i;
  for (i = 0; i < n; i++) seen.push(false);
  for (var s = 0; s < n; s++) {
    if (seen[s]) continue;
    var c = 0, cur = s;
    do { seen[cur] = true; cur = (cur + k) % n; c++; } while (cur !== s);
    cycles++; len = c;
  }
  return { cycles: cycles, len: len };
}

/* rotate right by k, one cycle at a time, counting the parcels set down and the cycles walked */
function cpRotate(arr, k, oneCycle) {
  var a = arr.slice(), n = a.length, placements = 0, cycles = 0;
  if (n === 0) return { a: a, placements: 0, cycles: 0 };
  k = k % n;
  var moved = 0, start = 0;
  while (moved < n) {
    var cur = start, carry = a[start];
    cycles++;
    do {
      var nxt = (cur + k) % n, t = a[nxt];
      a[nxt] = carry; carry = t; cur = nxt; moved++; placements++;
    } while (cur !== start);
    start++;
    if (oneCycle) break;
  }
  return { a: a, placements: placements, cycles: cycles };
}

/* the safety argument, run: seeded random trains, every copy checked against the read position */
function cpSafety() {
  var seed = 20261020, trains = 500, copies = 0, unread = 0;
  function rnd() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }
  for (var t = 0; t < trains; t++) {
    var n = Math.floor(rnd() * 13), a = [];
    for (var i = 0; i < n; i++) a.push(Math.floor(rnd() * 4));
    var r = cpKeepIf(a, cpNonZero);
    copies += r.writes; unread += r.unread;
  }
  return { trains: trains, copies: copies, unread: unread };
}

/* ---------- recorded walkthroughs, built on the kit's lanes ---------- */
function cpRec(M, steps, note, o, meta) {
  var s = M.snap(note, o);
  s.meta = meta;
  steps.push(s);
  return s;
}
function cpVals(items) {
  return items.map(function (x) { return x ? +x.v : null; });
}

/* read/write compaction, one step per car */
function cpKeepSteps(arr, keep, what) {
  var n = arr.length, st = { r: 0, w: 0 }, read = [], steps = [];
  var M = new Lanes([{ id: 'a', kind: 'row', label: 'train', cap: n }], { fields: function () { return [['read', st.r], ['write', st.w]]; } });
  arr.forEach(function (v, j) { M.put('a', j, v); });
  var keepers = arr.filter(keep);
  function meta() { return { orig: arr, read: read.slice(), front: st.w, r: st.r, w: st.w, keepers: keepers }; }
  function marks() {
    M.mark('a', 'r', st.r < n ? st.r : null);
    M.mark('a', 'w', st.w < n ? st.w : null);
    M.span('a', 'kept', 0, st.w - 1);
  }
  marks();
  cpRec(M, steps, 'Walk the train from the engine. <code>read</code> looks at one car at a time; <code>write</code> marks where the next keeper will be coupled. ' + what + ' Nothing has been kept yet.',
    { hi: ['r', 'w', 'kept'], done: true }, meta());
  for (var r = 0; r < n; r++) {
    var v = arr[r], it = M.lane('a').items[r], ok = keep(v), from = st.w, note, hi;
    read.push({ v: v, keep: ok });
    if (ok) {
      var c = M.copy('a', r, 'a', from);
      if (r !== from) M.tone(it, 'dim');
      M.tone(c, 'good');
      st.w++;
      note = r === from
        ? 'Read slot ' + r + ': car ' + v + ' is a keeper, and <code>write</code> is on the same slot, so it is copied onto itself and stays put.'
        : 'Read slot ' + r + ': car ' + v + ' is a keeper. Copy it to slot ' + from + ', the end of the kept train, and move <code>write</code> on to slot ' + st.w + '.';
      hi = [laneHi(c), 'r', 'w', 'kept'];
    } else {
      M.tone(it, 'dim');
      note = 'Read slot ' + r + ': car ' + v + ' is not worth keeping. Skip it: <code>write</code> stays on slot ' + st.w + ', so the next keeper will be coupled over the gap.';
      hi = [laneHi(it), 'r'];
    }
    st.r = r + 1;
    marks();
    cpRec(M, steps, note, { hi: hi, done: true }, meta());
  }
  M.lane('a').items.forEach(function (it, j) { if (j >= st.w) M.tone(it, 'dim'); });
  cpRec(M, steps, st.w === 0
    ? '<code>read</code> has passed every car and none was kept, so <code>write</code> is 0: the kept train is empty. Every slot still holds an old value.'
    : '<code>read</code> has passed every car, so the cars in slots 0 to ' + (st.w - 1) + ' are exactly the keepers, in their original order, and <code>write</code>, ' + st.w + ', is the new length.' +
      (st.w < n ? ' Slots ' + st.w + ' to ' + (n - 1) + ' still hold old values: leftover history the invariant says nothing about.' : ' Every car was kept, so nothing is left over.'),
    { hi: ['kept', 'write'], done: true }, meta());
  var want = keepers;
  if (cpVals(M.lane('a').items).slice(0, st.w).join() !== want.join()) throw new Error('compaction walkthrough disagrees with filtering');
  return steps;
}

/* the mistake: delete by value while the iterator walks */
function cpRemoveSteps(arr, keep) {
  var st = { reads: 0, shifted: 0, it: 0 }, read = [], steps = [], keepers = arr.filter(keep);
  var M = new Lanes([{ id: 'a', kind: 'row', label: 'train', idx: true }], { fields: function () { return [['reads', st.reads], ['cars shifted', st.shifted]]; } });
  arr.forEach(function (v) { M.push('a', v); });
  function meta() { return { orig: arr, read: read.slice(), front: st.it, keepers: keepers }; }
  function marks() {
    var items = M.lane('a').items;
    M.mark('a', 'it', st.it < items.length ? st.it : null);
    items.forEach(function (x, j) { M.tone(x, j < st.it && !keep(+x.v) ? 'bad' : null); });
  }
  marks();
  cpRec(M, steps, 'Delete the cars to drop as the iterator meets them. <code>it</code> is the iterator\'s slot, and it only ever moves one slot to the right.', { hi: ['it'], done: true }, meta());
  while (st.it < M.lane('a').items.length) {
    var items = M.lane('a').items, x = items[st.it], v = +x.v, note, hi = ['it'];
    st.reads++;
    if (keep(v)) {
      read.push({ v: v, keep: true });
      note = 'The iterator reads slot ' + st.it + ': car ' + v + ' stays. It moves on to slot ' + (st.it + 1) + '.';
      hi.push(laneHi(x));
      st.it++;
    } else {
      var vals = cpVals(items), at = vals.indexOf(v);
      read.push({ v: v, keep: false });
      st.shifted += vals.length - at - 1;
      M.remove('a', at);
      st.it++;
      var nextCar = M.lane('a').items[st.it - 1];
      note = 'The iterator reads slot ' + (st.it - 1) + ': car ' + v + ' is to drop, so delete it. Every later car slides one slot left' +
        (nextCar && !keep(+nextCar.v) ? ', and car ' + nextCar.v + ', which is also to drop, lands in slot ' + (st.it - 1) + '. The iterator moves on to slot ' + st.it + ' and never reads it.'
          : '. The iterator moves on to slot ' + st.it + '.');
      if (nextCar) hi.push(laneHi(nextCar));
    }
    marks();
    cpRec(M, steps, note, { hi: hi, done: true }, meta());
  }
  var res = cpVals(M.lane('a').items), want = cpRemoveWhileIterating(arr, keep).a;
  if (res.join() !== want.join()) throw new Error('delete-while-iterating walkthrough disagrees with its model');
  cpRec(M, steps, 'The iterator ran off the end. ' + (res.some(function (q) { return !keep(q); }) ? 'The train still holds ' + res.filter(function (q) { return !keep(q); }).length + ' car' + (res.filter(function (q) { return !keep(q); }).length === 1 ? '' : 's') + ' that should have been dropped, and the loop raised no error.' : 'No car was skipped this time.'),
    { hi: ['it'], done: true }, meta());
  return steps;
}

/* the cyclic walk: one parcel carried along each chain. oneCycle is the mistake. */
function cpCycSteps(n, k, oneCycle) {
  var keys = [], i;
  for (i = 0; i < n; i++) keys.push(String(i));
  keys.push('hand');
  var orig = cpRange(n), placed = [], cyc = 0, steps = [];
  var M = new Lanes([{ id: 'a', kind: 'row', label: 'seats', cap: n + 1, keys: keys }],
    { fields: function () { return [['parcels home', placed.length + ' of ' + n], ['in hand', M.lane('a').items[n] ? M.lane('a').items[n].v : 'nothing']]; } });
  orig.forEach(function (v, j) { M.put('a', j, v); });
  var home = function (j) { return orig[((j - k) % n + n) % n]; };
  function meta(final) { return { orig: orig, n: n, k: k, placed: placed.slice(), final: !!final }; }
  cpRec(M, steps, n + ' seats, one parcel each. The parcel in seat <i>i</i> belongs in seat (<i>i</i> + ' + k + ') mod ' + n + '. You carry one parcel at a time, in the slot marked <code>hand</code>.', { hi: ['parcels home'], done: true }, meta());
  var moved = 0, start = 0;
  while (moved < n) {
    var cur = start;
    M.swap('a', n, start);
    M.mark('a', 'start', start);
    cpRec(M, steps, 'A new chain begins at seat ' + start + '. Pick up its parcel, ' + orig[start] + '. Seat ' + start + ' is empty until the chain closes.', { hi: [laneHi(M.lane('a').items[n]), 'in hand'], done: true }, meta());
    do {
      var nxt = (cur + k) % n, carried = +M.lane('a').items[n].v;
      M.swap('a', n, nxt);
      placed.push(nxt); moved++;
      M.tone(M.lane('a').items[nxt], 'good');
      var held = M.lane('a').items[n];
      cpRec(M, steps, 'Parcel ' + carried + ' belongs in seat (' + cur + ' + ' + k + ') mod ' + n + ' = ' + nxt + '. Set it down there' +
        (held ? ' and pick up the parcel that was sitting there, ' + held.v + '.' : '. That was the seat the chain started from, so the hand is empty and the chain has closed.'),
        { hi: [laneHi(M.lane('a').items[nxt]), 'parcels home'], done: true }, meta());
      cur = nxt;
    } while (cur !== start);
    cyc++;
    M.mark('a', 'start', null);
    if (oneCycle) break;
    start++;
  }
  var items = M.lane('a').items;
  if (oneCycle) items.forEach(function (it, j) { if (j < n && +it.v !== home(j)) M.tone(it, 'bad'); });
  cpRec(M, steps, oneCycle
    ? 'The first chain closed, so the loop stops. Only ' + placed.length + ' of ' + n + ' parcels are home; the others never moved.'
    : 'Every chain has closed: ' + cyc + ' chain' + (cyc === 1 ? '' : 's') + ' in all, and all ' + n + ' parcels are home. The train is rotated by ' + k + '.',
    { hi: ['parcels home'], done: true }, meta(true));
  var got = cpVals(items).slice(0, n), r = cpRotate(orig, k, !!oneCycle).a;
  if (got.join() !== r.join()) throw new Error('cyclic walkthrough disagrees with cpRotate');
  if (!oneCycle && got.join() !== orig.slice(n - k).concat(orig.slice(0, n - k)).join()) throw new Error('cyclic walkthrough is not a rotation by ' + k);
  return steps;
}

/* the claims the panels check, written from a snapshot alone */
function cpPrefixHolds(s) {
  var m = s.meta, want = m.read.filter(function (x) { return x.keep; }).map(function (x) { return x.v; });
  var got = s.lanes[0].items.slice(0, m.front).map(function (x) { return +x.v; });
  return got.length === want.length && got.every(function (v, i) { return v === want[i]; });
}
function cpWriteLeRead(s) { return s.meta.w <= s.meta.r; }
function cpUnreadSafe(s) {
  var m = s.meta, a = s.lanes[0].items.map(function (x) { return +x.v; });
  for (var j = m.r; j < a.length; j++) if (a[j] !== m.orig[j]) return false;
  return true;
}
function cpKeepersKept(s) {
  var have = {}, ok = true;
  s.lanes[0].items.forEach(function (x) { have[+x.v] = (have[+x.v] || 0) + 1; });
  var need = {};
  s.meta.keepers.forEach(function (v) { need[v] = (need[v] || 0) + 1; });
  Object.keys(need).forEach(function (v) { if ((have[v] || 0) < need[v]) ok = false; });
  return ok;
}
function cpNoParcelLost(s) {
  var a = s.lanes[0].items.filter(function (x) { return x; }).map(function (x) { return +x.v; }).sort(function (p, q) { return p - q; });
  return a.join() === s.meta.orig.slice().sort(function (p, q) { return p - q; }).join();
}
function cpPlacedHome(s) {
  var m = s.meta, items = s.lanes[0].items;
  return m.placed.every(function (j) { return +items[j].v === m.orig[((j - m.k) % m.n + m.n) % m.n]; });
}
var CP_INV_RW = [
  ['prefix holds', 'the front of the train holds exactly the keepers read so far, in their original order', cpPrefixHolds],
  ['write ≤ read', 'the coupling point never passes the car being inspected', cpWriteLeRead],
  ['unread untouched', 'every car the inspector has not reached is still the car that started there', cpUnreadSafe]
];
var CP_INV_TRAP = [
  ['prefix holds', 'the front of the train holds exactly the keepers read so far, in their original order', cpPrefixHolds],
  ['keepers kept', 'every keeper is still somewhere on the train', cpKeepersKept]
];
var CP_INV_CYC = [
  ['no parcel lost', 'the parcels on the seats and in the hand are the same parcels, only moved', cpNoParcelLost],
  ['set down = home', 'every seat already set down at holds the parcel that belongs there', cpPlacedHome]
];

/* ---------- residue rings: the seats a chain visits ---------- */
function cpRingWalked(s) {
  var r = s.ring, m = r.T.m;
  return r.rows.every(function (x) {
    if (!x.on) return true;
    var a = r.at[x.id];
    return x.cell === a - m * Math.floor(a / m) && x.turns === Math.floor(a / m);
  });
}
var CP_RING_INV = [['counted', 'each cell is the whole number a token reached, reduced mod the ring', cpRingWalked]];

function cpRingHops(n, k, startSeat, id, tone) {
  var T = new RingTrace({ m: n, name: 'seat', langs: true, tokens: [{ id: id, name: 'parcel from seat ' + startSeat, tone: tone }] });
  var c = cpCycles(n, k);
  T.step('A ring of ' + n + ' seats. The parcel from seat ' + startSeat + ' starts on seat ' + startSeat + '. Every hop moves it ' + k + ' seats clockwise.', [T.put(id, startSeat)], [id]);
  var at = startSeat;
  for (var h = 1; h <= c.len; h++) {
    at += k;
    T.step('Hop ' + h + ': the parcel is at ' + at + ', which is seat ' + (at - n * Math.floor(at / n)) + ' (' + at + ' = ' + Math.floor(at / n) + ' × ' + n + ' + ' + (at - n * Math.floor(at / n)) + ').', [T.walk(id, k)], [id]);
  }
  return { T: T, c: c, end: at };
}
function cpRingTwoSteps() {
  var n = 6, k = 2, c = cpCycles(n, k);
  var T = new RingTrace({ m: n, name: 'seat', langs: true, tokens: [{ id: 'a', name: 'parcel from seat 0', tone: 'cur' }, { id: 'b', name: 'parcel from seat 1', tone: 'info' }] });
  T.step('Six seats, and every parcel hops ' + k + ' seats clockwise. The parcels from seat 0 and seat 1 start where they stand.', [T.put('a', 0), T.put('b', 1)]);
  var at = 0;
  for (var h = 1; h <= c.len; h++) {
    at += k;
    T.step('The parcel from seat 0, hop ' + h + ': it has reached ' + at + ', seat ' + (at % n) + (h === c.len ? '. It is back where it started after ' + c.len + ' hops, one lap of the ring.' : '.'), [T.walk('a', k)], ['a']);
  }
  at = 1;
  for (h = 1; h <= c.len; h++) {
    at += k;
    T.step('The parcel from seat 1, hop ' + h + ': it has reached ' + at + ', seat ' + (at % n) + (h === c.len ? '. It too is home after ' + c.len + ' hops, and it never touched seats 0, 2 or 4.' : '.'), [T.walk('b', k)], ['b']);
  }
  return ringWalk(T, { intro: 'Where each parcel goes when seats shift by ' + k + ' on a ring of ' + n + '.',
    outro: 'Two separate chains: seats 0, 2, 4 and seats 1, 3, 5. ' + c.cycles + ' cycles of ' + c.len + ' seats each, and gcd(' + n + ', ' + k + ') is ' + cpGcd(n, k) + '.', inv: CP_RING_INV });
}
function cpRingOneSteps() {
  var n = 5, k = 2, c = cpCycles(n, k), A = cpRingHops(n, k, 0, 'a', 'cur');
  return ringWalk(A.T, { intro: 'Where the parcel from seat 0 goes when seats shift by ' + k + ' on a ring of ' + n + '.',
    outro: 'One chain touches all ' + n + ' seats before it closes: ' + c.cycles + ' cycle of ' + c.len + ' seats, and gcd(' + n + ', ' + k + ') is ' + cpGcd(n, k) + '. It takes ' + c.len + ' hops, ' + (A.end / n) + ' laps of the ring.', inv: CP_RING_INV });
}
function cpRingLeftSteps() {
  var n = 6, k = 2;
  var T = new RingTrace({ m: n, name: 'seat', langs: true, tokens: [{ id: 'a', name: 'parcel from seat 0', tone: 'cur' }, { id: 'b', name: 'parcel from seat 1', tone: 'info' }] });
  T.step('Rotating left by ' + k + ': the parcel in seat <i>i</i> belongs in seat (<i>i</i> − ' + k + ') mod ' + n + '. Both parcels start where they stand.', [T.put('a', 0), T.put('b', 1)]);
  T.step('The parcel from seat 0 steps back ' + k + ': it reaches ' + (0 - k) + '. Python\'s % puts that on seat ' + rgFloorMod(0 - k, n) + '; JavaScript\'s % gives ' + ((0 - k) % n) + ', which is no seat.', [T.walk('a', -k)], ['a']);
  T.step('The parcel from seat 1 steps back ' + k + ': it reaches ' + (1 - k) + '. Python gives seat ' + rgFloorMod(1 - k, n) + '; JavaScript gives ' + ((1 - k) % n) + '.', [T.walk('b', -k)], ['b']);
  return ringWalk(T, { intro: 'Rotating left: the destination (i − k) mod n.',
    outro: 'Whenever i − k is negative the two languages disagree. In JavaScript write ((i − k) % n + n) % n, or rotate right by n − k.', inv: CP_RING_INV });
}

/* ---------- hero: the inspector's pass over [0, 1, 0, 3, 12] ---------- */
function cpHeroFrames() {
  var a = [0, 1, 0, 3, 12], w = 0, frames = [];
  frames.push({ a: a.slice(), r: 0, w: 0, note: 'Five cars. The inspector (<b>R</b>) starts at the engine, and the coupling point (<b>W</b>) with it.' });
  for (var r = 0; r < a.length; r++) {
    var v = a[r];
    if (v !== 0) { a[w] = v; w++; }
    frames.push({ a: a.slice(), r: r + 1, w: w, note: v !== 0
      ? 'Car <b>' + v + '</b> carries something: couple it at slot <b>' + (w - 1) + '</b>.'
      : 'Car <b>0</b> carries nothing: skip it and leave the coupling point where it is.', cur: r });
  }
  frames.push({ a: a.slice(), r: a.length, w: w, note: 'The inspector reaches the caboose. The first <b>' + w + '</b> cars are the keepers, in order.' });
  return frames;
}

/* ---------- predict: how many separate cycles? ---------- */
var CP_GUESS = [[6, 4], [7, 3], [12, 8]].map(function (p) {
  var c = cpCycles(p[0], p[1]);
  return { n: p[0], k: p[1], expect: c.cycles, len: c.len };
});

var FACTS = (function () {
  var heroEnd = cpHeroFrames().slice(-1)[0], zero = cpKeepIf([0, 1, 0, 3, 12], cpNonZero), odd = cpKeepIf([2, 7, 4, 9, 6, 1, 5], cpOdd);
  var trap = [1, 3, 5, 2, 4, 6], rm = cpRemoveWhileIterating(trap, cpEven), rw = cpKeepIf(trap, cpEven);
  var safe = cpSafety(), c62 = cpCycles(6, 2), c52 = cpCycles(5, 2), mis = cpRotate(cpRange(6), 2, true), big = cpRotate(cpRange(1000), 300, false);
  var alt = function (n) { var a = []; for (var i = 0; i < n; i++) a.push(i % 2 === 0 ? 0 : i); return a; };
  var sh64 = cpShiftRemove(alt(64), cpNonZero), rw64 = cpKeepIf(alt(64), cpNonZero), sh1000 = cpShiftRemove(alt(1000), cpNonZero), rw1000 = cpKeepIf(alt(1000), cpNonZero);
  return {
    heroKept: heroEnd.w, keep0: zero.w, keep0tail: zero.a.slice(zero.w).join(', '), oddKept: odd.w,
    trapWant: rw.w, trapGot: rm.a.length, trapShifted: rm.shifted, trapCopies: rw.writes, trapLeft: rm.a[0],
    safeTrains: safe.trains, safeCopies: safe.copies, safeUnread: safe.unread,
    cyc62: c62.cycles, len62: c62.len, cyc52: c52.cycles, len52: c52.len,
    misHome: mis.placements, misOf: 6,
    shift64: sh64.moves, rw64: rw64.writes, shift1000: sh1000.moves, rw1000: rw1000.writes,
    bigPlace: big.placements, bigCycles: big.cycles, bigLen: cpCycles(1000, 300).len,
    jsModZero: String(5 % 0), jsNegMod: (0 - 2) % 6, pyNegMod: rgFloorMod(0 - 2, 6),
    quizN: 12, quizK: 8, quizCycles: cpCycles(12, 8).cycles, quizLen: cpCycles(12, 8).len,
    guess0: CP_GUESS[0].expect, guess1: CP_GUESS[1].expect, guess2: CP_GUESS[2].expect
  };
})();
/* PURE:end */

/* ---------- hero ---------- */
function mountCpHero() {
  var row = document.getElementById('heroRow');
  if (!row) return;
  var cars = row.querySelectorAll('.cp-car'), ptrs = document.querySelectorAll('#heroPtrs span');
  var num = document.getElementById('heroNum'), cap = document.getElementById('heroCap');
  var F = cpHeroFrames(), k = 0;
  function show(i) {
    var f = F[i];
    cars.forEach(function (c, j) {
      c.textContent = f.a[j];
      c.classList.toggle('cp-kept', j < f.w);
      c.classList.toggle('cp-cur', f.cur === j);
    });
    ptrs.forEach(function (p, j) {
      var s = '';
      if (j === f.r && j === f.w) s = 'R W'; else if (j === f.r) s = 'R'; else if (j === f.w) s = 'W';
      p.textContent = s;
    });
    num.textContent = f.w;
    cap.innerHTML = f.note;
  }
  if (reduce) { show(F.length - 1); return; }
  show(0);
  setInterval(function () { k = (k + 1) % (F.length + 1); show(Math.min(k, F.length - 1)); }, 1700);
}

function mountCpGuess(host) {
  mountPredict(host, CP_GUESS, {
    question: function (c) { return 'Rotating ' + c.n + ' seats by k = ' + c.k + ' sends seat <i>i</i> to seat (<i>i</i> + ' + c.k + ') mod ' + c.n + '. How many separate cycles do the seats fall into?'; },
    choices: function (c) {
      var g = cpGcd(c.n, c.k), pool = [1, g, c.n / g, c.k, c.n], out = [];
      pool.forEach(function (v) { if (out.indexOf(v) < 0) out.push(v); });
      return out.sort(function (x, y) { return x - y; });
    },
    draw: function (view, c) {
      var row = el('div', 'cp-mini');
      for (var j = 0; j < c.n; j++) row.appendChild(el('span', 'cp-mseat', String(j)));
      view.appendChild(row);
      return { reveal: function () {
        row.querySelectorAll('.cp-mseat').forEach(function (s, j) { s.setAttribute('data-cycle', String(j % c.expect)); s.classList.add('cp-m' + (j % c.expect)); });
      } };
    },
    why: function (c) {
      var g = cpGcd(c.n, c.k);
      return 'A chain closes after n / gcd(n, k) hops, and n seats split into gcd(n, k) of them. Here gcd(' + c.n + ', ' + c.k + ') = ' + g + ', so ' + g + ' cycles of ' + (c.n / g) + ' seats. ' +
        'Seats with the same remainder when divided by ' + g + ' share a chain; seats ' + (function () { var s = []; for (var j = 0; j < c.n; j += g) s.push(j); return s.join(', '); })() + ' are one of them.';
    }
  });
}

function mountCpCost() {
  var pts = [], alt = function (n) { var a = []; for (var i = 0; i < n; i++) a.push(i % 2 === 0 ? 0 : i); return a; };
  for (var n = 0; n <= 64; n += 8) pts.push([n, cpShiftRemove(alt(n), cpNonZero).moves, cpKeepIf(alt(n), cpNonZero).writes]);
  costChart(document.getElementById('cp-chart'), {
    names: ['delete each car, sliding the rest left', 'read and write pointers'], ylabel: 'cars moved', pts: pts, xlabel: 'cars in the train (every other one dropped)', xticks: [0, 16, 32, 48, 64],
    aria: 'Cars moved to drop every other car of an n-car train: deleting each one and sliding the rest left grows as n squared over 4, reaching ' + FACTS.shift64 + ' at 64 cars; read and write pointers make ' + FACTS.rw64 + '.'
  });
  mountFacts(document.getElementById('cp-facts'), [
    { v: FACTS.shift1000, l: 'cars moved by delete-and-slide on 1,000 cars with every other one dropped, counted' },
    { v: FACTS.rw1000, l: 'copies the read and write pointers make on the same train' },
    { v: FACTS.bigPlace, l: 'parcels set down to rotate 1,000 seats by 300, across ' + FACTS.bigCycles + ' chains of ' + FACTS.bigLen + ' seats, one parcel in hand throughout' }
  ]);
}

function mountPage() {
  mountLesson();
  mountCpHero();
  mountLaneTabs($('#rwtabs'), [
    { name: 'Keep the non-zeros', steps: function () { return cpKeepSteps([0, 1, 0, 3, 12], cpNonZero, 'Keep every car that carries something (not 0).'); } },
    { name: 'Keep the odd cars', steps: function () { return cpKeepSteps([2, 7, 4, 9, 6, 1, 5], cpOdd, 'Keep every car with an odd number.'); } },
    { name: 'Nothing to drop', steps: function () { return cpKeepSteps([3, 1, 4, 1, 5], cpAlways, 'Keep every car.'); } },
    { name: 'Drop everything', steps: function () { return cpKeepSteps([2, 4, 6, 8], cpOdd, 'Keep every car with an odd number.'); } }
  ], { id: 'rw', inv: CP_INV_RW });
  mountLaneTabs($('#rwtrap'), [
    { name: 'Read and write pointers', steps: function () { return cpKeepSteps([1, 3, 5, 2, 4, 6], cpEven, 'Keep the even cars.'); } },
    { name: 'Delete while iterating', steps: function () { return cpRemoveSteps([1, 3, 5, 2, 4, 6], cpEven); } }
  ], { id: 'rt', inv: CP_INV_TRAP });
  mountLaneTabs($('#cytabs'), [
    { name: 'Six seats, k = 2', steps: function () { return cpCycSteps(6, 2, false); } },
    { name: 'Five seats, k = 2', steps: function () { return cpCycSteps(5, 2, false); } }
  ], { id: 'cy', inv: CP_INV_CYC });
  mountRingTabs($('#cyring'), [
    { name: 'Six seats: two cycles', steps: cpRingTwoSteps },
    { name: 'Five seats: one cycle', steps: cpRingOneSteps },
    { name: 'Rotating left', steps: cpRingLeftSteps }
  ], { id: 'cr' });
  mountLaneTabs($('#cymistake'), [
    { name: 'Six seats: breaks', steps: function () { return cpCycSteps(6, 2, true); } },
    { name: 'Five seats: happens to work', steps: function () { return cpCycSteps(5, 2, true); } }
  ], { id: 'cm', inv: CP_INV_CYC });
  mountCpCost();
  mountCpGuess(document.getElementById('cypred'));
  if (typeof kinetic === 'function') kinetic();
  if (typeof riseIn === 'function') riseIn();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountPage);
  else mountPage();
}
