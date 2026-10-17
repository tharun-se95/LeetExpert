/* ================= Analyzing Loops & API Complexity =================
   Counting iterations when loops do not step by one:
     A (i doubles): logarithmic O(log n)
     B (two sequential loops): additive O(n) + O(n) = O(n)
     C (nested dependent bound j < i): triangular sum n(n-1)/2 = O(n^2)
   Pricing hidden library calls honestly: O(len) scan in 'x in list'.
   Every number is computed in the PURE block below. */

/* PURE:begin (no DOM below this line until PURE:end) */
function countLoopIterations(shape, n) {
  var count = 0;
  if (shape === 'doubling') {
    var i = 1;
    while (i < n) {
      count++;
      i *= 2;
    }
  } else if (shape === 'sequential') {
    for (var a = 0; a < n; a++) count++;
    for (var b = 0; b < n; b++) count++;
  } else if (shape === 'dependent') {
    for (var p = 0; p < n; p++) {
      for (var q = 0; q < p; q++) {
        count++;
      }
    }
  }
  return count;
}

function closedFormValue(shape, n) {
  if (shape === 'doubling') {
    if (n <= 1) return 0;
    return Math.ceil(Math.log2(n));
  } else if (shape === 'sequential') {
    return 2 * n;
  } else if (shape === 'dependent') {
    return Math.floor(n * (n - 1) / 2);
  }
  return 0;
}

var SHAPE_TESTS = {
  doubling16: countLoopIterations('doubling', 16),
  seq16: countLoopIterations('sequential', 16),
  dep16: countLoopIterations('dependent', 16)
};

var DEDUPE_STATS = {
  n100_set: 100,
  n100_list: Math.floor(100 * 99 / 2)
};

var FACTS = {
  doubling16: SHAPE_TESTS.doubling16,
  seq16: SHAPE_TESTS.seq16,
  dep16: SHAPE_TESTS.dep16,
  quad100: DEDUPE_STATS.n100_list
};
/* PURE:end */

/* ---------- 1. Loop shapes live model ---------- */
function mountLoopShapes(host) {
  if (!host) return;
  var tabsHost = host.querySelector('.extabs');
  var slider = host.querySelector('#loopN');
  var nVal = host.querySelector('#nVal');
  var countedVal = host.querySelector('#countedVal');
  var formulaLabel = host.querySelector('#formulaLabel');
  var closedVal = host.querySelector('#closedVal');
  var matchVerdict = host.querySelector('#matchVerdict');
  var traceBox = host.querySelector('#loopTrace');

  var SHAPES = [
    {
      id: 'doubling',
      name: 'Loop A: i doubles (while i < n)',
      formula: '\u2308log\u2082 n\u2309',
      complexity: 'O(log n)',
      trace: function(n) {
        if (n <= 1) return 'i = 1 (exits immediately, 0 iterations)';
        var vals = [], i = 1;
        while (i < n) { vals.push(i); i *= 2; }
        return 'Sequence of i values: [' + vals.join(', ') + '] \u2192 ' + vals.length + ' doublings';
      }
    },
    {
      id: 'sequential',
      name: 'Loop B: two sequential loops',
      formula: '2n',
      complexity: 'O(n)',
      trace: function(n) {
        return 'First loop: ' + n + ' iterations + Second loop: ' + n + ' iterations = ' + (2 * n) + ' total';
      }
    },
    {
      id: 'dependent',
      name: 'Loop C: nested dependent bound (j < i)',
      formula: 'n(n \u2212 1) / 2',
      complexity: 'O(n\u00B2)',
      trace: function(n) {
        if (n <= 1) return 'No pairs for n \u2264 1';
        return 'Triangular sum: 0 + 1 + 2 + \u2026 + ' + (n - 1) + ' = ' + Math.floor(n * (n - 1) / 2) + ' iterations';
      }
    }
  ];

  var currentShape = SHAPES[0];

  function update() {
    var n = parseInt(slider.value, 10);
    nVal.textContent = n;

    var counted = countLoopIterations(currentShape.id, n);
    var closed = closedFormValue(currentShape.id, n);

    countedVal.textContent = counted + ' iterations';
    formulaLabel.textContent = currentShape.formula;
    closedVal.textContent = closed + ' (' + currentShape.complexity + ')';

    if (counted === closed) {
      matchVerdict.textContent = '\u2713 Equal: ' + counted + ' == ' + closed;
      matchVerdict.className = 'stat-val good';
    } else {
      matchVerdict.textContent = '\u2717 Discrepancy: ' + counted + ' != ' + closed;
      matchVerdict.className = 'stat-val bad';
    }

    traceBox.textContent = currentShape.trace(n);
  }

  SHAPES.forEach(function(s, idx) {
    var btn = el('button', 'tab', s.name);
    btn.type = 'button';
    btn.setAttribute('aria-pressed', idx === 0 ? 'true' : 'false');
    btn.addEventListener('click', function() {
      tabsHost.querySelectorAll('button').forEach(function(b, k) {
        b.setAttribute('aria-pressed', k === idx ? 'true' : 'false');
      });
      currentShape = s;
      update();
    });
    tabsHost.appendChild(btn);
  });

  slider.addEventListener('input', update);
  update();
}

/* ---------- 2. API Pricing widget ---------- */
function mountApiPricing(host) {
  if (!host) return;
  var tabsHost = host.querySelector('.extabs');
  var setCost = host.querySelector('#setCost');
  var listCost = host.querySelector('#listCost');
  var ratioBadge = host.querySelector('#ratioBadge');

  var SIZES = [10, 50, 100, 200, 500];

  function updateSize(n) {
    var sCost = n;
    var lCost = Math.floor(n * (n - 1) / 2);
    setCost.textContent = sCost + ' ops (O(n))';
    listCost.textContent = lCost.toLocaleString() + ' ops (O(n\u00B2))';

    var ratio = (lCost / sCost).toFixed(1);
    ratioBadge.textContent = 'List membership does ' + ratio + '\u00D7 more work than Set at n = ' + n;
  }

  SIZES.forEach(function(n, idx) {
    var btn = el('button', 'tab', 'n = ' + n);
    btn.type = 'button';
    btn.setAttribute('aria-pressed', idx === 2 ? 'true' : 'false'); // default n = 100
    btn.addEventListener('click', function() {
      tabsHost.querySelectorAll('button').forEach(function(b, k) {
        b.setAttribute('aria-pressed', k === idx ? 'true' : 'false');
      });
      updateSize(n);
    });
    tabsHost.appendChild(btn);
  });

  updateSize(100);
}

/* ---------- Boot wiring ---------- */
(function() {
  mountLesson();
  mountLoopShapes($('#loopShapes'));
  mountApiPricing($('#apiPricing'));
})();

/* ---------- Systems hero: loop counters ---------- */
(function() {
  function heroLoops() {
    var svg = $('#heroLoops');
    if (!svg) return;
    var W = 160, H = 80, Y = 40;

    var shapes = [
      { name: 'i *= 2', cost: 'O(log n)', x: 40, col: 'good' },
      { name: 'Sequential', cost: 'O(n)', x: 210, col: 'accent' },
      { name: 'Nested j < i', cost: 'O(n\u00B2)', x: 380, col: 'bad' }
    ];

    S('text', { x: 280, y: 24, class: 'hd-lab', 'text-anchor': 'middle' }, svg)
      .textContent = 'shape determines growth: multiplicative, sequential, and nested';

    shapes.forEach(function(s) {
      S('rect', { x: s.x, y: Y, width: W, height: H, rx: 8, class: 'hs-prob' }, svg);
      S('text', { x: s.x + W / 2, y: Y + 32, class: 'hs-pt', 'text-anchor': 'middle' }, svg)
        .textContent = s.name;
      S('text', { x: s.x + W / 2, y: Y + 58, class: 'hd-lab', 'text-anchor': 'middle' }, svg)
        .textContent = s.cost;
    });

    var num = $('#heroNum'), unit = $('#heroUnit'), cap = $('#heroCap');
    if (num) num.textContent = '3';
    if (unit) unit.textContent = 'canonical loop shapes';
    if (cap) cap.innerHTML = 'Add sequential loops; multiply nested iterations by body cost.';
  }
  heroLoops();
  kinetic();
  riseIn();
})();
