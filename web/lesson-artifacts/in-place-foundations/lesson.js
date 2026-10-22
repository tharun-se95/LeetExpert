/* ================= In-Place Foundations & Symmetric Pointers =================
   Every walkthrough here is recorded from a real array being reversed, and every number on the
   page is counted by instrumented code in the PURE block, which check.py re-runs in node and
   compares with an independent derivation in Python. */

/* PURE:begin (no DOM below this line until PURE:end) */

/* Reverse arr[lo..hi] with converging pointers, counting swaps. every=true is the mistake's loop,
   one pass per position instead of one per pair. Returns the array and where the pointers stopped. */
function ipReverse(arr, lo, hi, every) {
  var a = arr.slice(), l = lo, r = hi, swaps = 0, tmp;
  if (every) {
    for (var i = 0; i <= hi - lo; i++) {
      tmp = a[lo + i]; a[lo + i] = a[hi - i]; a[hi - i] = tmp; swaps++;
    }
    return { a: a, swaps: swaps, l: lo + (hi - lo + 1), r: hi - (hi - lo + 1) };
  }
  while (l < r) {
    tmp = a[l]; a[l] = a[r]; a[r] = tmp; swaps++; l++; r--;
  }
  return { a: a, swaps: swaps, l: l, r: r };
}

function ipRange(n) {
  var a = [];
  for (var i = 1; i <= n; i++) a.push(i);
  return a;
}

/* spare slots each way of reversing n cars needs, counted where they are taken */
function ipSpare(n) {
  var copy = 0, out = [], src = ipRange(n);
  for (var i = 0; i < n; i++) { copy++; out.push(src[n - 1 - i]); }       // one slot of the second track per car
  var r = ipReverse(src, 0, n - 1, false);
  return { copy: copy, place: r.swaps > 0 ? 1 : 0, swaps: r.swaps };      // the swap's one temporary, if it ever swaps
}

/* ---------- recorded walkthroughs, built on the kit's lanes ---------- */
function ipRec(M, steps, note, o, meta) {
  var s = M.snap(note, o);
  s.meta = meta;
  steps.push(s);
  return s;
}
function ipArr(M) {
  return M.lane('a').items.map(function (x) { return +x.v; });
}
function ipExpected(orig, lo, hi) {
  return orig.slice(0, lo).concat(orig.slice(lo, hi + 1).reverse(), orig.slice(hi + 1));
}

/* Reverse slots lo..hi of lane 'a' on M, one step per pass. The state st is shared by the fields
   line so the pointers and the swap count stay in step with the picture. */
function ipPhase(M, steps, st, lo, hi, every) {
  var orig = ipArr(M), n = orig.length, items = M.lane('a').items;
  function meta(l, r) { return { orig: orig, lo: lo, hi: hi, l: l, r: r }; }
  function tones(l, r) {
    items.forEach(function (it, j) {
      if (j < lo || j > hi) M.tone(it, 'dim');
      else if (j < l || j > r) M.tone(it, +it.v === orig[lo + hi - j] ? 'good' : 'bad');   // a claimed-final car that is wrong shows it
      else M.tone(it, null);
    });
  }
  function show(l, r) {
    st.l = l; st.r = r;
    M.mark('a', 'l', l >= 0 && l < n ? l : null);
    M.mark('a', 'r', r >= 0 && r < n ? r : null);
    if (l <= r) M.span('a', 'unfinished', l, r); else M.span('a', 'unfinished', 1, 0);
    tones(l, r);
  }
  items = M.lane('a').items;
  show(lo, hi);
  var span = hi - lo + 1;
  ipRec(M, steps, 'Reverse slots ' + lo + ' to ' + hi + ' in place. <code>left</code> stands on slot ' + lo + ' and <code>right</code> on slot ' + hi + '. Nothing outside them is finished yet, and nothing needs to be: the finished region is empty.',
    { hi: ['l', 'r', 'unfinished'], done: true }, meta(lo, hi));
  if (!every) {
    var l = lo, r = hi;
    while (l < r) {
      var x = M.lane('a').items[l], y = M.lane('a').items[r];
      var xv = x.v, yv = y.v;
      M.swap('a', l, r); st.swaps++;
      l++; r--;
      items = M.lane('a').items;
      show(l, r);
      ipRec(M, steps, 'Swap slots ' + (l - 1) + ' and ' + (r + 1) + ': ' + xv + ' and ' + yv + ' trade places and are now final. Both pointers step inward' +
        (l < r ? '.' : (l === r ? ', and meet on slot ' + l + '.' : ', and have crossed.')),
        { hi: [laneHi(x), laneHi(y), 'l', 'r'], done: true }, meta(l, r));
    }
    ipRec(M, steps, l === r
      ? '<code>left</code> and <code>right</code> both stand on slot ' + l + '. One car is left, and it is the exact middle, so it is already where it belongs. Nothing is unfinished.'
      : '<code>left</code> is ' + l + ' and <code>right</code> is ' + r + ': they have crossed, so the unfinished region is empty. Every car is in its final place.',
      { hi: ['l', 'r'], done: true }, meta(l, r));
  } else {
    for (var i = 0; i < span; i++) {
      var a = lo + i, b = hi - i, p = M.lane('a').items[a], q = M.lane('a').items[b];
      var pv = p.v, qv = q.v;
      M.swap('a', a, b); st.swaps++;
      items = M.lane('a').items;
      show(a + 1, b - 1);
      ipRec(M, steps, a < b
        ? 'Pass ' + (i + 1) + ': swap slots ' + a + ' and ' + b + ', ' + pv + ' and ' + qv + '.'
        : (a === b ? 'Pass ' + (i + 1) + ': slot ' + a + ' swaps with itself, and nothing moves.'
          : 'Pass ' + (i + 1) + ': swap slots ' + a + ' and ' + b + ' again. This pair was swapped on pass ' + (span - i) + ', so the swap undoes it.'),
        { hi: [laneHi(p), laneHi(q), 'l', 'r'], done: true }, meta(a + 1, b - 1));
    }
  }
}

function ipRevSteps(n, lo, hi, every) {
  var st = { l: lo, r: hi, swaps: 0 };
  var M = new Lanes([{ id: 'a', kind: 'row', label: 'train', cap: n }], { fields: function () { return [['left', st.l], ['right', st.r], ['swaps', st.swaps]]; } });
  ipRange(n).forEach(function (v, j) { M.put('a', j, v); });
  var steps = [];
  ipPhase(M, steps, st, lo, hi, every);
  var want = every ? ipRange(n) : ipExpected(ipRange(n), lo, hi);
  if (ipArr(M).join() !== want.join()) throw new Error('reverse walkthrough disagrees with its model');
  return steps;
}

/* rotate right by k with three reversals: all, the first k, the rest */
function ipRotateSteps() {
  var n = 7, k = 3, st = { l: 0, r: n - 1, swaps: 0 };
  var M = new Lanes([{ id: 'a', kind: 'row', label: 'train', cap: n }], { fields: function () { return [['left', st.l], ['right', st.r], ['swaps', st.swaps]]; } });
  ipRange(n).forEach(function (v, j) { M.put('a', j, v); });
  var steps = [];
  ipPhase(M, steps, st, 0, n - 1, false);
  ipPhase(M, steps, st, 0, k - 1, false);
  ipPhase(M, steps, st, k, n - 1, false);
  var src = ipRange(n), want = src.slice(n - k).concat(src.slice(0, n - k));
  if (ipArr(M).join() !== want.join()) throw new Error('three reversals disagree with rotating by ' + k);
  return steps;
}

function ipCopySteps() {
  var n = 4, M = new Lanes([{ id: 'a', kind: 'row', label: 'train', cap: n }, { id: 'out', kind: 'row', label: 'second track', cap: n }],
    { fields: function (m) { return [['spare slots in use', m.size('out')]]; } });
  var src = ipRange(n), steps = [];
  src.forEach(function (v, j) { M.put('a', j, v); });
  ipRec(M, steps, 'A train of ' + n + ' cars, and a second track beside it. Reversing means building the train backwards over there.', { done: true }, null);
  for (var i = 0; i < n; i++) {
    var from = n - 1 - i, c = M.copy('a', from, 'out', i);
    ipRec(M, steps, 'Copy the car in slot ' + from + ' to slot ' + i + ' of the second track. Spare slots in use: ' + M.size('out') + '.', { hi: [laneHi(c), 'spare slots in use'], done: true }, null);
  }
  ipRec(M, steps, 'The second track now holds the train reversed, but it took one spare slot for every car. Longer train, longer track.', { hi: ['spare slots in use'], done: true }, null);
  if (M.lane('out').items.map(function (x) { return +x.v; }).join() !== src.slice().reverse().join()) throw new Error('copy walkthrough is not the reverse');
  return steps;
}

function ipSwapSteps() {
  var n = 4, M = new Lanes([{ id: 'a', kind: 'row', label: 'train', cap: n }, { id: 'hand', kind: 'row', label: 'the one spare slot', cap: 1 }],
    { fields: function (m) { return [['spare slots in use', m.size('hand')]]; } });
  var src = ipRange(n), steps = [];
  src.forEach(function (v, j) { M.put('a', j, v); });
  ipRec(M, steps, 'The same ' + n + ' cars with no second track, only one spare slot. A swap has to borrow it.', { done: true }, null);
  for (var l = 0, r = n - 1; l < r; l++, r--) {
    var lv = M.lane('a').items[l].v, rv = M.lane('a').items[r].v;
    var h = M.copy('a', l, 'hand', 0);
    ipRec(M, steps, 'Lift the car in slot ' + l + ' (' + lv + ') into the spare slot. Slot ' + l + ' can now be overwritten without losing it.', { hi: [laneHi(h), 'spare slots in use'] }, null);
    var c = M.copy('a', r, 'a', l);
    ipRec(M, steps, 'Copy the car in slot ' + r + ' (' + rv + ') into slot ' + l + '. The spare slot is still holding ' + lv + '.', { hi: [laneHi(c)] }, null);
    var d = M.copy('hand', 0, 'a', r);
    M.clear('hand', 0);
    ipRec(M, steps, 'Put the held car, ' + lv + ', into slot ' + r + ' and empty the spare slot. The pair has traded places.', { hi: [laneHi(d), 'spare slots in use'], done: true }, null);
  }
  if (ipArr(M).join() !== src.slice().reverse().join()) throw new Error('swap walkthrough is not the reverse');
  return steps;
}

function ipPeak(steps) {
  return Math.max.apply(null, steps.map(function (s) { return +s.fields[0][1]; }));
}

/* the loop's own length in each language: Python floors n / 2, JavaScript's n / 2 keeps its half */
function ipLoopPasses(n) {
  var js = 0, py = 0, i;
  for (i = 0; i < n / 2; i++) js++;
  for (i = 0; i < Math.floor(n / 2); i++) py++;
  return { js: js, py: py };
}

function ipHeroFrames() {
  var a = ipRange(6), l = 0, r = 5, swaps = 0, frames = [];
  frames.push({ a: a.slice(), l: l, r: r, swaps: 0, note: 'Cars 1 to 6 sit in order. <b>L</b> and <b>R</b> stand at the two ends.' });
  while (l < r) {
    var x = a[l], y = a[r], t = a[l]; a[l] = a[r]; a[r] = t; swaps++; l++; r--;
    frames.push({ a: a.slice(), l: l, r: r, swaps: swaps, note: 'Swap cars <b>' + x + '</b> and <b>' + y + '</b>. Both are final now, so <b>L</b> and <b>R</b> step inward.', pair: [l - 1, r + 1] });
  }
  frames.push({ a: a.slice(), l: l, r: r, swaps: swaps, note: 'The pointers have crossed. The train is reversed: <b>' + swaps + '</b> swaps, no second track.' });
  return frames;
}

/* the claims the panel checks at rest, written from the snapshot's array and pointers alone */
function ipOutsideFinal(s) {
  var m = s.meta, ok = true;
  s.lanes[0].items.forEach(function (it, j) {
    var v = +it.v;
    if (j < m.lo || j > m.hi) { if (v !== m.orig[j]) ok = false; }
    else if (j < m.l || j > m.r) { if (v !== m.orig[m.lo + m.hi - j]) ok = false; }
  });
  return ok;
}
function ipNoLoss(s) {
  var a = s.lanes[0].items.map(function (it) { return +it.v; }).sort(function (x, y) { return x - y; });
  var b = s.meta.orig.slice().sort(function (x, y) { return x - y; });
  return a.join() === b.join();
}
var IP_INV = [
  ['finished', 'every slot outside the pointers already holds its final value', ipOutsideFinal],
  ['no car lost', 'the cars on the track are the same cars, only rearranged', ipNoLoss]
];

var IP_GUESS = [9, 6, 11].map(function (n) { return { n: n, expect: ipReverse(ipRange(n), 0, n - 1, false).swaps }; });

var FACTS = (function () {
  var e = ipReverse(ipRange(6), 0, 5, false), o = ipReverse(ipRange(7), 0, 6, false), big = ipReverse(ipRange(1000), 0, 999, false);
  var all = ipReverse(ipRange(6), 0, 5, true), p = ipLoopPasses(7), sp = ipSpare(1000), sp64 = ipSpare(64);
  return {
    swaps6: e.swaps, left6: e.l, right6: e.r,
    swaps7: o.swaps, left7: o.l, right7: o.r,
    swaps1000: big.swaps, spare1000: sp.copy, place1000: sp.place,
    spare64: sp64.copy, place64: sp64.place,
    copyPeak: ipPeak(ipCopySteps()), swapPeak: ipPeak(ipSwapSteps()),
    allSwaps6: all.swaps, allSame6: all.a.join() === ipRange(6).join() ? 1 : 0,
    jsPasses7: p.js, pyPasses7: p.py,
    guess0: IP_GUESS[0].expect, guess1: IP_GUESS[1].expect, guess2: IP_GUESS[2].expect
  };
})();
/* PURE:end */

/* ---------- hero: six cars, reversed by swapping inward ---------- */
function mountIpHero() {
  var row = document.getElementById('heroRow');
  if (!row) return;
  var cars = row.querySelectorAll('.ip-car'), ptrs = document.querySelectorAll('#heroPtrs span');
  var num = document.getElementById('heroNum'), cap = document.getElementById('heroCap');
  var F = ipHeroFrames(), k = 0;
  function show(i) {
    var f = F[i];
    cars.forEach(function (c, j) {
      c.textContent = f.a[j];
      c.classList.toggle('ip-pair', !!f.pair && (j === f.pair[0] || j === f.pair[1]));
      c.classList.toggle('ip-fin', j < f.l || j > f.r);
    });
    ptrs.forEach(function (p, j) { p.textContent = (j === f.l && j === f.r) ? 'L R' : (j === f.l ? 'L' : (j === f.r ? 'R' : '')); });
    num.textContent = f.swaps;
    cap.innerHTML = f.note;
  }
  if (reduce) { show(F.length - 1); return; }
  show(0);
  setInterval(function () { k = (k + 1) % (F.length + 1); show(Math.min(k, F.length - 1)); }, 1700);
}

/* ---------- widgets ---------- */
function mountIpGuess(host) {
  mountPredict(host, IP_GUESS, {
    question: function (c) { return 'A train of ' + c.n + ' cars is reversed with converging pointers. How many swaps does it take?'; },
    choices: function (c) {
      var f = Math.floor(c.n / 2), pool = [f, Math.ceil(c.n / 2), f + 1, c.n - 1, c.n], out = [];
      pool.forEach(function (v) { if (out.indexOf(v) < 0) out.push(v); });
      return out.sort(function (x, y) { return x - y; });
    },
    draw: function (view, c) {
      var row = el('div', 'ip-mini');
      for (var j = 1; j <= c.n; j++) row.appendChild(el('span', 'ip-mcar', String(j)));
      view.appendChild(row);
      return { reveal: function () {
        row.querySelectorAll('.ip-mcar').forEach(function (s, j) { s.classList.toggle('ip-fin', j < Math.floor(c.n / 2) || j >= c.n - Math.floor(c.n / 2)); });
      } };
    },
    why: function (c) {
      var f = Math.floor(c.n / 2);
      return 'Each swap fixes two cars and the pointers close the gap by 2, so the loop stops after ⌊' + c.n + ' / 2⌋ = ' + f + ' swaps' +
        (c.n % 2 ? ', leaving the middle car alone.' : ', with no car left over.');
    }
  });
}

function mountIpCost() {
  var pts = [];
  for (var n = 0; n <= 64; n += 8) { var s = ipSpare(n); pts.push([n, s.copy, s.place]); }
  costChart(document.getElementById('ip-chart'), {
    names: ['copy onto a second track', 'swap in place'], ylabel: 'spare slots', pts: pts, xlabel: 'cars in the train', xticks: [0, 16, 32, 48, 64],
    aria: 'Spare slots needed to reverse a train of n cars: copying onto a second track needs one per car, reaching ' + FACTS.spare64 + ' at 64 cars; swapping in place needs ' + FACTS.place64 + ' however long the train is.'
  });
  mountFacts(document.getElementById('ip-facts'), [
    { v: FACTS.swaps1000, l: 'swaps to reverse 1,000 cars in place, counted by running it' },
    { v: FACTS.spare1000, l: 'spare slots the copy needs for the same 1,000 cars' },
    { v: FACTS.place1000, l: 'spare slot the swap needs for them, borrowed again for every pair' }
  ]);
}

function mountPage() {
  mountLesson();
  mountIpHero();
  mountLaneTabs($('#ipcost'), [
    { name: 'Copy onto a second track', steps: ipCopySteps },
    { name: 'Swap in place', steps: ipSwapSteps }
  ], { id: 'ipc' });
  mountLaneTabs($('#rvtabs'), [
    { name: 'Six cars', steps: function () { return ipRevSteps(6, 0, 5, false); } },
    { name: 'Seven cars', steps: function () { return ipRevSteps(7, 0, 6, false); } },
    { name: 'A range inside', steps: function () { return ipRevSteps(8, 2, 5, false); } },
    { name: 'Rotate by three reversals', steps: ipRotateSteps }
  ], { id: 'rv', inv: IP_INV });
  mountLaneTabs($('#iptrap'), [
    { name: 'Stop at the middle', steps: function () { return ipRevSteps(6, 0, 5, false); } },
    { name: 'Go all the way round', steps: function () { return ipRevSteps(6, 0, 5, true); } }
  ], { id: 'tr', inv: IP_INV });
  mountIpCost();
  mountIpGuess(document.getElementById('ipguess'));
  if (typeof kinetic === 'function') kinetic();
  if (typeof riseIn === 'function') riseIn();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountPage);
  else mountPage();
}
