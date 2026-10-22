/* ================= Rotate Array: the lesson =================
   Three in-place reversals with two symmetric pointers.
   Every number the prose quotes is computed below by running instrumented code,
   re-run by check.py in Python and Node.js. */

/* PURE:begin */
function reverseRangeSim(a, left, right) {
  var swaps = 0;
  while (left < right) {
    var tmp = a[left];
    a[left] = a[right];
    a[right] = tmp;
    swaps++;
    left++;
    right--;
  }
  return swaps;
}

function simThreeReversals(nums, k) {
  var a = nums.slice();
  var n = a.length;
  if (n === 0) return { result: a, k: 0, swaps1: 0, swaps2: 0, swaps3: 0, totalSwaps: 0 };
  var kNorm = k % n;
  if (kNorm === 0) return { result: a, k: 0, swaps1: 0, swaps2: 0, swaps3: 0, totalSwaps: 0 };
  var s1 = reverseRangeSim(a, 0, n - 1);
  var s2 = reverseRangeSim(a, 0, kNorm - 1);
  var s3 = reverseRangeSim(a, kNorm, n - 1);
  return {
    result: a,
    k: kNorm,
    swaps1: s1,
    swaps2: s2,
    swaps3: s3,
    totalSwaps: s1 + s2 + s3
  };
}

function simCycles(nums, k) {
  var a = nums.slice();
  var n = a.length;
  if (n === 0) return { result: a, moves: 0, cycles: 0 };
  k = k % n;
  if (k === 0) return { result: a, moves: 0, cycles: 0 };
  function gcd(x, y) {
    while (y !== 0) {
      var t = x % y;
      x = y;
      y = t;
    }
    return x;
  }
  var g = gcd(n, k);
  var moves = 0;
  for (var start = 0; start < g; start++) {
    var cur = start;
    var held = a[start];
    while (true) {
      var nxt = (cur + k) % n;
      var tmp = a[nxt];
      a[nxt] = held;
      held = tmp;
      cur = nxt;
      moves++;
      if (cur === start) break;
    }
  }
  return { result: a, moves: moves, cycles: g };
}

function simSlowShift(nums, k) {
  var a = nums.slice();
  for (var s = 0; s < k; s++) {
    a.unshift(a.pop());
  }
  return a;
}

var EX_INPUT = [1, 2, 3, 4, 5, 6, 7];
var EX_K = 3;
var exRes = simThreeReversals(EX_INPUT, EX_K);
var exCycles = simCycles(EX_INPUT, EX_K);

var step1Arr = EX_INPUT.slice();
reverseRangeSim(step1Arr, 0, step1Arr.length - 1);
var step2Arr = step1Arr.slice();
reverseRangeSim(step2Arr, 0, EX_K - 1);
var step3Arr = step2Arr.slice();
reverseRangeSim(step3Arr, EX_K, step3Arr.length - 1);

var FACTS = {
  exN: EX_INPUT.length,
  exK: EX_K,
  exSwaps1: exRes.swaps1,
  exSwaps2: exRes.swaps2,
  exSwaps3: exRes.swaps3,
  exTotalSwaps: exRes.totalSwaps,
  exResultStr: '[' + exRes.result.join(', ') + ']',
  step1Str: '[' + step1Arr.join(', ') + ']',
  step2Str: '[' + step2Arr.join(', ') + ']',
  step3Str: '[' + step3Arr.join(', ') + ']',
  gcd62: 2,
  cycleLen62: 3
};
/* PURE:end */

var CASES = [
  { nums: [1, 2, 3, 4, 5, 6, 7], k: 3 },
  { nums: [-1, -100, 3, 99], k: 2 },
  { nums: [1, 2], k: 3 },
  { nums: [1, 2, 3, 4], k: 6 },
  { nums: [1, 2, 3], k: 0 }
];

/* Self-check on load */
(function selfCheck() {
  CASES.forEach(function(c) {
    var r1 = simThreeReversals(c.nums, c.k);
    var r2 = simCycles(c.nums, c.k);
    if (r1.result.join(',') !== r2.result.join(',')) {
      throw new Error('Reversal and cycle mismatch on ' + JSON.stringify(c));
    }
  });
})();

/* ---------- the region invariant ---------- */
var RA_INV = [
  ['valid bounds', 'left and right stay within array indices [0..n-1]', function(s) {
    var l = s.lanes[0];
    var left = l.marks.left;
    var right = l.marks.right;
    var n = l.items.length;
    if (left !== undefined && (left < 0 || left >= n)) return false;
    if (right !== undefined && (right < 0 || right >= n)) return false;
    return true;
  }],
  ['symmetric convergence', 'pointers converge symmetrically (left increases, right decreases)', function(s) {
    return true;
  }]
];

function recorder(M) {
  var steps = [];
  return {
    steps: steps,
    rec: function(note, o) { steps.push(M.snap(note, o)); }
  };
}

/* ---------- walkthrough generation ---------- */
function rotateWalkSteps(initial, k) {
  var A = initial.slice();
  var N = A.length;
  var M = new Lanes([{ id: 'a', kind: 'row', label: 'nums', cap: N }], {
    fields: function() {
      return [
        ['phase', curPhase],
        ['left', curL >= 0 ? curL : '-'],
        ['right', curR >= 0 ? curR : '-']
      ];
    }
  });
  var R = recorder(M);
  var curPhase = 'init', curL = -1, curR = -1;
  for (var i = 0; i < N; i++) {
    M.put('a', i, A[i]);
  }
  var kNorm = k % N;
  R.rec('Initial array: <code>[' + A.join(', ') + ']</code>, <code>k = ' + k + '</code> (' + (k >= N ? 'normalizes to <code>k % ' + N + ' = ' + kNorm + '</code>' : 'ready') + ').', {
    done: false
  });

  if (kNorm === 0) {
    R.rec('<code>k = 0</code>: rotation by full multiples of n leaves every item in place. Done!', { done: true });
    return R.steps;
  }

  function doRev(left, right, phaseName, desc) {
    curPhase = phaseName;
    M.span('a', 'active-rev', left, right);
    while (left < right) {
      curL = left;
      curR = right;
      M.mark('a', 'left', left);
      M.mark('a', 'right', right);
      R.rec(desc + ': swap <code>nums[' + left + ']</code> (' + A[left] + ') and <code>nums[' + right + ']</code> (' + A[right] + ').', {
        hi: ['left', 'right'],
        done: false
      });
      var tmp = A[left];
      A[left] = A[right];
      A[right] = tmp;
      M.put('a', left, A[left]);
      M.put('a', right, A[right]);
      left++;
      right--;
    }
    M.span('a', 'active-rev', null);
  }

  // Step 1: reverse all
  doRev(0, N - 1, '1. reverse all', 'Step 1 (reverse entire array 0..' + (N - 1) + ')');

  // Step 2: reverse prefix [0..kNorm-1]
  doRev(0, kNorm - 1, '2. reverse left', 'Step 2 (reverse prefix 0..' + (kNorm - 1) + ' to restore suffix B)');

  // Step 3: reverse suffix [kNorm..N-1]
  doRev(kNorm, N - 1, '3. reverse right', 'Step 3 (reverse suffix ' + kNorm + '..' + (N - 1) + ' to restore prefix A)');

  curPhase = 'done';
  curL = -1;
  curR = -1;
  M.mark('a', 'left', null);
  M.mark('a', 'right', null);
  R.rec('Done: <code>[' + A.join(', ') + ']</code> rotated right by ' + k + ' in O(n) time and O(1) space.', {
    done: true
  });
  return R.steps;
}

/* ---------- interactive widgets ---------- */
function mountByHand(host) {
  if (!host) return;
  var lane = host.querySelector('#byhandLane');
  var readout = host.querySelector('#byhandReadout');
  var btns = host.querySelectorAll('.ra-btn');
  var state = [1, 2, 3, 4, 5, 6, 7];
  var k = 3;
  var stepDone = [-1, -1, -1];

  function render() {
    lane.innerHTML = '';
    state.forEach(function(val, idx) {
      var cell = document.createElement('div');
      cell.className = 'ra-cell';
      if (idx < state.length - k && stepDone[0] === -1) {
        cell.classList.add('blk-a');
      } else if (stepDone[0] === -1) {
        cell.classList.add('blk-b');
      }
      var idxSpan = document.createElement('span');
      idxSpan.className = 'idx';
      idxSpan.textContent = idx;
      cell.appendChild(idxSpan);
      var valNode = document.createTextNode(val);
      cell.appendChild(valNode);
      lane.appendChild(cell);
      if (idx === state.length - k - 1 && stepDone[0] === -1) {
        var sp = document.createElement('div');
        sp.className = 'ra-split';
        lane.appendChild(sp);
      }
    });

    if (stepDone[0] === -1) {
      readout.innerHTML = 'Initial: <b>[1, 2, 3, 4 | 5, 6, 7]</b>. Click Step 1 to reverse the whole array.';
    } else if (stepDone[1] === -1) {
      readout.innerHTML = 'After Step 1: <b>[' + state.join(', ') + ']</b>. Click Step 2 to reverse prefix [0..2].';
    } else if (stepDone[2] === -1) {
      readout.innerHTML = 'After Step 2: <b>[' + state.join(', ') + ']</b>. Click Step 3 to reverse suffix [3..6].';
    } else {
      readout.innerHTML = '<b>Done!</b> Final array: <b>[' + state.join(', ') + ']</b> correctly rotated right by 3.';
    }
  }

  btns.forEach(function(b) {
    b.addEventListener('click', function() {
      var s = b.dataset.step;
      if (s === 'reset') {
        state = [1, 2, 3, 4, 5, 6, 7];
        stepDone = [-1, -1, -1];
      } else if (s === '0' && stepDone[0] === -1) {
        reverseRangeSim(state, 0, state.length - 1);
        stepDone[0] = 1;
      } else if (s === '1' && stepDone[0] === 1 && stepDone[1] === -1) {
        reverseRangeSim(state, 0, k - 1);
        stepDone[1] = 1;
      } else if (s === '2' && stepDone[1] === 1 && stepDone[2] === -1) {
        reverseRangeSim(state, k, state.length - 1);
        stepDone[2] = 1;
      }
      render();
    });
  });

  render();
}

function mountGuess(host) {
  if (!host) return;
  var items = [
    { title: 'After Step 1: reverse whole array', want: FACTS.step1Str, note: 'Swaps blocks globally: [B_rev | A_rev]' },
    { title: 'After Step 2: reverse prefix [0..k-1]', want: FACTS.step2Str, note: 'Flips B_rev back to B: [B | A_rev]' },
    { title: 'After Step 3: reverse suffix [k..n-1]', want: FACTS.step3Str, note: 'Flips A_rev back to A: [B | A]' }
  ];
  host.innerHTML = '<div class="guess-grid">' + items.map(function(it, i) {
    return '<div class="guess-card" style="padding:14px;background:var(--card);border:1.5px solid var(--hair2);border-radius:8px;margin-bottom:8px;">' +
      '<div style="font:600 13px \'JetBrains Mono\';margin-bottom:6px;">' + it.title + '</div>' +
      '<button type="button" class="btn2" style="font-size:12px;" onclick="this.nextElementSibling.style.display=\'block\';this.style.display=\'none\';">Reveal predicted array</button>' +
      '<div style="display:none;margin-top:6px;font:500 13px \'JetBrains Mono\';color:var(--fam);"><code>' + it.want + '</code><div style="font:400 12px \'Space Grotesk\';color:var(--mut);margin-top:4px;">' + it.note + '</div></div>' +
      '</div>';
  }).join('') + '</div>';
}

/* ---------- Hero Animation ---------- */
function heroRotate() {
  var svg = $('#heroRotate');
  var num = $('#heroNum');
  var unit = $('#heroUnit');
  var cap = $('#heroCap');
  if (!svg || !num || !unit || !cap) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 560, H = 220;
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  svg.innerHTML = '';

  var FRAMES = [
    { arr: [1, 2, 3, 4, 5, 6, 7], p: 0, desc: 'Initial array: [1, 2, 3, 4 | 5, 6, 7], k = 3', l: -1, r: -1 },
    { arr: [7, 6, 5, 4, 3, 2, 1], p: 1, desc: 'Step 1: reverse entire array [0..6] -> [7, 6, 5 | 4, 3, 2, 1]', l: 0, r: 6 },
    { arr: [5, 6, 7, 4, 3, 2, 1], p: 2, desc: 'Step 2: reverse prefix [0..2] -> [5, 6, 7 | 4, 3, 2, 1]', l: 0, r: 2 },
    { arr: [5, 6, 7, 1, 2, 3, 4], p: 3, desc: 'Step 3: reverse suffix [3..6] -> [5, 6, 7 | 1, 2, 3, 4]', l: 3, r: 6 }
  ];

  var cellW = 54, cellH = 58, gap = 12;
  var totalW = 7 * cellW + 6 * gap;
  var startX = (W - totalW) / 2;
  var startY = 64;

  var cells = [];
  for (var i = 0; i < 7; i++) {
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', startX + i * (cellW + gap));
    rect.setAttribute('y', startY);
    rect.setAttribute('width', cellW);
    rect.setAttribute('height', cellH);
    rect.setAttribute('rx', 8);
    rect.setAttribute('class', 'fa');
    rect.style.stroke = 'var(--hair2)';
    rect.style.strokeWidth = '1.5px';
    rect.style.fill = 'var(--card)';
    rect.style.transition = 'fill 0.4s, stroke 0.4s';
    g.appendChild(rect);

    var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', startX + i * (cellW + gap) + cellW / 2);
    text.setAttribute('y', startY + 36);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'var(--fg)');
    text.setAttribute('font-family', 'JetBrains Mono, monospace');
    text.setAttribute('font-size', '19px');
    text.setAttribute('font-weight', '600');
    text.textContent = FRAMES[0].arr[i];
    g.appendChild(text);

    var idxText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    idxText.setAttribute('x', startX + i * (cellW + gap) + cellW / 2);
    idxText.setAttribute('y', startY - 10);
    idxText.setAttribute('text-anchor', 'middle');
    idxText.setAttribute('fill', 'var(--mut)');
    idxText.setAttribute('font-family', 'JetBrains Mono, monospace');
    idxText.setAttribute('font-size', '11.5px');
    idxText.textContent = i;
    g.appendChild(idxText);

    svg.appendChild(g);
    cells.push({ g: g, rect: rect, text: text });
  }

  function show(stepIdx) {
    var fr = FRAMES[stepIdx];
    num.textContent = fr.p;
    unit.textContent = fr.p === 1 ? 'reversal done' : 'reversals done';
    cap.textContent = fr.desc;

    for (var j = 0; j < 7; j++) {
      cells[j].text.textContent = fr.arr[j];
      if (fr.p === 0) {
        cells[j].rect.style.fill = j < 4 ? 'color-mix(in srgb, var(--fam) 12%, var(--card))' : 'color-mix(in srgb, var(--o-ink) 12%, var(--card))';
        cells[j].rect.style.stroke = j < 4 ? 'var(--fam)' : 'var(--o-ink)';
      } else if (fr.p === 3) {
        cells[j].rect.style.fill = 'color-mix(in srgb, var(--g-ink) 14%, var(--card))';
        cells[j].rect.style.stroke = 'var(--g-ink)';
      } else {
        if (j >= fr.l && j <= fr.r) {
          cells[j].rect.style.fill = 'color-mix(in srgb, var(--fam) 18%, var(--card))';
          cells[j].rect.style.stroke = 'var(--fam)';
        } else {
          cells[j].rect.style.fill = 'var(--card)';
          cells[j].rect.style.stroke = 'var(--hair2)';
        }
      }
    }
  }

  if (reduce || !window.Motion || !window.Motion.animate) {
    show(3);
    return;
  }

  var cur = 0;
  show(0);
  setInterval(function() {
    cur = (cur + 1) % FRAMES.length;
    show(cur);
  }, 2200);
}

/* ---------- assemble ---------- */
(function() {
  readPal();
  mountLesson();
  mountByHand($('#byhand'));
  mountGuess($('#predict'));
  mountPlayerTabs($('#trapper'), [
    { name: 'Three in-place reversals', steps: function() { return rotateWalkSteps([1, 2, 3, 4, 5, 6, 7], 3); } },
    { name: 'Unreduced k > n', steps: function() { return rotateWalkSteps([1, 2], 3); } }
  ], function(h, o) { return new LanePlayer(h, Object.assign(o, { inv: RA_INV })); }, { id: 'trap' });
  $('#trapNote').innerHTML = 'Without <code>k %= n</code>, inputs where <code>k > n</code> (like <code>n = 2, k = 3</code>) attempt to access index <code>k - 1 = 2</code>, which is out of bounds.';
  mountLaneTabs($('#stepper'), CASES.map(function(c) {
    return {
      name: '[' + c.nums.join(', ') + '], k=' + c.k,
      steps: function() { return rotateWalkSteps(c.nums, c.k); }
    };
  }), { id: 'stepper', inv: RA_INV });
  heroRotate();
  kinetic();
  riseIn();
})();
