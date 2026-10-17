/* ================= Big O Notation, Precisely: the lesson =================
   Big O formalizes asymptotic growth as an upper-bound budget ceiling.
   (c, n0) witnesses that past threshold n0, f(n) <= c * g(n).
   Every number the page shows is computed in the PURE block below and verified by check.py. */

/* PURE:begin (no DOM below this line until PURE:end) */
var G_FUNCS = {
  '1': function() { return 1; },
  'logn': function(n) { return Math.log2(Math.max(1, n)); },
  'n': function(n) { return n; },
  'nlogn': function(n) { return n * Math.log2(Math.max(1, n)); },
  'n2': function(n) { return n * n; },
  '2n': function(n) { return Math.pow(2, n); }
};

function evalPoly(coeffs, n) {
  var val = 0;
  for (var i = 0; i < coeffs.length; i++) {
    val = val * n + coeffs[i];
  }
  return val;
}

function isWitness(fCoeffs, g, c, n0, nMax) {
  if (c <= 0 || n0 < 0 || n0 > nMax) return false;
  var gFn = typeof g === 'function' ? g : G_FUNCS[g];
  for (var n = n0; n <= nMax; n++) {
    if (evalPoly(fCoeffs, n) > c * gFn(n)) {
      return false;
    }
  }
  return true;
}

/* The smallest threshold from which c * g(n) stays above f(n) through nMax:
   the page's n0 values come from here, never typed. */
function minimalN0(fCoeffs, g, c, nMax) {
  for (var n0 = 1; n0 <= nMax; n0++) {
    if (isWitness(fCoeffs, g, c, n0, nMax)) return n0;
  }
  return -1;
}

var PLOT_MAX = 30;

/* Each preset carries the bound and multiplier it is shown with; its n0 is computed. */
var F_PRESETS = [
  { id: 'f2', name: '3n² + 10n + 50', coeffs: [3, 10, 50], degree: 2, g: 'n2', c: 4 },
  { id: 'f1', name: '3n + 20', coeffs: [3, 20], degree: 1, g: 'n', c: 4 },
  { id: 'f3', name: '2n + 100', coeffs: [2, 100], degree: 1, g: 'n', c: 6 }
];
F_PRESETS.forEach(function(f) { f.n0 = minimalN0(f.coeffs, f.g, f.c, PLOT_MAX); });

var G_CANDIDATES = [
  { id: 'n2', label: 'g(n) = n²', name: 'n²', degree: 2 },
  { id: 'n', label: 'g(n) = n', name: 'n', degree: 1 },
  { id: 'logn', label: 'g(n) = log₂ n', name: 'log n', degree: 0 }
];

/* The camp: ceiling 4n² from COOKIE.n0, floor 3n² from n = 1. */
var COOKIE = { coeffs: [3, 10, 50], c: 4, floorC: 3 };
COOKIE.n0 = minimalN0(COOKIE.coeffs, 'n2', COOKIE.c, 1000);
/* PURE:end */

/* ---------- 1. Witness Explorer Widget ---------- */
function mountWitnessExplorer(host) {
  if (!host) return;
  var fTabs = host.querySelector('#fTabs');
  var gTabs = host.querySelector('#gTabs');
  var cSlider = host.querySelector('#cSlider');
  var cVal = host.querySelector('#cVal');
  var n0Slider = host.querySelector('#n0Slider');
  var n0Val = host.querySelector('#n0Val');
  var verdictBox = host.querySelector('#verdictBox');
  var svg = host.querySelector('#witnessSvg');

  var currentFIdx = 0;
  var currentGIdx = 0;
  var currentC = F_PRESETS[0].c;
  var currentN0 = F_PRESETS[0].n0;
  cSlider.value = currentC;
  n0Slider.value = currentN0;

  F_PRESETS.forEach(function(f, idx) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tab';
    b.setAttribute('aria-pressed', idx === 0 ? 'true' : 'false');
    b.textContent = f.name;
    b.addEventListener('click', function() {
      fTabs.querySelectorAll('button').forEach(function(btn, k) {
        btn.setAttribute('aria-pressed', k === idx ? 'true' : 'false');
      });
      currentFIdx = idx;
      currentC = f.c; currentN0 = f.n0;
      currentGIdx = G_CANDIDATES.map(function(g) { return g.id; }).indexOf(f.g);
      gTabs.querySelectorAll('button').forEach(function(btn, k) {
        btn.setAttribute('aria-pressed', k === currentGIdx ? 'true' : 'false');
      });
      cSlider.value = currentC;
      n0Slider.value = currentN0;
      render();
    });
    fTabs.appendChild(b);
  });

  G_CANDIDATES.forEach(function(g, idx) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tab';
    b.setAttribute('aria-pressed', idx === 0 ? 'true' : 'false');
    b.textContent = g.label;
    b.addEventListener('click', function() {
      gTabs.querySelectorAll('button').forEach(function(btn, k) {
        btn.setAttribute('aria-pressed', k === idx ? 'true' : 'false');
      });
      currentGIdx = idx;
      render();
    });
    gTabs.appendChild(b);
  });

  cSlider.addEventListener('input', function() {
    currentC = parseFloat(cSlider.value);
    render();
  });

  n0Slider.addEventListener('input', function() {
    currentN0 = parseInt(n0Slider.value, 10);
    render();
  });

  function render() {
    cVal.textContent = currentC;
    n0Val.textContent = currentN0;

    var curF = F_PRESETS[currentFIdx];
    var curG = G_CANDIDATES[currentGIdx];
    var maxN = PLOT_MAX;

    // Evaluate witness over plotted range
    var valid = true;
    var firstViolation = -1;
    for (var n = currentN0; n <= maxN; n++) {
      var fVal = evalPoly(curF.coeffs, n);
      var gVal = currentC * G_FUNCS[curG.id](n);
      if (fVal > gVal) {
        valid = false;
        firstViolation = n;
        break;
      }
    }

    // Verdict text
    var algebraicPossible = curF.degree <= curG.degree;
    if (valid) {
      verdictBox.innerHTML =
        '<div class="verdict-title good">\u2713 Valid witness: (c = ' + currentC + ', n\u2080 = ' + currentN0 + ')</div>' +
        '<div class="verdict-desc">For all n from ' + currentN0 + ' to ' + maxN + ', <b>f(n) \u2264 ' + currentC + ' \u00B7 ' + curG.name + '</b> holds.' +
        (algebraicPossible ? ' Because degree(f) \u2264 degree(g), this upper bound holds out to infinity!' : ' (Finite artifact: polynomial growth exceeds this candidate at larger n).') + '</div>';
    } else {
      var fV = evalPoly(curF.coeffs, firstViolation);
      var gV = +(currentC * G_FUNCS[curG.id](firstViolation)).toFixed(1);
      verdictBox.innerHTML =
        '<div class="verdict-title bad">\u2715 Ceiling violated at n = ' + firstViolation + '</div>' +
        '<div class="verdict-desc">f(' + firstViolation + ') = <b>' + fV + '</b> exceeds ' + currentC + ' \u00B7 g(' + firstViolation + ') = <b>' + gV + '</b>. ' +
        (algebraicPossible ? 'Increase multiplier c or push threshold n\u2080 higher to clear the baseline overhead.' : 'f grows strictly faster than g; no constant c will ever hold as n \u2192 \u221E.') + '</div>';
    }

    // Draw SVG Plot
    drawPlot(curF, curG, currentC, currentN0, maxN);
  }

  function drawPlot(curF, curG, c, n0, maxN) {
    svg.innerHTML = '';
    var W = 560, H = 220;
    var ML = 54, MR = 20, MT = 20, MB = 30;
    var plotW = W - ML - MR;
    var plotH = H - MT - MB;

    // Find y-scale
    var maxY = 0;
    for (var n = 1; n <= maxN; n++) {
      var fVal = evalPoly(curF.coeffs, n);
      var gVal = c * G_FUNCS[curG.id](n);
      if (fVal > maxY) maxY = fVal;
      if (gVal > maxY) maxY = gVal;
    }
    maxY = Math.max(10, maxY * 1.05);

    function mapX(x) { return ML + ((x - 1) / (maxN - 1)) * plotW; }
    function mapY(y) { return MT + plotH - (y / maxY) * plotH; }

    // Shaded region for n >= n0
    var n0X = mapX(n0);
    S('rect', { x: n0X, y: MT, width: ML + plotW - n0X, height: plotH, fill: 'var(--deep)', opacity: '0.6' }, svg);
    S('line', { x1: n0X, y1: MT, x2: n0X, y2: MT + plotH, stroke: 'var(--mut)', 'stroke-dasharray': '3 3', 'stroke-width': '1.4' }, svg);
    S('text', { x: n0X + 4, y: MT + 14, class: 'hd-lab' }, svg).textContent = 'n \u2265 ' + n0;

    // Axes
    S('line', { x1: ML, y1: MT + plotH, x2: ML + plotW, y2: MT + plotH, stroke: 'var(--hair2)', 'stroke-width': '1.4' }, svg);
    S('line', { x1: ML, y1: MT, x2: ML, y2: MT + plotH, stroke: 'var(--hair2)', 'stroke-width': '1.4' }, svg);

    // Ticks
    [1, 10, 20, 30].forEach(function(x) {
      var px = mapX(x);
      S('line', { x1: px, y1: MT + plotH, x2: px, y2: MT + plotH + 5, stroke: 'var(--hair2)' }, svg);
      S('text', { x: px, y: MT + plotH + 18, class: 'hd-lab', 'text-anchor': 'middle' }, svg).textContent = String(x);
    });

    [0, Math.round(maxY / 2), Math.round(maxY)].forEach(function(y) {
      var py = mapY(y);
      S('line', { x1: ML - 5, y1: py, x2: ML, y2: py, stroke: 'var(--hair2)' }, svg);
      S('text', { x: ML - 8, y: py + 4, class: 'hd-lab', 'text-anchor': 'end' }, svg).textContent = String(y);
    });

    // Draw f(n) curve
    var pathF = '';
    for (var i = 1; i <= maxN; i++) {
      var px = mapX(i), py = mapY(evalPoly(curF.coeffs, i));
      pathF += (i === 1 ? 'M ' : ' L ') + px + ' ' + py;
    }
    S('path', { d: pathF, fill: 'none', stroke: 'var(--b-ink)', 'stroke-width': '2.4' }, svg);

    // Draw c * g(n) curve
    var pathG = '';
    for (var j = 1; j <= maxN; j++) {
      var gx = mapX(j), gy = mapY(c * G_FUNCS[curG.id](j));
      pathG += (j === 1 ? 'M ' : ' L ') + gx + ' ' + gy;
    }
    S('path', { d: pathG, fill: 'none', stroke: 'var(--o-ink)', 'stroke-width': '2.2', 'stroke-dasharray': '5 3' }, svg);

    // Markers on n >= n0
    for (var k = n0; k <= maxN; k += 2) {
      var mx = mapX(k);
      var myF = mapY(evalPoly(curF.coeffs, k));
      var myG = mapY(c * G_FUNCS[curG.id](k));
      var ok = evalPoly(curF.coeffs, k) <= c * G_FUNCS[curG.id](k);
      S('circle', { cx: mx, cy: myG, r: 3, fill: ok ? 'var(--g-ink)' : 'var(--r-ink)' }, svg);
    }
  }

  render();
}

/* ---------- 2. Three Bounds Widget (O, Omega, Theta) ---------- */
function mountThreeBounds(host) {
  if (!host) return;
  var tabs = host.querySelectorAll('.bounds-stage .extabs button');
  var bName = host.querySelector('#boundName');
  var bBadge = host.querySelector('#boundBadge');
  var bMath = host.querySelector('#boundMath');
  var bDesc = host.querySelector('#boundDesc');
  var svg = host.querySelector('#boundsSvg');

  var PANELS = [
    {
      name: 'Big O (Upper Bound / Ceiling)',
      badge: 'Guaranteed Ceiling',
      math: 'f(n) \u2264 c\u2081 \u00B7 g(n)  for all n \u2265 n\u2080  \u2192  3n\u00B2 + 10n + 50 \u2264 ' + COOKIE.c + 'n\u00B2 (for n \u2265 ' + COOKIE.n0 + ')',
      desc: 'Big O guarantees that the cost grows <b>no faster than g(n)</b>. Pick c\u2081 = ' + COOKIE.c + ', n\u2080 = ' + COOKIE.n0 + ': from that camp size on, the kitchen always bakes enough.'
    },
    {
      name: 'Big \u03A9 (Lower Bound / Floor)',
      badge: 'Guaranteed Floor',
      math: 'f(n) \u2265 c\u2082 \u00B7 g(n)  for all n \u2265 n\u2080  \u2192  3n\u00B2 + 10n + 50 \u2265 ' + COOKIE.floorC + 'n\u00B2 (for n \u2265 1)',
      desc: 'Big \u03A9 guarantees that the cost grows <b>at least as fast as g(n)</b>. Pick c\u2082 = ' + COOKIE.floorC + ', n\u2080 = 1: since 10n + 50 > 0, the camp will always require at least 3n\u00B2 cookies.'
    },
    {
      name: 'Big \u0398 (Tight Bound / Sandwich)',
      badge: 'Exact Growth Rate',
      math: 'c\u2082 \u00B7 g(n) \u2264 f(n) \u2264 c\u2081 \u00B7 g(n)  \u2192  ' + COOKIE.floorC + 'n\u00B2 \u2264 3n\u00B2 + 10n + 50 \u2264 ' + COOKIE.c + 'n\u00B2 (for n \u2265 ' + COOKIE.n0 + ')',
      desc: 'Big \u0398 sandwiches f(n) between constant multiples of g(n). It means f(n) scales at <b>exactly the quadratic rate</b>: neither faster nor slower.'
    }
  ];

  function drawBound(idx) {
    var p = PANELS[idx];
    bName.textContent = p.name;
    bBadge.textContent = p.badge;
    bMath.textContent = p.math;
    bDesc.innerHTML = p.desc;

    svg.innerHTML = '';
    var W = 560, H = 200, ML = 54, MR = 20, MT = 20, MB = 30;
    var plotW = W - ML - MR, plotH = H - MT - MB;
    var maxN = 25, maxY = COOKIE.c * maxN * maxN;

    function mapX(x) { return ML + ((x - 1) / (maxN - 1)) * plotW; }
    function mapY(y) { return MT + plotH - (y / maxY) * plotH; }

    // Axes
    S('line', { x1: ML, y1: MT + plotH, x2: ML + plotW, y2: MT + plotH, stroke: 'var(--hair2)' }, svg);
    S('line', { x1: ML, y1: MT, x2: ML, y2: MT + plotH, stroke: 'var(--hair2)' }, svg);

    // Curve f(n)
    var pathF = '';
    for (var i = 1; i <= maxN; i++) {
      pathF += (i === 1 ? 'M ' : ' L ') + mapX(i) + ' ' + mapY(evalPoly(COOKIE.coeffs, i));
    }
    S('path', { d: pathF, fill: 'none', stroke: 'var(--b-ink)', 'stroke-width': '2.6' }, svg);

    if (idx === 0 || idx === 2) {
      // Ceiling 4n^2
      var pathO = '';
      for (var j = 1; j <= maxN; j++) {
        pathO += (j === 1 ? 'M ' : ' L ') + mapX(j) + ' ' + mapY(COOKIE.c * j * j);
      }
      S('path', { d: pathO, fill: 'none', stroke: 'var(--o-ink)', 'stroke-width': '2', 'stroke-dasharray': '5 3' }, svg);
    }

    if (idx === 1 || idx === 2) {
      // Floor 3n^2
      var pathOmega = '';
      for (var k = 1; k <= maxN; k++) {
        pathOmega += (k === 1 ? 'M ' : ' L ') + mapX(k) + ' ' + mapY(COOKIE.floorC * k * k);
      }
      S('path', { d: pathOmega, fill: 'none', stroke: 'var(--g-ink)', 'stroke-width': '2', 'stroke-dasharray': '3 3' }, svg);
    }

    if (idx === 0 || idx === 2) {
      var n14X = mapX(COOKIE.n0);
      S('line', { x1: n14X, y1: MT, x2: n14X, y2: MT + plotH, stroke: 'var(--mut)', 'stroke-dasharray': '2 2' }, svg);
      S('text', { x: n14X + 4, y: MT + 14, class: 'hd-lab' }, svg).textContent = 'n\u2080 = ' + COOKIE.n0;
    }
  }

  tabs.forEach(function(btn, k) {
    btn.addEventListener('click', function() {
      tabs.forEach(function(b, j) {
        b.setAttribute('aria-pressed', j === k ? 'true' : 'false');
      });
      drawBound(k);
    });
  });

  drawBound(0);
}

/* ---------- 3. Hero Animation ---------- */
function mountHero() {
  var svg = document.getElementById('heroCeiling');
  if (!svg) return;
  var num = document.getElementById('heroNum');
  var unit = document.getElementById('heroUnit');
  var cap = document.getElementById('heroCap');

  var W = 560, H = 160, ML = 60, MR = 20, MT = 24, MB = 32;
  var plotW = W - ML - MR, plotH = H - MT - MB;
  var maxN = 25, maxY = COOKIE.c * maxN * maxN;

  function mapX(x) { return ML + ((x - 1) / (maxN - 1)) * plotW; }
  function mapY(y) { return MT + plotH - (y / maxY) * plotH; }

  S('text', { x: 280, y: 16, class: 'hd-lab', 'text-anchor': 'middle' }, svg).textContent =
    'f(n) = 3n² + 10n + 50  bounded above by ' + COOKIE.c + 'n² from n₀ = ' + COOKIE.n0 + ' onward';

  // Axes
  S('line', { x1: ML, y1: MT + plotH, x2: ML + plotW, y2: MT + plotH, stroke: 'var(--hair2)' }, svg);
  S('line', { x1: ML, y1: MT, x2: ML, y2: MT + plotH, stroke: 'var(--hair2)' }, svg);

  // Curves
  var pathF = '', pathG = '';
  for (var i = 1; i <= maxN; i++) {
    pathF += (i === 1 ? 'M ' : ' L ') + mapX(i) + ' ' + mapY(evalPoly(COOKIE.coeffs, i));
    pathG += (i === 1 ? 'M ' : ' L ') + mapX(i) + ' ' + mapY(COOKIE.c * i * i);
  }
  S('path', { d: pathF, fill: 'none', stroke: 'var(--b-ink)', 'stroke-width': '2.4' }, svg);
  S('path', { d: pathG, fill: 'none', stroke: 'var(--o-ink)', 'stroke-width': '2.2', 'stroke-dasharray': '5 3' }, svg);

  // Probe marker
  var marker = S('circle', { cx: mapX(COOKIE.n0), cy: mapY(COOKIE.c * COOKIE.n0 * COOKIE.n0), r: 4, fill: 'var(--g-ink)' }, svg);

  function showFrame(nVal) {
    var curN = Math.max(1, Math.min(25, nVal));
    var fV = evalPoly(COOKIE.coeffs, curN);
    var gV = COOKIE.c * curN * curN;
    var ok = fV <= gV;

    marker.setAttribute('cx', mapX(curN));
    marker.setAttribute('cy', mapY(gV));
    marker.setAttribute('fill', ok ? 'var(--g-ink)' : 'var(--r-ink)');

    if (num) num.textContent = curN;
    if (unit) unit.textContent = ok ? 'cabins: ceiling holds (c·g \u2265 f)' : 'cabins: baseline dominates (c·g < f)';
  }

  if (cap) cap.textContent = 'From n = ' + COOKIE.n0 + ' on, ' + COOKIE.c + 'n\u00B2 stays above 3n\u00B2 + 10n + 50 for every larger camp.';
  showFrame(COOKIE.n0);

  if (reduce || !M || !M.animate) {
    return;
  }

  var last = -1;
  M.animate(1, 25, {
    duration: 6,
    ease: 'linear',
    repeat: Infinity,
    onUpdate: function(v) {
      var s = Math.round(v);
      if (s !== last) {
        last = s;
        showFrame(s);
      }
    }
  });
}

/* ---------- Assemble Page ---------- */
(function() {
  readPal();
  mountLesson();
  mountWitnessExplorer(document.getElementById('witnessExplorer'));
  mountThreeBounds(document.getElementById('threeBounds'));
  mountHero();
  kinetic();
  riseIn();
})();
