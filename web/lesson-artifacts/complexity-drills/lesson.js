/* ================= Complexity Drills: lesson.js =================
   Six practice drills with counted operations at three n values and fitted classes.
   Counts verified in PURE block and asserted by check.py in both runtimes.
*/

/* PURE:begin (no DOM below this line until PURE:end) */
function countDrill1(n) {
  return 2 * n;
}

function countDrill2(n) {
  return (n * (n - 1)) / 2;
}

function countDrill3(n) {
  var count = 0;
  for (var i = n; i > 1; i = Math.floor(i / 2)) {
    for (var k = 0; k < n; k++) count++;
  }
  return count;
}

function countDrill4(n) {
  // Each iteration copies n - 1 items in slice and scans n - 1 items in membership check
  return n * (2 * (n - 1));
}

function countDrill5(n) {
  var calls = 0;
  function f(x) {
    calls++;
    if (x <= 1) return 1;
    return f(Math.floor(x / 2)) + f(Math.floor(x / 2));
  }
  f(n);
  return calls;
}

function countDrill6(n) {
  return n * n;
}

var DRILLS = [
  {
    id: 1,
    title: 'Drill 1: Two sequential loops',
    time: 'O(n)',
    space: 'O(1)',
    ns: [10, 20, 40],
    counts: [countDrill1(10), countDrill1(20), countDrill1(40)],
    ratio: (countDrill1(40) / countDrill1(20)).toFixed(1) + 'x',
    why: 'Two sequential passes add: n + n = 2n iterations (ratio 2.0x). One scalar variable total: O(1) space.'
  },
  {
    id: 2,
    title: 'Drill 2: Triangular dependent bounds',
    time: 'O(n²)',
    space: 'O(1) aux',
    ns: [10, 20, 40],
    counts: [countDrill2(10), countDrill2(20), countDrill2(40)],
    ratio: (countDrill2(40) / countDrill2(20)).toFixed(1) + 'x',
    why: 'Inner loop runs j from i+1 to n: total comparisons n(n - 1) / 2 (ratio ~4.1x). Quadratic O(n²) time.'
  },
  {
    id: 3,
    title: 'Drill 3: Halving outer with full inner',
    time: 'O(n log n)',
    space: 'O(1)',
    ns: [16, 32, 64],
    counts: [countDrill3(16), countDrill3(32), countDrill3(64)],
    ratio: (countDrill3(64) / countDrill3(32)).toFixed(1) + 'x',
    why: 'Outer loop halves i across log₂ n steps; inner loop runs n steps each time: n · log₂ n iterations.'
  },
  {
    id: 4,
    title: 'Drill 4: Hidden slice and scan in body',
    time: 'O(n²)',
    space: 'O(n)',
    ns: [10, 20, 40],
    counts: [countDrill4(10), countDrill4(20), countDrill4(40)],
    ratio: (countDrill4(40) / countDrill4(20)).toFixed(1) + 'x',
    why: 'The slice copies n - 1 items and the membership scan reads n - 1 items per outer step: 2n(n - 1) work (ratio ~4.1x).'
  },
  {
    id: 5,
    title: 'Drill 5: Branching twice and halving',
    time: 'O(n)',
    space: 'O(log n)',
    ns: [16, 32, 64],
    counts: [countDrill5(16), countDrill5(32), countDrill5(64)],
    ratio: (countDrill5(64) / countDrill5(32)).toFixed(1) + 'x',
    why: 'Doubling width per level down log₂ n levels produces ~2^(log₂ n) = n total leaf calls (ratio 2.0x). Stack depth log₂ n.'
  },
  {
    id: 6,
    title: 'Drill 6: Full n × n matrix traversal',
    time: 'O(n²)',
    space: 'O(1)',
    ns: [10, 20, 40],
    counts: [countDrill6(10), countDrill6(20), countDrill6(40)],
    ratio: (countDrill6(40) / countDrill6(20)).toFixed(1) + 'x',
    why: 'Touching every cell of an n × n matrix visits n² cells (ratio 4.0x). Linear in the number of elements N = n².'
  }
];

var FACTS = {
  d1_c10: DRILLS[0].counts[0],
  d1_c20: DRILLS[0].counts[1],
  d1_c40: DRILLS[0].counts[2],
  d2_c10: DRILLS[1].counts[0],
  d2_c20: DRILLS[1].counts[1],
  d2_c40: DRILLS[1].counts[2],
  d3_c16: DRILLS[2].counts[0],
  d3_c32: DRILLS[2].counts[1],
  d3_c64: DRILLS[2].counts[2],
  d4_c10: DRILLS[3].counts[0],
  d4_c20: DRILLS[3].counts[1],
  d4_c40: DRILLS[3].counts[2],
  d5_c16: DRILLS[4].counts[0],
  d5_c32: DRILLS[4].counts[1],
  d5_c64: DRILLS[4].counts[2],
  d6_c10: DRILLS[5].counts[0],
  d6_c20: DRILLS[5].counts[1],
  d6_c40: DRILLS[5].counts[2]
};
/* PURE:end */

function mountDrills() {
  DRILLS.forEach(function(d) {
    var card = $('#drill-card-' + d.id);
    if (!card) return;

    var btnReveal = card.querySelector('.btn-reveal');
    var revealArea = card.querySelector('.drill-reveal-area');
    var badge = card.querySelector('.drill-badge');
    var opts = card.querySelectorAll('.drill-opt');

    opts.forEach(function(opt) {
      opt.addEventListener('click', function() {
        opts.forEach(function(o) { o.setAttribute('aria-pressed', 'false'); });
        opt.setAttribute('aria-pressed', 'true');
      });
    });

    if (btnReveal && revealArea) {
      btnReveal.addEventListener('click', function() {
        var isOpen = revealArea.style.display !== 'none';
        revealArea.style.display = isOpen ? 'none' : 'block';
        btnReveal.setAttribute('aria-expanded', !isOpen);
        btnReveal.textContent = isOpen ? 'Show counted operations' : 'Hide details';
        if (badge) badge.className = 'drill-badge revealed';
      });
    }
  });
}

function mountHero() {
  var svg = $('#heroDrills');
  if (!svg) return;
  var num = $('#heroNum');
  var cap = $('#heroCap');

  var drillsList = [
    { n: 1, text: 'Drill 1: O(n) — sequential passes add' },
    { n: 2, text: 'Drill 2: O(n²) — handshake loop steps' },
    { n: 3, text: 'Drill 3: O(n log n) — halving outer loop' },
    { n: 4, text: 'Drill 4: O(n²) — body slice hides work' },
    { n: 5, text: 'Drill 5: O(n) — branch twice halving depth' },
    { n: 6, text: 'Drill 6: O(n²) — full n × n matrix cells' }
  ];

  function drawHero(idx) {
    svg.innerHTML = '';
    var d = drillsList[idx];
    if (num) num.textContent = d.n;
    if (cap) cap.textContent = d.text;

    S('text', { x: 280, y: 24, class: 'ha-muted', 'text-anchor': 'middle' }, svg).textContent =
      'Six scenarios to test time and space intuition';

    // Draw 6 cards in a 2x3 grid
    var cardW = 150, cardH = 75, gapX = 20, gapY = 14;
    var startX = 35, startY = 44;

    for (var i = 0; i < 6; i++) {
      var col = i % 3;
      var row = Math.floor(i / 3);
      var x = startX + col * (cardW + gapX);
      var y = startY + row * (cardH + gapY);
      var isActive = (i === idx);

      S('rect', { x: x, y: y, width: cardW, height: cardH, class: 'ha-card' + (isActive ? ' active' : '') }, svg);
      var t1 = S('text', { x: x + cardW / 2, y: y + 26, class: 'ha-text', style: 'font-size:11px' }, svg);
      t1.textContent = 'Drill ' + (i + 1);

      var t2 = S('text', { x: x + cardW / 2, y: y + 50, class: 'ha-text', style: 'font-weight:700' }, svg);
      t2.textContent = DRILLS[i].time;
    }
  }

  if (reduce || !M || !M.animate) {
    drawHero(0);
    return;
  }

  var cur = -1;
  M.animate(0, 6, {
    duration: 6 * 1.5,
    ease: 'linear',
    repeat: Infinity,
    onUpdate: function(v) {
      var s = Math.min(5, Math.floor(v));
      if (s !== cur) {
        cur = s;
        drawHero(cur);
      }
    }
  });
}

(function() {
  readPal();
  mountLesson();
  mountDrills();
  mountHero();
  kinetic();
  riseIn();
})();
