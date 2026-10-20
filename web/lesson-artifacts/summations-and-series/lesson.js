/* ================= Summations & Series: the lesson =================
   Live model: triangular shelf blocks doubled into an n × (n+1) rectangle,
   and doubling/halving geometric series boxes.
   All numbers and formulas are derived in the PURE block and checked in check.py in Python and Node. */

/* PURE:begin (no DOM below this line until PURE:end) */
function simTriangle(n) {
  var sum = 0;
  for (var i = 1; i <= n; i++) sum += i;
  return sum;
}

function simDoubling(k) {
  var sum = 0, term = 1;
  for (var i = 0; i <= k; i++) {
    sum += term;
    term *= 2;
  }
  return sum;
}

function simHalving(n) {
  var sum = 0, curr = n;
  while (curr >= 1) {
    sum += curr;
    curr = Math.floor(curr / 2);
  }
  return sum;
}

function simDependentLoop(n) {
  var count = 0;
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < i; j++) {
      count++;
    }
  }
  return count;
}

function simAppendCopies(n) {
  var cap = 1, size = 0, copies = 0;
  for (var i = 1; i <= n; i++) {
    if (size === cap) {
      copies += size;
      cap *= 2;
    }
    size++;
  }
  return copies;
}

/* Counts the blocks of the n-row staircase and its flipped twin by visiting every cell of the
   n x (n + 1) rectangle: a cell (r, c) belongs to the staircase when c <= r. */
function simTriangleCells(n) {
  var orig = 0, total = 0;
  for (var r = 0; r < n; r++) {
    for (var c = 0; c < n + 1; c++) {
      total++;
      if (c <= r) orig++;
    }
  }
  return { orig: orig, flipped: total - orig, total: total };
}

var FACTS = {
  tri5: simTriangleCells(5).orig,
  rect5: simTriangleCells(5).total,
  twin5: simTriangleCells(5).flipped,
  tri10: simTriangle(10),
  doubling4: simDoubling(4),
  halving32: simHalving(32),
  loop10: simDependentLoop(10),
  copies16: simAppendCopies(16),
  copies17: simAppendCopies(17)
};
/* PURE:end */

/* ---------- Hero Art: Triangular Shelf Doubling ---------- */
/* Labels are HTML over the SVG: SVG text inside a scaled viewBox drew at 6px on a phone. */
function overlayLabel(box, W, H, x, y, text, transform) {
  var el = document.createElement('span');
  el.className = 'ov-lab';
  el.style.left = (100 * x / W).toFixed(2) + '%';
  el.style.top = (100 * y / H).toFixed(2) + '%';
  el.style.transform = transform;
  el.textContent = text;
  box.appendChild(el);
}

function mountHeroTri() {
  var svg = document.getElementById('heroTri');
  if (!svg) return;
  var W = 560, H = 160;
  var n = 5;
  var boxSize = 22, gap = 4;
  var startX = 140, startY = 16;
  var box = document.createElement('div');
  box.className = 'hero-box';
  svg.parentNode.insertBefore(box, svg);
  box.appendChild(svg);
  var h = '';

  for (var r = 0; r < n; r++) {
    for (var c = 0; c < n + 1; c++) {
      var x = startX + c * (boxSize + gap);
      var y = startY + r * (boxSize + gap);
      var isOriginal = c <= r;
      var fill = isOriginal ? 'var(--pop)' : 'var(--card-navy)';
      var stroke = isOriginal ? 'var(--mark)' : 'var(--hair2)';
      h += '<rect x="' + x + '" y="' + y + '" width="' + boxSize + '" height="' + boxSize + '" rx="3" ' +
           'fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.5"/>';
    }
  }
  svg.innerHTML = h;

  overlayLabel(box, W, H, startX - 12, startY + n * (boxSize + gap) / 2, 'n = ' + n, 'translate(-100%, -50%)');
  overlayLabel(box, W, H, startX + (n + 1) * (boxSize + gap) / 2, startY + n * (boxSize + gap) + 12, 'n + 1 = ' + (n + 1), 'translate(-50%, -50%)');

  var cells = simTriangleCells(n);
  var num = document.getElementById('heroNum');
  var unit = document.getElementById('heroUnit');
  var cap = document.getElementById('heroCap');
  if (num) num.textContent = String(FACTS.tri5);
  if (unit) unit.textContent = 'blocks';
  if (cap) cap.innerHTML = 'Staircase ' + cells.orig + ' + twin ' + cells.flipped + ' = ' + n + ' \u00d7 ' + (n + 1) + ' = ' + cells.total + ' blocks, so <b>1 + \u22ef + ' + n + ' = ' + n + ' \u00d7 ' + (n + 1) + ' / 2 = ' + cells.orig + '</b>.';
}

/* ---------- Interactive Triangular Staircase Widget ---------- */
function mountTriWidget() {
  var w = document.getElementById('triWidget');
  if (!w) return;
  var slider = document.getElementById('triSlider');
  var nVal = document.getElementById('triNVal');
  var svg = document.getElementById('triSvg');
  var readout = document.getElementById('triReadout');
  if (!slider || !svg || !readout) return;

  function render() {
    var n = parseInt(slider.value, 10);
    if (nVal) nVal.textContent = String(n);
    var cells = simTriangleCells(n);
    var formula = (n * (n + 1)) / 2;

    var maxBox = 24;
    var boxSize = Math.max(12, Math.min(maxBox, Math.floor(140 / (n + 1))));
    var gap = Math.max(2, Math.floor(boxSize / 6));
    var startX = Math.max(20, Math.floor((480 - (n + 1) * (boxSize + gap)) / 2));
    var startY = Math.max(10, Math.floor((170 - n * (boxSize + gap)) / 2));

    var h = '';
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n + 1; c++) {
        var x = startX + c * (boxSize + gap);
        var y = startY + r * (boxSize + gap);
        var isOriginal = c <= r;
        var fill = isOriginal ? 'var(--pop)' : 'var(--card-navy)';
        var stroke = isOriginal ? 'var(--mark)' : 'var(--hair2)';
        h += '<rect x="' + x + '" y="' + y + '" width="' + boxSize + '" height="' + boxSize + '" rx="2" ' +
             'fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.2"/>';
      }
    }
    svg.innerHTML = h;

    readout.innerHTML =
      '<div class="tri-stat"><span>Original shelf (accent), counted:</span> <b>' + cells.orig + ' blocks</b></div>' +
      '<div class="tri-stat"><span>Flipped copy (navy), counted:</span> <b>' + cells.flipped + ' blocks</b></div>' +
      '<div class="tri-stat"><span>Combined rectangle:</span> <b>' + n + ' \u00d7 ' + (n + 1) + ' = ' + cells.total + ' blocks</b></div>' +
      '<div class="tri-stat"><span>Closed form:</span> <code>' + n + ' \u00d7 ' + (n + 1) + ' / 2 = ' + formula + '</code>' + (formula === cells.orig ? ' matches the count' : ' DOES NOT match the count') + '</div>';
  }

  slider.addEventListener('input', render);
  render();
}

/* ---------- Doubling and Halving Boxes Widget ---------- */
/* Row labels are HTML beside the bars: SVG text inside the scaled viewBox drew at 5px on a phone. */
function mountBoxesWidget() {
  var svg = document.getElementById('boxesSvg');
  var readout = document.getElementById('boxesReadout');
  if (!svg || !readout) return;

  var K = 4;
  var terms = [];
  for (var i = 0; i <= K; i++) terms.push(Math.pow(2, i));
  var total = simDoubling(K);
  var W = 480, H = 160, startX = 30, startY = 12, rowH = 20, gap = 8, maxW = 300;
  var box = document.createElement('div');
  box.className = 'hero-box';
  svg.parentNode.insertBefore(box, svg);
  box.appendChild(svg);
  var h = '';

  terms.forEach(function(val, idx) {
    var y = startY + idx * (rowH + gap);
    var w = (val / terms[K]) * maxW;
    h += '<rect x="' + startX + '" y="' + y + '" width="' + w.toFixed(1) + '" height="' + rowH + '" rx="3" ' +
         'fill="var(--pop)" stroke="var(--mark)" stroke-width="1.2"/>';
    overlayLabel(box, W, H, startX + w + 8, y + rowH / 2, '2^' + idx + ' = ' + val, 'translate(0, -50%)');
  });

  svg.innerHTML = h;

  readout.innerHTML =
    '<div class="box-stat"><span>Sum of the first ' + terms.length + ' doublings:</span> <code>' + terms.join(' + ') + ' = ' + total + '</code></div>' +
    '<div class="box-stat"><span>Next single term (2^' + terms.length + '):</span> <code>' + Math.pow(2, terms.length) + ' crate-slots</code></div>' +
    '<div class="box-stat"><span>Total:</span> <b>' + total + ' = 2^' + terms.length + ' \u2212 1</b>, less than twice the largest term (' + terms[K] + ')</div>';
}

function mountPage() {
  mountLesson();
  mountHeroTri();
  mountTriWidget();
  mountBoxesWidget();
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
