/* ================= Logarithms & Exponents: the lesson =================
   Live model: filing-cabinet search halving n folders down to 1 card.
   All operation counts, feel-for-the-numbers values, and rule checks are
   derived in the PURE block and re-verified by check.py in Python and Node. */

/* PURE:begin (no DOM below this line until PURE:end) */
function simHalvings(n) {
  var count = 0, curr = n, steps = [curr];
  while (curr > 1) {
    curr = Math.floor(curr / 2);
    count++;
    steps.push(curr);
  }
  return { count: count, probes: count + 1, steps: steps };
}

function log2Floor(n) {
  var count = 0;
  while (n > 1) {
    n = Math.floor(n / 2);
    count++;
  }
  return count;
}

var POWERS_TABLE = [1000, 1000000, 1000000000, 1e12, 1e18].map(function(n) {
  return { n: n, exact: Math.log2(n), halvings: log2Floor(n), probes: log2Floor(n) + 1 };
});

var RULE_CHECKS = {
  product: {
    lhs: Math.round(Math.log2(8 * 4)),
    rhs: Math.round(Math.log2(8) + Math.log2(4))
  },
  power: {
    lhs: Math.round(Math.log2(Math.pow(2, 4))),
    rhs: 4 * Math.round(Math.log2(2))
  },
  changeOfBase: {
    lhs: Math.round(Math.log2(8)),
    rhs: Math.round(Math.log10(8) / Math.log10(2))
  },
  baseSwap: {
    lhs: Math.round(Math.pow(4, Math.log2(8))),
    rhs: Math.round(Math.pow(8, Math.log2(4)))
  }
};

var FACTS = {
  halvings8: simHalvings(8).count,
  probes8: simHalvings(8).probes,
  halvings16: simHalvings(16).count,
  probes16: simHalvings(16).probes,
  halvings32: simHalvings(32).count,
  probes32: simHalvings(32).probes,
  halvings1k: POWERS_TABLE[0].halvings,
  halvings1m: POWERS_TABLE[1].halvings,
  halvings1b: POWERS_TABLE[2].halvings,
  halvings1t: POWERS_TABLE[3].halvings,
  halvings1q: POWERS_TABLE[4].halvings,
  probes1t: POWERS_TABLE[3].probes,
  prodCheck: RULE_CHECKS.product.lhs,
  powerCheck: RULE_CHECKS.power.lhs,
  changeOfBaseCheck: RULE_CHECKS.changeOfBase.lhs,
  baseSwapCheck: RULE_CHECKS.baseSwap.lhs,
  quizAns1: Math.round(Math.log2(1e12))
};
/* PURE:end */

function recorder(M) {
  var steps = [];
  return {
    steps: steps,
    rec: function(note, o) { steps.push(M.snap(note, o)); }
  };
}

function makeHalveSteps(n) {
  var remaining = n, halvings = 0, probes = 1;
  var M = new Lanes([{ id: 'f', kind: 'row', label: 'folders', idx: true }], {
    fields: function() {
      return [
        ['remaining', remaining],
        ['halvings', halvings],
        ['probes', probes],
        ['by formula', Math.floor(Math.log2(n)) + 1]
      ];
    }
  });
  var R = recorder(M);
  for (var i = 0; i < n; i++) M.push('f', i + 1);

  R.rec('The filing cabinet starts with ' + n + ' folders in drawer order. One target card is filed among them.', { done: true });

  var lo = 0, hi = n - 1;
  while (hi > lo) {
    var mid = Math.floor((lo + hi) / 2);
    // Discard the upper half of the remaining active span
    for (var j = mid + 1; j <= hi; j++) {
      M.tone(M.lane('f').items[j], 'dim');
    }
    hi = mid;
    halvings++;
    probes++;
    remaining = hi - lo + 1;
    R.rec('Halving ' + halvings + ': examine middle drawer, discard unneeded half. ' + remaining + ' folder' + (remaining === 1 ? '' : 's') + ' remain.', {
      hi: ['lane:f']
    });
  }

  M.tone(M.lane('f').items[lo], 'good');
  var expectedRounds = Math.floor(Math.log2(n)) + 1;
  R.rec('Target found! Down to 1 folder after exactly ' + halvings + ' halvings (' + probes + ' probes, counting the look at the last folder). Matches ⌊log₂ ' + n + '⌋ + 1 = ' + expectedRounds + '.', {
    hi: [laneHi(M.lane('f').items[lo])],
    done: true
  });

  return R.steps;
}

/* ---------- Hero Art: Filing Cabinet Halving ---------- */
/* Row labels are HTML over the SVG: SVG text inside a scaled viewBox drew at 6px on a phone. */
function mountHeroHalving() {
  var svg = document.getElementById('heroHalving');
  if (!svg) return;
  var W = 560, H = 160;
  var box = document.createElement('div');
  box.className = 'hero-box';
  svg.parentNode.insertBefore(box, svg);
  box.appendChild(svg);
  var h = '';

  var tiers = simHalvings(16).steps;
  var totalWidth = 360, startX = 24, startY = 22, rowH = 18, gapY = 8;

  tiers.forEach(function(count, row) {
    var y = startY + row * (rowH + gapY);
    var itemW = totalWidth / count;
    var isFinal = count === 1;

    for (var i = 0; i < count; i++) {
      var x = startX + i * itemW;
      var active = i === 0;
      var fill = isFinal ? 'var(--good)' : (active ? 'var(--pop)' : 'var(--card-navy)');
      var stroke = isFinal ? 'var(--g-ink)' : (active ? 'var(--mark)' : 'var(--hair2)');
      h += '<rect x="' + (x + 1).toFixed(1) + '" y="' + y + '" width="' + (itemW - 2).toFixed(1) + '" height="' + rowH + '" rx="2" ' +
           'fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.2"/>';
    }

    var lab = document.createElement('span');
    lab.className = 'hero-lab';
    lab.style.left = (100 * (startX + totalWidth + 14) / W).toFixed(2) + '%';
    lab.style.top = (100 * (y + rowH / 2) / H).toFixed(2) + '%';
    lab.textContent = count + (isFinal ? ' (target)' : '');
    box.appendChild(lab);
  });

  svg.innerHTML = h;

  var n0 = tiers[0];
  var num = document.getElementById('heroNum');
  var unit = document.getElementById('heroUnit');
  var cap = document.getElementById('heroCap');
  if (num) num.textContent = String(FACTS.halvings16);
  if (unit) unit.textContent = 'halvings';
  if (cap) cap.innerHTML = n0 + ' folders halved ' + FACTS.halvings16 + ' times reach 1 folder: <b>\u230Alog\u2082 ' + n0 + '\u230B = ' + FACTS.halvings16 + '</b>.';
}

function mountPage() {
  mountLesson();
  mountHeroHalving();
  var w = document.getElementById('halvetabs');
  if (w) {
    mountLaneTabs(w, [
      { name: '8 folders (3 halvings)', steps: function() { return makeHalveSteps(8); } },
      { name: '16 folders (4 halvings)', steps: function() { return makeHalveSteps(16); } },
      { name: '32 folders (5 halvings)', steps: function() { return makeHalveSteps(32); } }
    ], { id: 'hlv' });
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
