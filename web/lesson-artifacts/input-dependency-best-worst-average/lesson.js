/* ================= Input Dependency: Best, Worst, & Average =================
   Linear search demonstrates best (Theta(1)), worst (Theta(n)), and average (Theta(n))
   probes across input configurations. Insertion sort demonstrates how input order
   changes complexity from Theta(n) to Theta(n^2).
   Every number the page shows is computed in the PURE block below and verified by check.py. */

/* PURE:begin (no DOM below this line until PURE:end) */
var MAIL_BIN = [142, 305, 418, 529, 631, 745, 890, 912];

function linearSearchCount(arr, target) {
  var comparisons = 0;
  for (var i = 0; i < arr.length; i++) {
    comparisons++;
    if (arr[i] === target) return { index: i, comparisons: comparisons };
  }
  return { index: -1, comparisons: comparisons };
}

function insertionSortCount(arr) {
  var a = arr.slice();
  var comparisons = 0;
  for (var i = 1; i < a.length; i++) {
    var val = a[i];
    var j = i - 1;
    while (j >= 0) {
      comparisons++;
      if (a[j] > val) {
        a[j + 1] = a[j];
        j--;
      } else {
        break;
      }
    }
    a[j + 1] = val;
  }
  return comparisons;
}

function rangeArray(n, reversed) {
  var a = [];
  for (var i = 0; i < n; i++) a.push(reversed ? n - 1 - i : i);
  return a;
}

var SORT_SIZES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
var SORT_COSTS = SORT_SIZES.map(function(n) {
  return [n, insertionSortCount(rangeArray(n, true)), insertionSortCount(rangeArray(n, false))];
});

/* The three widget arrays; each comparison count is counted by insertionSortCount,
   never typed, so a changed array cannot leave a stale number on the page. */
var SORT_CASES = [
  { name: 'Already Sorted (Best)', arr: [12, 25, 33, 47, 51, 68, 74, 99],
    bound: '\u0398(n) linear: each element compared once to its predecessor', cls: 'good' },
  { name: 'Reversed (Worst)', arr: [99, 74, 68, 51, 47, 33, 25, 12],
    bound: '\u0398(n\u00B2) quadratic: each item shifts across the full sorted prefix', cls: 'bad' },
  { name: 'Random Mixture (Average)', arr: [51, 12, 74, 33, 99, 25, 47, 68],
    bound: '\u0398(n\u00B2) quadratic: on average an item shifts past half the sorted prefix', cls: 'accent' }
].map(function(c) { c.compares = insertionSortCount(c.arr); return c; });

var FACTS = (function() {
  var n = MAIL_BIN.length;
  var sumCompares = 0;
  for (var i = 0; i < n; i++) {
    sumCompares += linearSearchCount(MAIL_BIN, MAIL_BIN[i]).comparisons;
  }
  return {
    binSize: n,
    bestCompares: linearSearchCount(MAIL_BIN, MAIL_BIN[0]).comparisons,
    worstCompares: linearSearchCount(MAIL_BIN, 999).comparisons,
    avgCompares: (sumCompares / n).toFixed(1),
    sumCompares: sumCompares,
    insN: SORT_CASES[0].arr.length,
    insSortedCompares: SORT_CASES[0].compares,
    insReversedCompares: SORT_CASES[1].compares,
    insRandomCompares: SORT_CASES[2].compares
  };
})();
/* PURE:end */

/* ---------- 1. Linear search interactive model ---------- */
function mountMailSearch(host) {
  if (!host) return;
  var slotsHost = host.querySelector('#binSlots');
  var targetLabel = host.querySelector('#targetLabel');
  var idxLabel = host.querySelector('#idxLabel');
  var cmpLabel = host.querySelector('#cmpLabel');
  var classLabel = host.querySelector('#classLabel');
  var simBtn = host.querySelector('#simAvg');
  var simRes = host.querySelector('#simRes');

  var PRESETS = [
    { name: 'Best case (index 0: zip 142)', target: 142, desc: 'Target at index 0: found immediately.' },
    { name: 'Middle (index 3: zip 529)', target: 529, desc: 'Target halfway through the mail bin.' },
    { name: 'Worst case present (index 7: zip 912)', target: 912, desc: 'Target at the very last slot.' },
    { name: 'Worst case absent (zip 999)', target: 999, desc: 'Target not in the bin: full scan required.' }
  ];

  var tabsHost = host.querySelector('.extabs');
  var currentTarget = 142;

  function renderSlots() {
    slotsHost.innerHTML = '';
    MAIL_BIN.forEach(function(val, idx) {
      var slot = el('div', 'bin-slot');
      slot.innerHTML = '<span class="slot-idx">[' + idx + ']</span><span class="slot-val">' + val + '</span>';
      slot.setAttribute('role', 'button');
      slot.setAttribute('tabindex', '0');
      slot.setAttribute('aria-label', 'Parcel at index ' + idx + ' with zip ' + val);
      slot.addEventListener('click', function() {
        runSearch(val, 'Custom selection at index ' + idx);
      });
      slot.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          runSearch(val, 'Custom selection at index ' + idx);
        }
      });
      slotsHost.appendChild(slot);
    });
  }

  function runSearch(target, desc) {
    currentTarget = target;
    var res = linearSearchCount(MAIL_BIN, target);
    var slots = slotsHost.querySelectorAll('.bin-slot');

    slots.forEach(function(s, i) {
      s.className = 'bin-slot';
      if (res.index >= 0 && i === res.index) {
        s.classList.add('match');
      } else if (i < res.comparisons) {
        s.classList.add('checked');
      }
    });

    targetLabel.textContent = target;
    if (res.index >= 0) {
      idxLabel.textContent = 'index ' + res.index;
      idxLabel.className = 'sr-val good';
    } else {
      idxLabel.textContent = '-1 (absent)';
      idxLabel.className = 'sr-val bad';
    }

    cmpLabel.textContent = res.comparisons + ' / ' + MAIL_BIN.length;

    if (res.comparisons === 1) {
      classLabel.textContent = 'Best Case: \u0398(1)';
      classLabel.className = 'sr-val good';
    } else if (res.comparisons === MAIL_BIN.length) {
      classLabel.textContent = 'Worst Case: \u0398(n)';
      classLabel.className = 'sr-val bad';
    } else {
      classLabel.textContent = 'Arbitrary: \u0398(n)';
      classLabel.className = 'sr-val accent';
    }
  }

  PRESETS.forEach(function(p, i) {
    var btn = el('button', 'tab', p.name);
    btn.type = 'button';
    btn.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    btn.addEventListener('click', function() {
      tabsHost.querySelectorAll('button').forEach(function(b, k) {
        b.setAttribute('aria-pressed', k === i ? 'true' : 'false');
      });
      runSearch(p.target, p.desc);
    });
    tabsHost.appendChild(btn);
  });

  if (simBtn) {
    simBtn.addEventListener('click', function() {
      var trials = 1000;
      var total = 0;
      for (var t = 0; t < trials; t++) {
        var pick = MAIL_BIN[Math.floor(Math.random() * MAIL_BIN.length)];
        total += linearSearchCount(MAIL_BIN, pick).comparisons;
      }
      var mean = (total / trials).toFixed(2);
      simRes.textContent = '1,000 queries: mean comparisons = ' + mean + ' (theory = ' + FACTS.avgCompares + ')';
    });
  }

  var avgMath = host.querySelector('#avgMath');
  var avgBars = host.querySelector('#avgBars');
  var avgTitle = host.querySelector('#avgTitle');
  var terms = MAIL_BIN.map(function(v) { return linearSearchCount(MAIL_BIN, v).comparisons; });
  avgTitle.textContent = 'Average-case distribution (uniform over ' + FACTS.binSize + ' positions)';
  avgMath.textContent = '(' + terms.join(' + ') + ') / ' + FACTS.binSize + ' = ' +
    FACTS.sumCompares + ' / ' + FACTS.binSize + ' = ' + FACTS.avgCompares + ' checks';
  terms.forEach(function(t) {
    var col = el('div', 'avg-col');
    var bar = el('div', 'avg-bar');
    bar.style.height = (100 * t / FACTS.worstCompares) + '%';
    col.appendChild(bar);
    col.appendChild(el('span', 'avg-bar-label', String(t)));
    avgBars.appendChild(col);
  });

  renderSlots();
  runSearch(MAIL_BIN[0], PRESETS[0].desc);
}

/* ---------- 2. Insertion Sort case-split ---------- */
function mountSortSplit(host) {
  if (!host) return;
  var tabsHost = host.querySelector('.extabs');
  var arrHost = host.querySelector('#sortArr');
  var cmpReadout = host.querySelector('#sortCmp');
  var boundReadout = host.querySelector('#sortBound');

  var CASES = SORT_CASES;

  function showCase(c) {
    arrHost.innerHTML = '';
    c.arr.forEach(function(v) {
      var chip = el('span', 'sort-chip', String(v));
      arrHost.appendChild(chip);
    });
    cmpReadout.textContent = c.compares + ' comparisons (n = ' + c.arr.length + ')';
    boundReadout.textContent = c.bound;
    boundReadout.className = 'sr-val ' + c.cls;
  }

  CASES.forEach(function(c, i) {
    var btn = el('button', 'tab', c.name);
    btn.type = 'button';
    btn.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    btn.addEventListener('click', function() {
      tabsHost.querySelectorAll('button').forEach(function(b, k) {
        b.setAttribute('aria-pressed', k === i ? 'true' : 'false');
      });
      showCase(c);
    });
    tabsHost.appendChild(btn);
  });

  showCase(CASES[0]);

  var chartHost = host.querySelector('#sortChart');
  if (chartHost && typeof costChart === 'function') {
    costChart(chartHost, {
      pts: SORT_COSTS,
      names: ['Reversed: \u0398(n\u00B2)', 'Sorted: \u0398(n)'],
      xlabel: 'input size n',
      ylabel: 'comparisons'
    });
  }
}

/* ---------- Boot wiring ---------- */
(function() {
  mountLesson();
  mountMailSearch($('#mailSearch'));
  mountSortSplit($('#sortSplit'));
})();

/* ---------- Systems hero: clerk at the mail bin ---------- */
(function() {
  function heroMail() {
    var svg = $('#heroMail');
    if (!svg) return;
    var X0 = 40, W = 54, Y = 60;
    S('text', { x: 280, y: 30, class: 'hd-lab', 'text-anchor': 'middle' }, svg)
      .textContent = 'linear search: cost depends on where the mail item sits';

    var cells = [];
    MAIL_BIN.forEach(function(val, idx) {
      var g = S('g', {}, svg);
      var rect = S('rect', { x: X0 + idx * (W + 8), y: Y, width: W, height: 48, rx: 6, class: 'hs-prob' }, g);
      S('text', { x: X0 + idx * (W + 8) + W / 2, y: Y + 22, class: 'hd-lab', 'text-anchor': 'middle' }, g)
        .textContent = '[' + idx + ']';
      S('text', { x: X0 + idx * (W + 8) + W / 2, y: Y + 40, class: 'hs-pt', 'text-anchor': 'middle' }, g)
        .textContent = String(val);
      cells.push(rect);
    });

    var num = $('#heroNum'), unit = $('#heroUnit'), cap = $('#heroCap');
    function show(step) {
      cells.forEach(function(r, i) {
        if (i === step) {
          r.setAttribute('class', 'hs-cell ok');
        } else if (i < step) {
          r.setAttribute('class', 'hs-cell no');
        } else {
          r.setAttribute('class', 'hs-prob');
        }
      });
      if (num) num.textContent = step + 1;
      if (unit) unit.textContent = 'of ' + MAIL_BIN.length + ' checks for target ' + MAIL_BIN[step];
      if (cap) {
        if (step === 0) {
          cap.innerHTML = '<strong>Best case</strong>: target at index 0 takes 1 probe (\u0398(1)).';
        } else if (step === MAIL_BIN.length - 1) {
          cap.innerHTML = '<strong>Worst case</strong>: target at the last slot takes ' + MAIL_BIN.length + ' probes (\u0398(n)).';
        } else {
          cap.innerHTML = 'Index ' + step + ' reached after ' + (step + 1) + ' probes.';
        }
      }
    }

    if (reduce || !M || !M.animate) {
      show(0);
      return;
    }
    var last = -1;
    M.animate(0, MAIL_BIN.length, {
      duration: MAIL_BIN.length * 1.2,
      ease: 'linear',
      repeat: Infinity,
      onUpdate: function(v) {
        var s = Math.min(MAIL_BIN.length - 1, Math.floor(v));
        if (s !== last) {
          last = s;
          show(s);
        }
      }
    });
  }
  heroMail();
  kinetic();
  riseIn();
})();
