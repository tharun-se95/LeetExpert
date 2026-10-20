/* ================= Modular Arithmetic: the lesson =================
   Demonstrates residue rings on an m-clock, the Python vs JavaScript % trap,
   wrap-around indexing, and hash table bucket reductions.
   All numbers are computed by pure simulation re-run in check.py in both Node and Python. */

/* PURE:begin (no DOM below this line until PURE:end) */
function rgSim(a, m) {
  var cell = 0, turns = 0, d = a < 0 ? -1 : 1;
  for (var i = 0; i < Math.abs(a); i++) {
    cell += d;
    if (cell === m) { cell = 0; turns++; }
    else if (cell < 0) { cell = m - 1; turns--; }
  }
  return { cell: cell, turns: turns };
}

function maFloorMod(a, m) {
  return a - m * Math.floor(a / m);
}

function rgJsMod(a, m) {
  return a % m;
}

function rgWalked(s) {
  var r = s.ring;
  return r.rows.every(function(x) {
    if (!x.on) return true;
    var w = rgSim(r.at[x.id], r.T.m);
    return x.cell === w.cell && x.turns === w.turns;
  });
}
var RG_COUNTED = [['counted', 'each cell matches walking one cell at a time from 0', rgWalked]];

function rgClockSteps() {
  var m = 5, a = rgSim(8, m), b = rgSim(-7, m), fix = ((-7 % m) + m) % m;
  if (a.cell !== b.cell || fix !== b.cell) throw new Error('8 and −7 on 5-ring mismatch');
  var T = new RingTrace({
    m: m,
    name: 'slot',
    langs: true,
    tokens: [
      { id: 'p', name: 'delivery 8', tone: 'cur' },
      { id: 'n', name: 'return −7', tone: 'info' }
    ]
  });
  T.step('A carousel of ' + m + ' slots (0 to 4). Both deliveries start at slot 0.', [T.put('p', 0), T.put('n', 0)]);
  T.step('Spin 8 forward: ' + a.turns + ' full turn back to 0, plus ' + a.cell + ' more. 8 = ' + a.turns + ' × ' + m + ' + ' + a.cell + ', landing on slot ' + a.cell + '.', [T.walk('p', 8)], ['p']);
  T.step('Spin 7 backward: past 0 ' + (-b.turns) + ' times (' + b.turns + ' turns), landing on slot ' + b.cell + '. −7 = ' + b.turns + ' × ' + m + ' + ' + b.cell + ': different turns, identical slot.', [T.walk('n', -7)], ['n']);
  return ringWalk(T, {
    intro: 'Where 8 and −7 land on a 5-slot carousel.',
    outro: 'Both 8 and −7 collapse onto slot 3: 8 ≡ −7 (mod 5). Modular reduction discards whole turns and keeps the slot.',
    inv: RG_COUNTED
  });
}

function rgTrapSteps() {
  var m = 5, b = rgSim(-7, m), fix = ((-7 % m) + m) % m;
  var T = new RingTrace({
    m: m,
    name: 'slot',
    langs: true,
    tokens: [
      { id: 'n', name: 'bare -7 % 5', tone: 'bad' },
      { id: 'fix', name: 'shifted fix', tone: 'good' }
    ]
  });
  T.step('Spin backward 7 slots from 0. On a 5-clock, 7 steps backward lands on slot ' + b.cell + '.', [T.put('n', 0)]);
  T.step('Walk backward 7: Python calculates -7 % 5 = ' + maFloorMod(-7, m) + ' (slot ' + b.cell + '). JavaScript calculates -7 % 5 = ' + rgJsMod(-7, m) + ' (not a valid carousel slot!).', [T.walk('n', -7)], ['n']);
  T.step('The fix ((a % m) + m) % m: add 5 to shift the negative remainder into [0, 5), giving slot ' + fix + '.', [T.put('fix', fix)], ['fix']);
  return ringWalk(T, {
    intro: 'The backward-spin trap: Python floors, JavaScript truncates toward zero.',
    outro: 'Never use bare % on negative values in JavaScript. The shifted formula ((a % m) + m) % m produces the true residue in both runtimes.',
    inv: RG_COUNTED
  });
}

function rgWrapSteps() {
  var m = 5, last = rgSim(5, m), back = rgSim(-1, m);
  var T = new RingTrace({
    m: m,
    name: 'index',
    langs: true,
    tokens: [
      { id: 'i', name: 'next index', tone: 'info' },
      { id: 'j', name: 'previous index', tone: 'bad' }
    ]
  });
  T.step('A circular buffer of ' + m + ' cells (0 to 4). Write index i stands at 3.', [T.put('i', 3)], ['i']);
  T.step('(i + 1) % 5 advances forward by 1 cell to index 4, the final slot.', [T.walk('i', 1)], ['i']);
  T.step('One more step forward reaches 5: 5 % 5 = ' + last.cell + '. The pointer falls off the end and cleanly wraps to 0.', [T.walk('i', 1)], ['i']);
  T.step('Step backward from index 0: (0 - 1) % 5. Walking 1 cell backward lands on ' + back.cell + '. Python gives ' + back.cell + '; JavaScript gives ' + rgJsMod(-1, m) + ', an invalid negative index!', [T.put('j', 0), T.walk('j', -1)], ['j']);
  return ringWalk(T, {
    intro: 'Wrap-around indexing: stepping off either end of a circular buffer.',
    outro: 'Stepping past m-1 wraps to 0 in both languages. Stepping back past 0 requires the shifted modulo in JavaScript.',
    inv: RG_COUNTED
  });
}

function rgHashSteps() {
  var m = 7, keys = [15, 22, 40, -8], ids = ['a', 'b', 'c', 'd'], land = keys.map(function(k) { return rgSim(k, m).cell; });
  if (land[0] !== land[1]) throw new Error('15 and 22 should collide mod 7');
  var T = new RingTrace({
    m: m,
    name: 'bucket',
    langs: true,
    tokens: keys.map(function(k, i) {
      return { id: ids[i], name: 'key ' + k };
    })
  });
  T.step('A hash table with ' + m + ' buckets (0 to 6). Each key maps to bucket key mod 7.', ids.map(function(id) { return T.put(id, 0); }));
  T.step('Key 15 = ' + Math.floor(15 / m) + ' × 7 + ' + land[0] + ': walks to bucket ' + land[0] + '.', [T.walk('a', 15)], ['a']);
  T.step('Key 22 = ' + Math.floor(22 / m) + ' × 7 + ' + land[1] + ': also walks to bucket ' + land[1] + '! Two keys share bucket ' + land[0] + ', forming a collision.', [T.walk('b', 22), T.count('collisions', 1)], ['b']);
  T.step('Key 40 = ' + Math.floor(40 / m) + ' × 7 + ' + land[2] + ': walks to bucket ' + land[2] + '.', [T.walk('c', 40)], ['c']);
  T.step('Key -8 walks backward to bucket ' + land[3] + '. In JavaScript, -8 % 7 = ' + rgJsMod(-8, m) + ' (out of bounds). Safe hashing requires floored modulo.', [T.walk('d', -8)], ['d']);
  return ringWalk(T, {
    intro: 'Hash table bucket reduction: keys mapped to buckets mod 7.',
    outro: 'Multiple keys hash to the same bucket when they share a remainder. Negative keys must be floored to avoid negative bucket indices.',
    inv: RG_COUNTED
  });
}

var FACTS = {
  slot8_5: rgSim(8, 5).cell,
  turns8_5: rgSim(8, 5).turns,
  slotNeg7_5: rgSim(-7, 5).cell,
  turnsNeg7_5: rgSim(-7, 5).turns,
  pyNeg7_5: maFloorMod(-7, 5),
  jsNeg7_5: rgJsMod(-7, 5),
  pyWrapPrev: maFloorMod(-1, 5),
  jsBarePrev: rgJsMod(-1, 5),
  fixedPrev: ((-1 % 5) + 5) % 5,
  hashCollisionKey1: 15,
  hashCollisionKey2: 22,
  hashBucket: rgSim(15, 7).cell,
  hashNegKey: -8,
  hashNegBucket: rgSim(-8, 7).cell,
  hashNegJs: rgJsMod(-8, 7),
  safeInt: 9007199254740991,
  quizAns3: maFloorMod(-13, 5)
};
/* PURE:end */

/* ---------- Hero Clock Drawing ---------- */
/* Labels are HTML over the SVG: SVG text inside a scaled viewBox drew at 4-5px on a phone. */
function heroLabel(box, W, H, x, y, text, cls) {
  var el = document.createElement('span');
  el.className = 'hero-lab ' + (cls || '');
  el.style.left = (100 * x / W).toFixed(2) + '%';
  el.style.top = (100 * y / H).toFixed(2) + '%';
  el.textContent = text;
  box.appendChild(el);
}

function mountHeroClock() {
  var svg = document.getElementById('heroClock');
  if (!svg) return;
  var W = 560, H = 160, cx = 280, cy = 80, R = 52, m = 5;
  var target = FACTS.slot8_5;
  var box = document.getElementById('heroBox');
  var h = '';

  h += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="var(--hair2)" stroke-width="2"/>';

  for (var k = 0; k < m; k++) {
    var ang = -Math.PI / 2 + 2 * Math.PI * k / m;
    var x = cx + R * Math.cos(ang);
    var y = cy + R * Math.sin(ang);
    var isTarget = k === target;
    h += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (isTarget ? 15 : 12) + '" ' +
         'fill="' + (isTarget ? 'var(--pop)' : 'var(--card-navy)') + '" ' +
         'stroke="' + (isTarget ? 'var(--mark)' : 'var(--hair2)') + '" stroke-width="' + (isTarget ? 2.5 : 1.5) + '"/>';
    heroLabel(box, W, H, x, y, String(k), isTarget ? 'hero-lab-on' : 'hero-lab-off');
  }

  h += '<path d="M 280 20 A 60 60 0 1 1 230 115" fill="none" stroke="var(--o-ink)" stroke-width="2.2" stroke-dasharray="4 3"/>';
  h += '<path d="M 276 18 A 66 66 0 0 0 226 112" fill="none" stroke="var(--b-ink)" stroke-width="2.2"/>';
  svg.innerHTML = h;

  heroLabel(box, W, H, 440, 80, '8 = ' + FACTS.turns8_5 + '×' + m + ' + ' + FACTS.slot8_5, 'hero-lab-o');
  heroLabel(box, W, H, 120, 80, '−7 = ' + FACTS.turnsNeg7_5 + '×' + m + ' + ' + FACTS.slotNeg7_5, 'hero-lab-b');

  var num = document.getElementById('heroNum');
  var unit = document.getElementById('heroUnit');
  var cap = document.getElementById('heroCap');
  if (num) num.textContent = String(FACTS.slot8_5);
  if (unit) unit.textContent = 'shared carousel slot';
  if (cap) cap.innerHTML = 'Both 8 (' + FACTS.turns8_5 + ' turn) and −7 (' + FACTS.turnsNeg7_5 + ' turns) land on slot ' + FACTS.slot8_5 + ': <b>8 ≡ −7 (mod 5)</b>.';
}

function mountPage() {
  mountLesson();
  mountHeroClock();
  var w = document.getElementById('rgtabs');
  if (w) {
    mountRingTabs(w, [
      { name: '8 and −7 on 5-ring', steps: rgClockSteps },
      { name: 'The backward-spin trap', steps: rgTrapSteps },
      { name: 'Wrap-around indexing', steps: rgWrapSteps },
      { name: 'Hash table buckets', steps: rgHashSteps }
    ], { id: 'rg' });
  }
  if (typeof kinetic === 'function') kinetic();
  if (typeof riseIn === 'function') riseIn();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountPage);
  } else {
    mountPage();
  }
}
