/* ================= Complexity Drills: lesson.js =================
   Every count on the page comes from running an instrumented copy of the drill's real code (code/drillN.ts),
   with one counter added per unit of work and nothing else changed. check.py runs this block in node, runs
   the real Python and TypeScript on the same inputs and requires the same results, re-counts every row with an
   independent Python copy, and holds each drill's counts to the growth its stated class predicts. */

/* PURE:begin (no DOM below this line until PURE:end) */
/* inputs: distinct integers, negative and positive, for the list drills (no early exit anywhere, so the count is the full cost),
   and a deterministic grid for drill 6; check.py builds the same inputs in Python */
function dList(n) { var a = []; for (var i = 0; i < n; i++) a.push(i - Math.floor(n / 2)); return a; }
function dGrid(n) {
  var g = [];
  for (var r = 0; r < n; r++) { var row = []; for (var c = 0; c < n; c++) row.push((r * 7 + c * 13) % 101); g.push(row); }
  return g;
}

/* drill 1: one step per loop iteration, both loops */
function runDrill1(nums) {
  var total = 0, steps = 0;
  for (var i = 0; i < nums.length; i++) { total += nums[i]; steps++; }
  for (var j = 0; j < nums.length; j++) { total -= Math.floor(nums[j] / 2); steps++; }
  return { result: total, steps: steps, peak: 0 };
}
/* drill 2: one step per comparison */
function runDrill2(nums) {
  var pairs = 0, steps = 0;
  for (var i = 0; i < nums.length; i++) {
    for (var j = i + 1; j < nums.length; j++) { steps++; if (nums[i] + nums[j] === 0) pairs++; }
  }
  return { result: pairs, steps: steps, peak: 0 };
}
/* drill 3: one step per inner iteration; the outer loop only halves */
function runDrill3(nums) {
  var total = 0, steps = 0;
  for (var size = nums.length; size > 1; size = Math.floor(size / 2)) {
    for (var k = 0; k < nums.length; k++) { total += nums[k]; steps++; }
  }
  return { result: total, steps: steps, peak: 0 };
}
/* drill 4: the slice is a loop of copies and the `in` test a loop of comparisons, so both are counted;
   peak is the largest slice alive at once */
function runDrill4(nums) {
  var steps = 0, peak = 0;
  for (var i = 0; i < nums.length; i++) {
    var rest = nums.slice(i + 1);
    steps += rest.length;
    if (rest.length > peak) peak = rest.length;
    for (var k = 0; k < rest.length; k++) {
      steps++;
      if (rest[k] === nums[i]) return { result: true, steps: steps, peak: peak };
    }
  }
  return { result: false, steps: steps, peak: peak };
}
/* drill 5: one step per call; peak is the deepest the calls were nested */
function runDrill5(nums) {
  var calls = 0, depth = 0, peak = 0;
  function go(lo, hi) {
    calls++; depth++;
    if (depth > peak) peak = depth;
    var r;
    if (hi - lo <= 1) r = hi > lo ? nums[lo] : 0;
    else { var mid = Math.floor((lo + hi) / 2); r = go(lo, mid) + go(mid, hi); }
    depth--;
    return r;
  }
  var result = go(0, nums.length);
  return { result: result, steps: calls, peak: peak };
}
/* drill 6: one step per cell */
function runDrill6(grid) {
  var best = grid[0][0], steps = 0;
  for (var r = 0; r < grid.length; r++) {
    for (var c = 0; c < grid[r].length; c++) { steps++; if (grid[r][c] > best) best = grid[r][c]; }
  }
  return { result: best, steps: steps, peak: 0 };
}

function dRatio(a, b) { return (b / a).toFixed(2) + 'x'; }
function dRows(d) {
  return d.ns.map(function (n, k) {
    var o = d.run(d.input(n));
    return { n: n, label: (k === 0 ? 'n' : (k === 1 ? '2n' : '4n')), result: o.result, steps: o.steps, peak: o.peak };
  });
}

/* the choices put the right one in a different place and at no extreme length on every drill (check.py) */
var DRILLS = [
  {
    id: 1, fn: 'net_weight', topic: 'sequential passes', short: 'sequential', unit: 'loop iterations', nWhat: 'the number of items',
    time: 'O(n)', space: 'O(1)', ns: [10, 20, 40], run: runDrill1, input: dList,
    choices: ['O(n²) time, O(n) space', 'O(n) time, O(1) space', 'O(n) time, O(n) space', 'O(n²) time, O(1) space'],
    reason: function (r) {
      return 'The first loop touches each of the n items once and the second does the same, so the work is n + n = 2n: <b>' + r[0].steps + '</b> steps at n = ' + r[0].n +
        ', <b>' + r[1].steps + '</b> at ' + r[1].n + '. Doubling n doubles the count (' + dRatio(r[0].steps, r[1].steps) + '), which is what linear growth looks like, and the constant 2 is dropped. ' +
        'Space: the only value that changes is <code>total</code>, one number whatever n is, so auxiliary space is O(1).';
    }
  },
  {
    id: 2, fn: 'count_cancelling_pairs', topic: 'triangular j > i', short: 'triangular', unit: 'comparisons', nWhat: 'the number of items',
    time: 'O(n²)', space: 'O(1)', ns: [10, 20, 40], run: runDrill2, input: dList,
    choices: ['O(n²) time, O(1) space', 'O(n) time, O(1) space', 'O(n log n) time, O(1) space', 'O(n²) time, O(n) space'],
    reason: function (r) {
      return 'For item i the inner loop visits the n − 1 − i items after it, so the total is (n − 1) + (n − 2) + … + 1 = n(n − 1)/2. At n = ' + r[0].n + ' that is <b>' + r[0].steps +
        '</b>, exactly what was counted. Doubling n multiplies n(n − 1)/2 by a little over four (' + dRatio(r[0].steps, r[1].steps) + ', then ' + dRatio(r[1].steps, r[2].steps) +
        '): quadratic growth. The ½ is a constant factor, so it does not change the class. Space: one counter, O(1).';
    }
  },
  {
    id: 3, fn: 'weigh_in_rounds', topic: 'halving outer × full inner', short: 'halving × full', unit: 'loop iterations', nWhat: 'the length of <code>nums</code>',
    time: 'O(n log n)', space: 'O(1)', ns: [16, 32, 64], run: runDrill3, input: dList,
    choices: ['O(n²) time, O(1) space', 'O(log n) time, O(1) space', 'O(n log n) time, O(1) space', 'O(n log n) time, O(log n) space'],
    reason: function (r) {
      return 'The outer loop halves size (n, n/2, n/4, … while it is above 1), so it runs about log₂ n times: <b>' + (r[0].steps / r[0].n) + '</b> rounds at n = ' + r[0].n + ', <b>' + (r[2].steps / r[2].n) +
        '</b> at ' + r[2].n + '. Every round runs the inner loop over all n items, whatever size is, so the work is n × log₂ n = <b>' + r[0].steps + '</b>, <b>' + r[1].steps + '</b>, <b>' + r[2].steps +
        '</b>. Doubling n more than doubles it (' + dRatio(r[0].steps, r[1].steps) + ', then ' + dRatio(r[1].steps, r[2].steps) + '): the log₂ n factor is the extra. It is not n² because the outer loop is log n long, not n long. Space: O(1).';
    }
  },
  {
    id: 4, fn: 'has_duplicate', topic: 'hidden slice and scan', short: 'hidden slice', unit: 'items copied and compared', nWhat: 'the number of items',
    time: 'O(n²)', space: 'O(n)', ns: [10, 20, 40], run: runDrill4, input: dList,
    choices: ['O(n) time, O(1) space', 'O(n²) time, O(1) space', 'O(n log n) time, O(n) space', 'O(n²) time, O(n) space'],
    reason: function (r) {
      return 'One line hides two loops. <code>nums[i+1:]</code> copies the n − 1 − i items after position i, and the <code>in</code> test then scans that copy. On a list with no duplicate the scan never stops early, so step i costs 2(n − 1 − i) and the total is n(n − 1): <b>' +
        r[0].steps + '</b>, <b>' + r[1].steps + '</b>, <b>' + r[2].steps + '</b>. Doubling n multiplies it by about four (' + dRatio(r[0].steps, r[1].steps) + ', then ' + dRatio(r[1].steps, r[2].steps) +
        '). Space: the copy made at i = 0 is the largest, n − 1 items (measured <b>' + r[0].peak + '</b> at n = ' + r[0].n + ', <b>' + r[2].peak + '</b> at ' + r[2].n + '), and it is freed before the next step, so the peak is O(n).';
    }
  },
  {
    id: 5, fn: 'halving_sum', topic: 'branch twice while halving', short: 'branch + halve', unit: 'calls', nWhat: 'the length of <code>nums</code>',
    time: 'O(n)', space: 'O(log n)', ns: [16, 32, 64], run: runDrill5, input: dList,
    choices: ['O(2ⁿ) time, O(n) space', 'O(n) time, O(log n) space', 'O(log n) time, O(1) space', 'O(n log n) time, O(log n) space'],
    reason: function (r) {
      return 'Each call makes two calls on half the range, so the calls per level double (1, 2, 4, …) while the range halves, until a range holds one item: log₂ n + 1 levels. Their total is 1 + 2 + 4 + … + n = 2n − 1: <b>' +
        r[0].steps + '</b>, <b>' + r[1].steps + '</b>, <b>' + r[2].steps + '</b>, and doubling n doubles it (' + dRatio(r[0].steps, r[1].steps) + '). Branching twice is not exponential here because the depth is only log₂ n, so the bottom level has 2^(log₂ n) = n calls, not 2ⁿ. ' +
        'Space: only one path from the root to a leaf is alive at once; the deepest was <b>' + r[0].peak + '</b> frames at n = ' + r[0].n + ' and <b>' + r[2].peak + '</b> at ' + r[2].n + ', log₂ n + 1, so O(log n).';
    }
  },
  {
    id: 6, fn: 'heaviest', topic: 'n × n grid scan', short: 'n × n grid', unit: 'cells visited', nWhat: 'the side of the grid, which holds n × n cells',
    time: 'O(n²)', space: 'O(1)', ns: [10, 20, 40], run: runDrill6, input: dGrid,
    choices: ['O(n) time, O(1) space', 'O(n² log n) time, O(1) space', 'O(n²) time, O(1) space', 'O(n²) time, O(n) space'],
    reason: function (r) {
      return 'The two loops visit each of the n rows and, inside it, each of the n cells: n × n = <b>' + r[0].steps + '</b>, <b>' + r[1].steps + '</b>, <b>' + r[2].steps +
        '</b> cells. Doubling the side multiplies the cells by exactly four (' + dRatio(r[0].steps, r[1].steps) + '). The extra storage is <code>best</code>, one number: O(1). ' +
        'Note what n means: it is the grid\'s side, and the data holds N = n² cells, so the scan is linear in the data. Any answer must look at every cell, because any cell may hold the maximum.';
    }
  }
];
DRILLS.forEach(function (d) {
  d.rows = dRows(d);
  d.expect = d.time + ' time, ' + d.space + ' space';
});

/* the three quiz snippets (new code, same rules), counted the same way */
function quizBranch(n) { var c = 0; (function f(m) { c++; return m <= 1 ? 1 : f(m - 1) + f(m - 1); })(n); return c; }
function quizHalvingRounds(n) {
  var work = 0, rounds = 0;
  for (var size = n; size >= 1; size = Math.floor(size / 2)) { rounds++; for (var k = 0; k < size; k++) work++; }
  return { work: work, rounds: rounds };
}
/* recursive binary search that passes slices; counts the items copied while searching for a value above all of them */
function quizSliceSearch(nums, target) {
  var copied = 0;
  (function has(a) {
    if (a.length === 0) return false;
    var mid = Math.floor(a.length / 2);
    if (a[mid] === target) return true;
    var next = a[mid] < target ? a.slice(mid + 1) : a.slice(0, mid);
    copied += next.length;
    return has(next);
  })(nums);
  return copied;
}

var FACTS = {
  q1_n: 12, q1_calls: quizBranch(12), q1_next: quizBranch(13),
  q2_n: 64, q2_work: quizHalvingRounds(64).work, q2_rounds: quizHalvingRounds(64).rounds,
  q2_nlogn: 64 * quizHalvingRounds(64).rounds,
  q3_n: 64, q3_copied: quizSliceSearch(dList(64), 1000)
};
DRILLS.forEach(function (d) {
  d.rows.forEach(function (r) { FACTS['d' + d.id + '_c' + r.n] = r.steps; });
});
/* PURE:end */

function drillTable(d) {
  var h = '<table class="drill-table"><thead><tr><th>Input size</th><th>Counted ' + d.unit + '</th><th>Ratio to the row above</th></tr></thead><tbody>';
  d.rows.forEach(function (r, k) {
    var shown = d.id === 6 ? r.n + ' × ' + r.n : r.n;
    h += '<tr><td>' + r.label + ' = ' + shown + '</td><td>' + r.steps + '</td><td>' + (k === 0 ? 'baseline' : dRatio(d.rows[k - 1].steps, r.steps)) + '</td></tr>';
  });
  return h + '</tbody></table>';
}

function mountDrills() {
  DRILLS.forEach(function (d) {
    var host = $('#drill-card-' + d.id);
    if (!host) return;
    mountPredict(host, [{ d: d, expect: d.expect }], {
      question: function (x) { return 'Read <code>' + x.d.fn + '</code> above. What does it cost in time and in auxiliary space, with n as ' + x.d.nWhat + '?'; },
      choices: function (x) { return x.d.choices; },
      draw: function () { return null; },
      /* the counted table and the argument exist only after the learner has answered */
      why: function (x) { return 'Counted by running it: ' + drillTable(x.d) + '<div class="drill-verdict"><b>' + x.d.expect + '.</b> ' + x.d.reason(x.d.rows) + '</div>'; }
    });
  });
}

function mountHero() {
  var svg = $('#heroDrills');
  if (!svg) return;
  var num = $('#heroNum');
  var cap = $('#heroCap');

  function drawHero(idx) {
    svg.innerHTML = '';
    var d = DRILLS[idx];
    if (num) num.textContent = d.id;
    if (cap) cap.textContent = 'Drill ' + d.id + ': ' + d.topic;

    S('text', { x: 280, y: 24, class: 'ha-muted', 'text-anchor': 'middle' }, svg).textContent =
      'Six scenarios to test time and space intuition';

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
      t2.textContent = DRILLS[i].short;
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
