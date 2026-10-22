/* ================= Dynamic Arrays, Built From Scratch: the lesson =================
   Growth, the policy that decides how much bigger, and why shrinking is lazy.
   Every number the page shows comes from the PURE block, which check.py re-runs in node
   against an independent Python model. */

/* PURE:begin (no DOM below this line until PURE:end) */
var DA_VALUES = [3, 7, 1, 9, 4];
var DA_POLICIES = [
  { id: 'x2', name: '×2', f: 2 },
  { id: 'x15', name: '×1.5', f: 1.5 },
  { id: 'x125', name: '×1.25', f: 1.25 },
  { id: 'p8', name: '+8', c: 8 },
  { id: 'p64', name: '+64', c: 64 }
];
var DA_MAXN = 2000;

/* the next capacity: a factor always grows by at least one slot, a step adds its constant */
function daNext(cap, p) { return p.f ? Math.max(cap + 1, Math.ceil(cap * p.f)) : cap + p.c; }

/* n appends from capacity 1: a full block is replaced by a bigger one and every element is copied.
   series[k-1] is the copies per append after k appends; cost[k-1] is what append k alone cost */
function daRun(n, p) {
  var cap = 1, len = 0, copies = 0, resizes = 0, peak = 0, series = [], cost = [];
  for (var k = 1; k <= n; k++) {
    var c = 0;
    if (len === cap) { c = len; copies += len; resizes++; cap = daNext(cap, p); }
    len++;
    peak = Math.max(peak, (cap - len) / cap);
    series.push(copies / k); cost.push(1 + c);
  }
  return { copies: copies, resizes: resizes, cap: cap, peak: peak, series: series, cost: cost };
}

/* alternate append and pop around a full block of 64: eager shrinks as soon as the array is half empty,
   lazy only when it is a quarter full, and then to half */
function daThrash(eager, ops) {
  var cap = 64, len = 64, total = 0, per = [];
  for (var k = 0; k < ops; k++) {
    var c = 0;
    if (k % 2 === 0) {
      if (len === cap) { c = len; cap *= 2; }
      len++;
    } else {
      len--;
      if (eager ? len * 2 <= cap : len * 4 <= cap) { c = len; cap /= 2; }
    }
    total += c; per.push(c);
  }
  return { total: total, per: per, cap: cap };
}

/* ---- the step-by-step walkthroughs, drawn by the lane player ---- */
function daRecorder(M) { var steps = []; return { steps: steps, rec: function (note, o) { steps.push(M.snap(note, o)); } }; }

function daGrowSteps() {
  var caps = [1, 2, 4, 8], len = 0, cap = 1, copies = 0;
  var M = new Lanes(caps.map(function (c) { return { id: 'b' + c, kind: 'row', label: 'block of capacity ' + c, cap: c }; }),
    { fields: function () { return [['length', len], ['capacity', cap], ['copies', copies]]; } }), R = daRecorder(M);
  R.rec('An empty dynamic array: length 0, capacity 1. Its block has one slot.', { done: true });
  DA_VALUES.forEach(function (v) {
    var id = 'b' + cap, it, k;
    if (len === cap) {
      var nextCap = daNext(cap, DA_POLICIES[0]), nid = 'b' + nextCap;
      R.rec('Append ' + v + ', but length ' + len + ' equals capacity ' + cap + ': the block is full. Allocate a new block of capacity ' + nextCap + '.', { hi: ['lane:' + nid, 'capacity'] });
      var from = M.lane(id).items;
      for (k = 0; k < len; k++) {
        it = M.copy(id, k, nid, k); copies++;
        R.rec('Copy slot ' + k + ', ' + it.v + ', into the new block. Copies so far: ' + copies + '.', { hi: [laneHi(it), 'copies'] });
      }
      from.forEach(function (x) { if (x) M.tone(x, 'dim'); });
      cap = nextCap; id = nid;
      R.rec('The old block is retired. Every value now lives in the block of capacity ' + cap + ', which has room for the new one.', { hi: ['capacity'] });
    }
    it = M.put(id, len, v); len++;
    R.rec('Write ' + v + ' into slot ' + (len - 1) + '. Length is now ' + len + '.', { hi: [laneHi(it), 'length'], done: true });
  });
  return R.steps;
}

function daInsertSteps() {
  var CAP = 8, vals = [3, 7, 1, 9], len = 0, moves = 0, cells = [];
  var M = new Lanes([{ id: 'a', kind: 'row', label: 'block of capacity ' + CAP, cap: CAP }],
    { fields: function () { return [['length', len], ['moves', moves]]; } }), R = daRecorder(M);
  vals.forEach(function (v, k) { cells.push(M.put('a', k, v)); len++; });
  R.rec('Four values in a block of capacity ' + CAP + ': there is room, so no growth is needed.', { done: true });
  M.mark('a', 'new', 1);
  R.rec('Insert 5 at index 1. Everything from index 1 on has to move right to open the slot.', { hi: ['new'] });
  var j, it;
  for (j = len; j > 1; j--) {
    it = M.lane('a').items[j - 1]; M.swap('a', j - 1, j); moves++; M.tone(it, 'cur');
    R.rec('Move the value in slot ' + (j - 1) + ', ' + it.v + ', one slot right.', { hi: [laneHi(it), 'moves'] });
    M.tone(it, 'dim');
  }
  it = M.put('a', 1, 5); len++; M.mark('a', 'new', null);
  R.rec('Write 5 into slot 1. ' + moves + ' values moved, the same n − i that a raw array pays. The capacity never came into it.', { hi: [laneHi(it), 'moves', 'length'], done: true });
  return R.steps;
}

function daPopSteps() {
  var CAP = 8, vals = [3, 7, 1, 9], len = 0, moves = 0;
  var M = new Lanes([{ id: 'a', kind: 'row', label: 'block of capacity ' + CAP, cap: CAP }],
    { fields: function () { return [['length', len], ['moves', moves]]; } }), R = daRecorder(M);
  vals.forEach(function (v, k) { M.put('a', k, v); len++; });
  R.rec('The same four values, capacity ' + CAP + '.', { done: true });
  M.mark('a', 'end', len - 1);
  R.rec('Pop takes the last value. It is the one slot nobody sits behind.', { hi: ['end'] });
  var it = M.clear('a', len - 1); len--; M.mark('a', 'end', null);
  R.rec('Length drops to ' + len + ' and the slot is cleared: ' + moves + ' values moved. The block keeps its capacity of ' + CAP + ', ready for the next append.', { hi: ['length', 'moves'], done: true });
  return R.steps;
}
function daLive(s) {
  var len = +s.fields.filter(function (f) { return f[0] === 'length'; })[0][1], live = null;
  s.lanes.forEach(function (l) { if (l.items.some(function (x) { return x; })) live = l; });
  if (!len) return true;
  if (!live) return false;
  for (var k = 0; k < live.items.length; k++) {
    var it = live.items[k];
    if (k < len ? !it : !!it) return false;
  }
  return true;
}
function daFits(s) {
  var f = {}; s.fields.forEach(function (x) { f[x[0]] = +x[1]; });
  return f.capacity === undefined ? s.lanes[0].cap >= f.length : f.length <= f.capacity;
}
var DA_INV = [['fits', 'the length never exceeds the capacity', daFits],
              ['packed', 'the live block holds the values packed from slot 0', daLive]];

/* ---- facts the prose, readouts and quiz show ---- */
function daLast(run, name) { return +run[run.length - 1].fields.filter(function (f) { return f[0] === name; })[0][1]; }
var DA_GROW = daGrowSteps(), DA_INS = daInsertSteps();
var DA_R16 = daRun(16, DA_POLICIES[0]), DA_R1000 = {};
DA_POLICIES.forEach(function (p) { DA_R1000[p.id] = daRun(1000, p); });
var FACTS = {
  growCopies: daLast(DA_GROW, 'copies'),
  growWrites: DA_VALUES.length + daLast(DA_GROW, 'copies'),
  insertMoves: daLast(DA_INS, 'moves'),
  copies5: daRun(5, DA_POLICIES[0]).copies,
  copies9: daRun(9, DA_POLICIES[0]).copies,
  copies17: daRun(17, DA_POLICIES[0]).copies,
  heroWrites: DA_R16.cost.reduce(function (a, b) { return a + b; }, 0),
  heroPeak: Math.max.apply(null, DA_R16.cost),
  heroAvg: Math.round(DA_R16.cost.reduce(function (a, b) { return a + b; }, 0) / 16 * 100) / 100,
  dbl1000: DA_R1000.x2.copies,
  half1000: DA_R1000.x15.copies,
  step8_1000: DA_R1000.p8.copies,
  step64_1000: DA_R1000.p64.copies,
  step8per1000: Math.round(DA_R1000.p8.copies / 1000 * 10) / 10,
  eager20: daThrash(true, 20).total,
  lazy20: daThrash(false, 20).total
};
/* PURE:end */

function heroLabel(box, W, H, x, y, text, cls) {
  var s = document.createElement('span');
  s.className = 'hero-lab ' + (cls || '');
  s.style.left = (100 * x / W).toFixed(2) + '%';
  s.style.top = (100 * y / H).toFixed(2) + '%';
  s.textContent = text;
  box.appendChild(s);
}

/* ---------- Hero: what each of 16 appends costs ---------- */
function mountHeroBars() {
  var svg = document.getElementById('heroBars'), box = document.getElementById('heroBox');
  if (!svg || !box) return;
  var W = 560, H = 204, n = 16, step = 33, bw = 24, x0 = 18, base = 150, top = 22, h = '';
  var peak = FACTS.heroPeak, unit = (base - top) / peak;
  var avgY = base - FACTS.heroAvg * unit;
  DA_R16.cost.forEach(function (c, k) {
    var x = x0 + k * step, hgt = c * unit, spike = c > 1;
    h += '<rect x="' + x + '" y="' + (base - hgt).toFixed(1) + '" width="' + bw + '" height="' + hgt.toFixed(1) + '" rx="3" fill="' + (spike ? 'var(--pop)' : 'var(--card-navy)') + '" stroke="' + (spike ? 'var(--mark)' : 'var(--hair2)') + '" stroke-width="1.5"/>';
    heroLabel(box, W, H, x + bw / 2, base + 14, String(k + 1), 'hero-lab-off');
    if (spike) heroLabel(box, W, H, x + bw / 2, base - hgt - 11, String(c), 'hero-lab-b');
  });
  h += '<line x1="8" y1="' + base + '" x2="552" y2="' + base + '" stroke="var(--hair2)" stroke-width="2"/>';
  h += '<line x1="8" y1="' + avgY.toFixed(1) + '" x2="552" y2="' + avgY.toFixed(1) + '" stroke="var(--o-ink)" stroke-width="2" stroke-dasharray="5 4"/>';
  svg.innerHTML = h;
  heroLabel(box, W, H, 470, avgY - 12, 'average ' + FACTS.heroAvg, 'hero-lab-o');
  heroLabel(box, W, H, 280, H - 12, 'append number', 'hero-lab-off');
  var num = document.getElementById('heroNum'), cap = document.getElementById('heroCap');
  if (num) num.textContent = String(FACTS.heroWrites);
  if (cap) cap.innerHTML = 'Append 9 costs <b>' + FACTS.heroPeak + '</b>, but the average over 16 appends is <b>' + FACTS.heroAvg + '</b>, under 3.';
}

/* ---------- Predict: copies for n appends ---------- */
function mountPredictCopies() {
  var host = $('#predictcopies'); if (!host) return;
  var cases = [5, 9, 17].map(function (n) { return { n: n, expect: daRun(n, DA_POLICIES[0]).copies }; });
  mountPredict(host, cases, {
    question: function (c) { return 'A dynamic array starts at capacity 1 and doubles when it is full. After ' + c.n + ' appends, how many element copies did growth make in total?'; },
    draw: function (view, c) {
      var caps = [], cap = 1, len = 0, k;
      for (k = 0; k < c.n; k++) { if (len === cap) { cap *= 2; caps.push(cap); } len++; }
      view.innerHTML = '<div class="da-note">Capacity goes 1' + caps.map(function (x) { return ' → ' + x; }).join('') + ' as the array fills.</div>';
    },
    choices: function (c) {
      var set = {}; [c.expect, c.n - 1, c.n, 2 * c.n].forEach(function (v) { set[v] = 1; });
      return Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
    },
    why: function (c) {
      var parts = [], cap = 1, len = 0, k;
      for (k = 0; k < c.n; k++) { if (len === cap) { parts.push(len); cap *= 2; } len++; }
      return 'Each resize copies everything it holds: ' + parts.join(' + ') + ' = ' + c.expect + '. The sizes double, so the last resize copies about as many as all the earlier ones together, and the total stays below 2n = ' + (2 * c.n) + '.';
    }
  });
}

/* ---------- Widget: growth policies ---------- */
function mountPolicy() {
  var w = $('#policy'); if (!w) return;
  var tabs = $('.extabs', w), slider = $('#poN'), lbl = $('#poNv'), plot = $('#poPlot'), cards = $('#poCards'), note = $('#poNote');
  var cur = 0, runs = DA_POLICIES.map(function (p) { return daRun(DA_MAXN, p); });
  var ymax = Math.max.apply(null, runs.map(function (r) { return Math.max.apply(null, r.series); }));
  function path(r, W, H) {
    var d = '', step = 4;
    for (var k = 1; k <= DA_MAXN; k += step) d += (d ? 'L' : 'M') + (W * k / DA_MAXN).toFixed(1) + ' ' + (H - H * r.series[k - 1] / ymax).toFixed(1);
    return d;
  }
  function card(k, v, sub) { return '<div class="cm-card"><span class="cm-k">' + k + '</span><span class="cm-v">' + v + '</span><span class="cm-sub">' + sub + '</span></div>'; }
  function render() {
    var n = +slider.value, r = daRun(n, DA_POLICIES[cur]), W = 560, H = 140;
    lbl.textContent = n;
    tabs.querySelectorAll('button').forEach(function (b, k) { b.setAttribute('aria-pressed', k === cur); });
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Copies per append as the number of appends grows, for each growth policy. The selected policy is drawn heavier.">';
    DA_POLICIES.forEach(function (p, k) { if (k !== cur) svg += '<path class="po-other" d="' + path(runs[k], W, H) + '"/>'; });
    svg += '<path class="po-cur" d="' + path(runs[cur], W, H) + '"/><line class="po-n" x1="' + (W * n / DA_MAXN).toFixed(1) + '" x2="' + (W * n / DA_MAXN).toFixed(1) + '" y1="0" y2="' + H + '"/></svg>';
    plot.innerHTML = svg;
    cards.innerHTML = card('Total copies', fmt(r.copies), count(r.resizes, 'resize', 'resizes')) +
      card('Copies per append', (Math.round(r.copies / n * 100) / 100).toString(), 'total copies divided by n') +
      card('Most slack', Math.round(r.peak * 100) + '%', 'largest share of the block left unused') +
      card('Final capacity', fmt(r.cap), 'for ' + n + ' values');
    note.innerHTML = 'Top of the plot: ' + (Math.round(ymax * 10) / 10) + ' copies per append. ' + (DA_POLICIES[cur].f ?
      'A factor keeps the curve flat: it climbs a little, then stops.' : 'A fixed step keeps climbing with n: the bigger the array, the more each resize copies, and resizes never get rarer.');
  }
  DA_POLICIES.forEach(function (p, k) { var b = el('button', 'tab', p.name); b.type = 'button'; b.addEventListener('click', function () { cur = k; render(); }); tabs.appendChild(b); });
  slider.addEventListener('input', render); render();
}

/* ---------- Widget: eager against lazy shrinking ---------- */
function mountThrash() {
  var w = $('#thrash'); if (!w) return;
  var tabs = $('.extabs', w), slider = $('#thN'), lbl = $('#thNv'), bars = $('#thBars'), cards = $('#thCards');
  var eager = true;
  function card(k, v, sub) { return '<div class="cm-card"><span class="cm-k">' + k + '</span><span class="cm-v">' + v + '</span><span class="cm-sub">' + sub + '</span></div>'; }
  function render() {
    var ops = +slider.value, r = daThrash(eager, ops), mx = 64;
    lbl.textContent = ops;
    tabs.querySelectorAll('button').forEach(function (b, k) { b.setAttribute('aria-pressed', (k === 0) === eager); });
    bars.innerHTML = r.per.map(function (c, k) { return '<i class="' + (k % 2 ? 'op-p' : 'op-a') + (c ? ' cp' : '') + '" style="height:' + Math.max(3, 56 * c / mx).toFixed(0) + 'px" title="op ' + (k + 1) + ': ' + c + ' copied"></i>'; }).join('');
    cards.innerHTML = card('Elements copied', fmt(r.total), count(ops, 'operation', 'operations') + ', append then pop, around a full block') +
      card('Per operation', (Math.round(r.total / ops * 10) / 10).toString(), eager ? 'every one pays a full copy' : 'only the first append pays');
  }
  [['Shrink at half full', true], ['Shrink at a quarter full', false]].forEach(function (t) { var b = el('button', 'tab', t[0]); b.type = 'button'; b.addEventListener('click', function () { eager = t[1]; render(); }); tabs.appendChild(b); });
  slider.addEventListener('input', render); render();
}

function mountPage() {
  readPal();
  mountLesson();
  mountHeroBars();
  mountPredictCopies();
  var g = $('#grow');
  if (g) {
    mountLaneTabs(g, [
      { name: 'Five appends', steps: daGrowSteps },
      { name: 'Insert in the middle', steps: daInsertSteps },
      { name: 'Pop at the end', steps: daPopSteps }
    ], { id: 'gr', inv: DA_INV });
  }
  mountPolicy();
  mountThrash();
  if (typeof kinetic === 'function') kinetic();
  if (typeof riseIn === 'function') riseIn();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountPage);
  else mountPage();
}
