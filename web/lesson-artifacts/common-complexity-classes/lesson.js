/* ================= The Common Complexity Classes =================
   The 7 canonical complexity classes: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ), O(n!).
   Live ladder model across n in [1..10^6] with operation counts and wall time
   at an assumed 10^8 ops/sec budget ceiling. Stepping halving loop counting steps
   to 1 (floor log2 n). Constraints table mapping n to viable classes.
   Every number the page shows is computed in the PURE block below. */

/* PURE:begin (no DOM below this line until PURE:end) */
function halvingsCount(n) {
  var count = 0;
  var cur = Math.floor(n);
  while (cur > 1) {
    cur = Math.floor(cur / 2);
    count++;
  }
  return count;
}

/* Operation counts are carried as log10, so 2^1000 and 50! keep their real
   magnitude instead of collapsing to Infinity and a made-up label. */
function opsLog10(cls, n) {
  var h = Math.max(1, halvingsCount(n));
  if (cls === '1') return 0;
  if (cls === 'logn') return Math.log10(h);
  if (cls === 'n') return Math.log10(n);
  if (cls === 'nlogn') return Math.log10(n * h);
  if (cls === 'n2') return 2 * Math.log10(n);
  if (cls === '2n') return n * Math.log10(2);
  if (cls === 'nfac') {
    var t = 0;
    for (var i = 2; i <= n; i++) t += Math.log10(i);
    return t;
  }
  throw new Error('unknown class ' + cls);
}

var BUDGET_LOG10 = 8; // 10^8 simple operations ~ one second on a judge

function sup(k) {
  var d = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  return String(k).split('').map(function(ch) { return d[+ch]; }).join('');
}

/* Below 10^15 the count is exact enough to print in full; above it, its power of ten. */
function formatOps(lg) {
  if (lg < 15) return Math.round(Math.pow(10, lg)).toLocaleString('en-US');
  return '≈ 10' + sup(Math.floor(lg));
}

function formatTime(lg) {
  var ls = lg - BUDGET_LOG10; // log10 of seconds
  var YEAR = 365.25 * 86400;
  if (ls < 6) {
    var sec = Math.pow(10, ls);
    if (sec < 1e-6) return '< 1 µs';
    if (sec < 1e-3) return (sec * 1e6).toFixed(1) + ' µs';
    if (sec < 1) return (sec * 1e3).toFixed(1) + ' ms';
    if (sec < 60) return sec.toFixed(1) + ' s';
    if (sec < 3600) return (sec / 60).toFixed(1) + ' min';
    if (sec < 86400) return (sec / 3600).toFixed(1) + ' hours';
    if (sec < YEAR) return (sec / 86400).toFixed(1) + ' days';
  }
  var ly = ls - Math.log10(YEAR);
  if (ly < 4) return Math.round(Math.pow(10, ly)).toLocaleString('en-US') + ' years';
  return '≈ 10' + sup(Math.floor(ly)) + ' years';
}

var LADDER_SIZES = [1, 10, 20, 50, 100, 1000, 10000, 100000, 1000000];

var CONSTRAINTS = [
  { n: 10, label: 'n \u2264 10', target: 'O(n!) or O(2\u207F)', desc: 'Permutations, all subsets, exhaustive backtracking.', maxClass: 'nfac' },
  { n: 20, label: 'n \u2264 20', target: 'O(2\u207F)', desc: 'Subset generation, bitmask dynamic programming, branch-and-bound.', maxClass: '2n' },
  { n: 1000, label: 'n \u2264 10\u00B3', target: 'O(n\u00B2)', desc: 'Nested loops, all-pairs comparisons, 2D dynamic programming grid.', maxClass: 'n2' },
  { n: 100000, label: 'n \u2264 10\u2075', target: 'O(n log n) or O(n)', desc: 'Comparison sorting, divide-and-conquer, heap operations, sliding window.', maxClass: 'nlogn' },
  { n: 1000000, label: 'n \u2264 10\u2076', target: 'O(n log n) or O(n)', desc: 'Single linear scan, two pointers, hash map lookup, prefix sums.', maxClass: 'nlogn' },
  { n: 1000000000, label: 'n \u2265 10\u2079', target: 'O(log n) or O(1)', desc: 'Binary search, bit tricks, mathematical closed forms (GCD, modular arithmetic).', maxClass: 'logn' }
];

var CLASSES = [
  { id: '1', badge: 'O(1)', name: 'constant' },
  { id: 'logn', badge: 'O(log n)', name: 'logarithmic' },
  { id: 'n', badge: 'O(n)', name: 'linear' },
  { id: 'nlogn', badge: 'O(n log n)', name: 'linearithmic' },
  { id: 'n2', badge: 'O(n\u00B2)', name: 'quadratic' },
  { id: '2n', badge: 'O(2\u207F)', name: 'exponential' },
  { id: 'nfac', badge: 'O(n!)', name: 'factorial' }
];

var CLASS_IDS = CLASSES.map(function(c) { return c.id; });

/* A constraint's verdict: the slowest class it names, and the next slower one, priced at its n. */
function constraintVerdict(c) {
  var k = CLASS_IDS.indexOf(c.maxClass);
  var out = [{ cls: CLASSES[k], lg: opsLog10(c.maxClass, c.n) }];
  if (k + 1 < CLASSES.length) out.push({ cls: CLASSES[k + 1], lg: opsLog10(CLASS_IDS[k + 1], c.n) });
  return out;
}
/* PURE:end */

/* ---------- 1. Complexity Ladder Model ---------- */
function mountLadder(host) {
  if (!host) return;
  var slider = host.querySelector('#ladderSlider');
  var nVal = host.querySelector('#ladderNVal');
  var rowsHost = host.querySelector('#ladderRows');
  var tabsHost = host.querySelector('.extabs');
  var note = host.querySelector('#ladderNote');

  var currentIdx = 4; // default n = 100

  // Build rows
  var rowEls = {};
  CLASSES.forEach(function(cls) {
    var row = el('div', 'ladder-row');
    var info = el('div', 'l-cls');
    var badge = el('span', 'l-badge', cls.badge);
    var name = el('span', 'l-name', cls.name);
    info.appendChild(badge);
    info.appendChild(name);

    var barWrap = el('div', 'l-bar-wrap');
    var budgetMark = el('div', 'l-budget-mark');
    budgetMark.setAttribute('title', '1 second budget threshold (10\u2078 ops)');
    var bar = el('div', 'l-bar');
    barWrap.appendChild(budgetMark);
    barWrap.appendChild(bar);

    var ops = el('div', 'l-ops');
    var time = el('div', 'l-time');
    var stat = el('div', 'l-badge-status');

    row.appendChild(info);
    row.appendChild(barWrap);
    row.appendChild(ops);
    row.appendChild(time);
    row.appendChild(stat);

    rowsHost.appendChild(row);
    rowEls[cls.id] = { bar: bar, ops: ops, time: time, stat: stat };
  });

  function updateN(idx) {
    currentIdx = idx;
    var n = LADDER_SIZES[idx];
    if (slider) slider.value = idx;
    if (nVal) nVal.textContent = n >= 1000 ? n.toLocaleString('en-US') : String(n);

    // Sync tabs
    if (tabsHost) {
      tabsHost.querySelectorAll('button').forEach(function(btn, k) {
        btn.setAttribute('aria-pressed', k === idx ? 'true' : 'false');
      });
    }

    var passing = [];
    var failing = [];

    CLASSES.forEach(function(cls) {
      var logOps = opsLog10(cls.id, n);
      var r = rowEls[cls.id];
      var timeStr = formatTime(logOps);
      var opsStr = formatOps(logOps);

      // Log scale bar width: 10^8 is exactly 50%
      var pct = Math.min(100, Math.max(2, (logOps / (2 * BUDGET_LOG10)) * 100));

      r.bar.style.width = pct.toFixed(1) + '%';
      var isPass = logOps <= BUDGET_LOG10;
      r.bar.className = 'l-bar ' + (isPass ? 'good' : 'bad');
      r.ops.textContent = opsStr;
      r.time.textContent = timeStr;
      r.stat.textContent = isPass ? 'Passes' : 'Exceeds 1s';
      r.stat.className = 'l-badge-status ' + (isPass ? 'pass' : 'fail');

      if (isPass) passing.push(cls.badge);
      else failing.push(cls.badge);
    });

    if (note) {
      var nText = n >= 1000 ? n.toLocaleString('en-US') : String(n);
      note.innerHTML = 'At <b>n = ' + nText + '</b>, classes <b>' + passing.join(', ') +
        '</b> fit within the 1-second budget (~10\u2078 ops).' +
        (failing.length > 0 ? ' Classes <b class="ladder-fail">' + failing.join(', ') + '</b> blow past it.' : '') +
        '<br><em>* Assuming standard online judge rate of 10\u2078 operations per second.</em>';
    }
  }

  // Preset tabs
  if (tabsHost) {
    LADDER_SIZES.forEach(function(sz, idx) {
      var lbl = sz >= 1000000 ? '10\u2076' : sz >= 100000 ? '10\u2075' : sz >= 1000 ? '10\u00B3' : String(sz);
      var btn = el('button', 'tab', 'n = ' + lbl);
      btn.type = 'button';
      btn.setAttribute('aria-pressed', idx === currentIdx ? 'true' : 'false');
      btn.addEventListener('click', function() {
        updateN(idx);
      });
      tabsHost.appendChild(btn);
    });
  }

  if (slider) {
    slider.addEventListener('input', function() {
      updateN(parseInt(slider.value, 10));
    });
  }

  updateN(currentIdx);
}

/* ---------- 2. Halving Stepper Widget ---------- */
function mountHalvingStepper(host) {
  if (!host) return;
  var btnStep = host.querySelector('#btnStepHalve');
  var btnReset = host.querySelector('#btnResetHalve');
  var tabsHost = host.querySelector('.extabs');
  var numN = host.querySelector('#halveCurN');
  var numSteps = host.querySelector('#halveStepCount');
  var mathCheck = host.querySelector('#halveMathCheck');
  var barFill = host.querySelector('#halveBarFill');
  var chainHost = host.querySelector('#halveChain');

  var PRESETS = [16, 64, 125, 1000];
  var initialN = 64;
  var currentN = 64;
  var steps = 0;
  var history = [64];

  function render() {
    if (numN) numN.textContent = String(currentN);
    if (numSteps) numSteps.textContent = String(steps);
    var targetHalvings = halvingsCount(initialN);

    if (mathCheck) {
      if (currentN === 1) {
        mathCheck.textContent = 'Complete: ' + steps + ' halvings = \u230Alog\u2082(' + initialN + ')\u230B';
        mathCheck.className = 'h-v good';
      } else {
        mathCheck.textContent = '\u230Alog\u2082(' + initialN + ')\u230B = ' + targetHalvings;
        mathCheck.className = 'h-v accent';
      }
    }

    if (barFill) {
      var pct = Math.max(3, (currentN / initialN) * 100);
      barFill.style.width = pct.toFixed(1) + '%';
    }

    if (chainHost) {
      chainHost.innerHTML = '';
      history.forEach(function(val, idx) {
        if (idx > 0) {
          var arr = el('span', 'chain-arrow', '\u2192');
          chainHost.appendChild(arr);
        }
        var st = el('span', 'chain-step' + (idx === history.length - 1 ? ' current' : '') + (val === 1 ? ' terminal' : ''), String(val));
        chainHost.appendChild(st);
      });
    }

    if (btnStep) {
      btnStep.disabled = (currentN <= 1);
      btnStep.textContent = currentN <= 1 ? 'Reached 1 (Halted)' : 'Halve: n //= 2';
    }
  }

  function resetTo(n) {
    initialN = n;
    currentN = n;
    steps = 0;
    history = [n];
    render();
  }

  if (tabsHost) {
    PRESETS.forEach(function(val, idx) {
      var btn = el('button', 'tab', 'n = ' + val);
      btn.type = 'button';
      btn.setAttribute('aria-pressed', val === initialN ? 'true' : 'false');
      btn.addEventListener('click', function() {
        tabsHost.querySelectorAll('button').forEach(function(b, k) {
          b.setAttribute('aria-pressed', k === idx ? 'true' : 'false');
        });
        resetTo(val);
      });
      tabsHost.appendChild(btn);
    });
  }

  if (btnStep) {
    btnStep.addEventListener('click', function() {
      if (currentN > 1) {
        currentN = Math.floor(currentN / 2);
        steps++;
        history.push(currentN);
        render();
      }
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', function() {
      resetTo(initialN);
    });
  }

  resetTo(initialN);
}

/* ---------- 3. Constraints Table Widget ---------- */
function mountConstraints(host) {
  if (!host) return;
  var tabsHost = host.querySelector('.extabs');
  var targetLabel = host.querySelector('#consTarget');
  var machLabel = host.querySelector('#consMachinery');
  var breakLabel = host.querySelector('#consBreak');
  var tableBody = host.querySelector('#consTableBody');

  var currentIdx = 3; // default n <= 10^5

  function updateConstraint(idx) {
    currentIdx = idx;
    var c = CONSTRAINTS[idx];

    if (tabsHost) {
      tabsHost.querySelectorAll('button').forEach(function(btn, k) {
        btn.setAttribute('aria-pressed', k === idx ? 'true' : 'false');
      });
    }

    if (targetLabel) targetLabel.textContent = c.target;
    if (machLabel) machLabel.textContent = c.desc;

    if (breakLabel) {
      var nTxt = c.n.toLocaleString('en-US');
      breakLabel.textContent = constraintVerdict(c).map(function(v) {
        var ok = v.lg <= BUDGET_LOG10;
        return v.cls.badge + ' at n = ' + nTxt + ' costs ' + formatOps(v.lg) + ' operations (' + formatTime(v.lg) + '): ' +
          (ok ? 'fits the budget.' : 'exceeds it.');
      }).join(' ');
    }

    if (tableBody) {
      tableBody.querySelectorAll('tr').forEach(function(row, k) {
        if (k === idx) row.classList.add('active-row');
        else row.classList.remove('active-row');
      });
    }
  }

  if (tabsHost) {
    CONSTRAINTS.forEach(function(c, idx) {
      var btn = el('button', 'tab', c.label);
      btn.type = 'button';
      btn.setAttribute('aria-pressed', idx === currentIdx ? 'true' : 'false');
      btn.addEventListener('click', function() {
        updateConstraint(idx);
      });
      tabsHost.appendChild(btn);
    });
  }

  if (tableBody) {
    CONSTRAINTS.forEach(function(c, idx) {
      var tr = el('tr');
      var tdN = el('td');
      var codeN = el('code', '', c.label);
      tdN.appendChild(codeN);
      var tdTarget = el('td');
      var bTarget = el('b', '', c.target);
      tdTarget.appendChild(bTarget);
      var tdMach = el('td', '', c.desc);
      tr.appendChild(tdN);
      tr.appendChild(tdTarget);
      tr.appendChild(tdMach);
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', function() {
        updateConstraint(idx);
      });
      tableBody.appendChild(tr);
    });
  }

  updateConstraint(currentIdx);
}

/* ---------- Boot wiring ---------- */
(function() {
  mountLesson();
  mountLadder($('#complexityLadder'));
  mountHalvingStepper($('#halvingStepper'));
  mountConstraints($('#constraintsWidget'));
})();

/* ---------- Hero Art: Complexity Curves Ladder ---------- */
(function() {
  function heroLadder() {
    var svg = $('#heroLadder');
    if (!svg) return;

    /* A real log-log plot: x = log10 n from 1 to 10^6, y = log10 of each class's count. */
    var X0 = 50, Y0 = 135, W = 400, H = 110, XMAX = 6, YMAX = 16;
    function px(lx) { return X0 + (lx / XMAX) * W; }
    function py(ly) { return Y0 - (ly / YMAX) * H; }

    S('line', { x1: X0, y1: Y0, x2: X0 + W, y2: Y0, class: 'ha-axis' }, svg);
    S('line', { x1: X0, y1: Y0, x2: X0, y2: Y0 - H, class: 'ha-axis' }, svg);
    var budgetY = py(BUDGET_LOG10);
    S('line', { x1: X0, y1: budgetY, x2: X0 + W, y2: budgetY, class: 'ha-budget-line' }, svg);
    S('text', { x: X0 + 4, y: budgetY - 5, class: 'ha-label' }, svg).textContent = '1 s budget (10⁸ ops)';
    S('text', { x: X0 + W, y: Y0 + 14, class: 'ha-label', 'text-anchor': 'end' }, svg).textContent = 'n = 10⁶';
    S('text', { x: X0, y: Y0 + 14, class: 'ha-label' }, svg).textContent = 'n = 1';

    var CURVE_CLS = { '1': 'c-1', logn: 'c-log', n: 'c-n', nlogn: 'c-nlogn', n2: 'c-n2', '2n': 'c-2n', nfac: 'c-fac' };
    var labels = [];
    CLASSES.forEach(function(cls) {
      var d = '', end = null, exited = false;
      for (var lx = 0; lx <= XMAX + 1e-9; lx += 0.01) {
        var n = Math.round(Math.pow(10, lx));
        var ly = opsLog10(cls.id, n);
        if (ly > YMAX) { exited = true; break; }
        d += (d ? ' L ' : 'M ') + px(lx).toFixed(1) + ' ' + py(ly).toFixed(1);
        end = [px(lx), py(ly)];
      }
      S('path', { d: d, class: 'ha-curve ' + CURVE_CLS[cls.id] }, svg);
      labels.push({ text: cls.badge, x: end[0], y: end[1], top: exited, id: cls.id });
    });
    // Labels at the right edge sit close in height, so space them 11px apart from the bottom up.
    var right = labels.filter(function(l) { return !l.top; }).sort(function(a, b) { return b.y - a.y; });
    var floor = Y0 - 2;
    right.forEach(function(l) { l.ty = Math.min(l.y + 4, floor); floor = l.ty - 11; });
    labels.forEach(function(l) {
      // n! leaves the plot just left of 2^n, so its label sits on the left of its exit.
      var left = l.id === 'nfac';
      S('text', { x: l.x + (left ? -5 : 5), y: l.top ? l.y + 4 : l.ty, class: 'ha-label', 'text-anchor': left ? 'end' : 'start' }, svg).textContent = l.text;
    });

    var num = $('#heroNum'), unit = $('#heroUnit'), cap = $('#heroCap');
    if (num) num.textContent = String(CLASSES.length);
    if (unit) unit.textContent = 'complexity classes';
    if (cap) cap.innerHTML = 'From flat <b>O(1)</b> to vertical <b>O(n!)</b>: input scale separates algorithms brutally.';
  }

  heroLadder();
  kinetic();
  riseIn();
})();
