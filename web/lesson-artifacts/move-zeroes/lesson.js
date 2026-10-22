/* ================= Move Zeroes: the lesson =================
   Linear traversal with read and write pointers (stable compaction).
   Every number the prose quotes is computed below by running instrumented code,
   re-run by check.py in Python and Node.js. */

/* PURE:begin */
function simTwoPass(nums) {
  var a = nums.slice();
  var write = 0, writesPass1 = 0, writesPass2 = 0;
  for (var read = 0; read < a.length; read++) {
    if (a[read] !== 0) {
      a[write] = a[read];
      writesPass1++;
      write++;
    }
  }
  for (var i = write; i < a.length; i++) {
    a[i] = 0;
    writesPass2++;
  }
  return {
    result: a,
    write: write,
    writesPass1: writesPass1,
    writesPass2: writesPass2,
    totalWrites: writesPass1 + writesPass2
  };
}

function simMistake(nums) {
  var a = nums.slice();
  var write = 0, writes = 0;
  for (var read = 0; read < a.length; read++) {
    if (a[read] !== 0) {
      a[write] = a[read];
      writes++;
      write++;
    }
  }
  return {
    result: a,
    write: write,
    writes: writes
  };
}

function simSwap(nums) {
  var a = nums.slice();
  var write = 0, swaps = 0;
  for (var read = 0; read < a.length; read++) {
    if (a[read] !== 0) {
      var tmp = a[write];
      a[write] = a[read];
      a[read] = tmp;
      swaps++;
      write++;
    }
  }
  return {
    result: a,
    write: write,
    swaps: swaps,
    writes: swaps * 2
  };
}

var EX_INPUT = [0, 1, 0, 3, 12];
var exRes = simTwoPass(EX_INPUT);
var exMistake = simMistake(EX_INPUT);
var exSwap = simSwap(EX_INPUT);

var COST_PTS = [];
for (var z = 0; z <= 64; z += 8) {
  var nonZeroes = 64 - z;
  var tpWrites = (64 - z) + z; // exactly 64 writes
  var swapWrites = nonZeroes * 2;
  COST_PTS.push([z, swapWrites, tpWrites]);
}

var FACTS = {
  exWritesPass1: exRes.writesPass1,
  exWritesPass2: exRes.writesPass2,
  exTotalWrites: exRes.totalWrites,
  exMistakeStr: '[' + exMistake.result.join(', ') + ']',
  exSolutionStr: '[' + exRes.result.join(', ') + ']',
  staleSlotsCount: EX_INPUT.length - exRes.write,
  swapWrites64Rare: 64 * 2,
  twoPassWrites64: 64,
  swapWrites64Dominant: (64 - 60) * 2
};
/* PURE:end */

var CASES = [
  [0, 1, 0, 3, 12],
  [0],
  [1, 2, 3],
  [0, 0, 0, 1],
  [4, 0, 5, 0, 0, 6]
];

(function selfCheck() {
  var seed = 20261020;
  function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  var testLists = CASES.slice();
  for (var t = 0; t < 60; t++) {
    var len = Math.floor(rnd() * 12) + 1;
    var arr = [];
    for (var k = 0; k < len; k++) {
      arr.push(rnd() < 0.4 ? 0 : Math.floor(rnd() * 20) + 1);
    }
    testLists.push(arr);
  }
  testLists.forEach(function(arr) {
    var want = arr.filter(function(x) { return x !== 0; });
    while (want.length < arr.length) want.push(0);
    var wantStr = want.join(',');
    var res2 = simTwoPass(arr);
    if (res2.result.join(',') !== wantStr) throw new Error('two-pass failed on ' + JSON.stringify(arr));
    if (res2.totalWrites !== arr.length) throw new Error('total writes did not equal n on ' + JSON.stringify(arr));
    var resSwap = simSwap(arr);
    if (resSwap.result.join(',') !== wantStr) throw new Error('swap failed on ' + JSON.stringify(arr));
  });
})();

/* ---------- the region invariant ---------- */
var MZ_INV = [
  ['compacted non-zeroes', 'nums[0..write) holds only non-zeroes in their original relative order', function(s) {
    var l = s.lanes[0];
    var w = l.marks.write;
    if (w === undefined || w === null) return true;
    for (var i = 0; i < w; i++) {
      if (l.items[i] && l.items[i].v === '0') return false;
    }
    return true;
  }],
  ['read bounds write', 'write never overtakes read (write <= read + 1)', function(s) {
    var l = s.lanes[0];
    var r = l.marks.read;
    var w = l.marks.write;
    if (r === undefined || w === undefined || r === null || w === null) return true;
    return w <= r + 1;
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
function twoPassSteps(initial, omitPass2) {
  var A = initial.slice();
  var N = A.length;
  var M = new Lanes([{ id: 'a', kind: 'row', label: 'nums', cap: N }], {
    fields: function() {
      return [
        ['read', curRead >= 0 && curRead < N ? curRead : (curRead >= N ? 'done' : '0')],
        ['write', curWrite],
        ['writes', writes]
      ];
    }
  });
  var R = recorder(M);
  var curRead = 0, curWrite = 0, writes = 0;
  var items = [];
  for (var k = 0; k < N; k++) {
    items.push(M.put('a', k, A[k]));
  }
  M.mark('a', 'read', 0);
  M.mark('a', 'write', 0);
  M.span('a', 'non-zeroes', 0, -1);
  R.rec('Initial array: <code>nums = [' + A.join(', ') + ']</code>. <code>write = 0</code>, <code>read = 0</code>.', {
    hi: ['read', 'write'],
    done: false
  });

  for (curRead = 0; curRead < N; curRead++) {
    M.mark('a', 'read', curRead);
    var val = A[curRead];
    if (val !== 0) {
      A[curWrite] = val;
      M.set(items[curWrite], val);
      M.tone(items[curWrite], 'good');
      writes++;
      curWrite++;
      M.mark('a', 'write', curWrite < N ? curWrite : null);
      M.span('a', 'non-zeroes', 0, curWrite - 1);
      R.rec('<code>nums[' + curRead + '] = ' + val + '</code> (non-zero): write to <code>nums[' + (curWrite - 1) + ']</code> and advance <code>write</code> to ' + curWrite + '.', {
        hi: ['read', 'write', laneHi(items[curWrite - 1])],
        done: false
      });
      M.tone(items[curWrite - 1], null);
    } else {
      M.tone(items[curRead], 'bad');
      R.rec('<code>nums[' + curRead + '] = 0</code>: zero skipped during pass 1. <code>write</code> remains at ' + curWrite + '.', {
        hi: ['read', laneHi(items[curRead])],
        done: false
      });
      M.tone(items[curRead], null);
    }
  }

  M.mark('a', 'read', null);
  if (omitPass2) {
    for (var j = curWrite; j < N; j++) {
      M.tone(items[j], 'bad');
    }
    R.rec('Pass 1 finished with <code>write = ' + curWrite + '</code>. Trap: omitting pass 2 leaves ' + (N - curWrite) + ' stale slot(s) at the tail: <code>[' + A.join(', ') + ']</code>.', {
      hi: ['lane:a'],
      done: true
    });
  } else {
    R.rec('Pass 1 complete. <code>nums[0..' + curWrite + ')</code> contains all ' + curWrite + ' non-zero element(s). Pass 2 begins: fill trailing slots with 0.', {
      hi: ['write'],
      done: false
    });
    for (var i = curWrite; i < N; i++) {
      A[i] = 0;
      M.set(items[i], 0);
      M.tone(items[i], 'good');
      writes++;
      R.rec('Pass 2: fill tail slot <code>nums[' + i + '] = 0</code>.', {
        hi: [laneHi(items[i])],
        done: false
      });
    }
    R.rec('All zeroes relocated to the end: <code>nums = [' + A.join(', ') + ']</code>. Exact write count: ' + writes + ' (one per slot).', {
      hi: ['lane:a'],
      done: true
    });
  }
  return R.steps;
}

/* ---------- 1. by hand widget ---------- */
function mountByHand(w) {
  var INITIAL = [0, 1, 0, 3, 12];
  var host = w.querySelector('.lvhost');
  var hint = $('#byhandHint');
  var nums, write, read, fillIdx;

  function render() {
    var h = '<div style="display:flex;gap:10px;justify-content:center;padding:16px 0;">';
    for (var i = 0; i < nums.length; i++) {
      var isWrite = i === write && read < nums.length;
      var isRead = i === read;
      var isZero = nums[i] === 0;
      var bg = 'var(--card)';
      var stroke = 'var(--hair2)';
      if (i < write) stroke = 'var(--fam)';
      h += '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">' +
        '<div style="width:54px;height:54px;border-radius:10px;border:2px solid ' + stroke + ';background:' + bg + ';display:flex;align-items:center;justify-content:center;font:600 16px monospace;color:' + (isZero ? 'var(--mut)' : 'var(--fg)') + ';">' + nums[i] + '</div>' +
        '<div style="font:500 11px monospace;color:var(--mut);">idx ' + i + '</div>' +
        '<div style="font:500 11px monospace;color:var(--fam);height:16px;">' + (isWrite && isRead ? 'w, r' : (isWrite ? 'write' : (isRead ? 'read' : ''))) + '</div>' +
        '</div>';
    }
    h += '</div>';
    host.innerHTML = h;
    label();
  }

  function label() {
    var btnCompact = w.querySelector('[data-op="compact"]');
    var btnSkip = w.querySelector('[data-op="skip"]');
    var btnFill = w.querySelector('[data-op="fill"]');

    if (read < nums.length) {
      btnCompact.disabled = false;
      btnSkip.disabled = false;
      btnFill.disabled = true;
      hint.textContent = 'Slot ' + read + ' holds ' + nums[read] + (nums[read] !== 0 ? ': click compact to write to nums[' + write + ']' : ': click skip zero');
    } else if (fillIdx < nums.length) {
      btnCompact.disabled = true;
      btnSkip.disabled = true;
      btnFill.disabled = false;
      hint.textContent = 'Pass 1 done! Click fill to write 0 into slot ' + fillIdx;
    } else {
      btnCompact.disabled = true;
      btnSkip.disabled = true;
      btnFill.disabled = true;
      hint.textContent = 'Finished! [1, 3, 12, 0, 0] in place with O(1) space';
    }
  }

  function reset() {
    nums = INITIAL.slice();
    write = 0;
    read = 0;
    fillIdx = 0;
    render();
  }

  w.querySelector('[data-op="compact"]').addEventListener('click', function() {
    if (read >= nums.length) return;
    if (nums[read] === 0) {
      hint.textContent = 'nums[' + read + '] is 0! Skip it — do not write zero to write.';
      return;
    }
    nums[write] = nums[read];
    write++;
    read++;
    if (read === nums.length) fillIdx = write;
    render();
  });

  w.querySelector('[data-op="skip"]').addEventListener('click', function() {
    if (read >= nums.length) return;
    if (nums[read] !== 0) {
      hint.textContent = 'nums[' + read + '] is non-zero (' + nums[read] + ')! You must compact it, not skip it.';
      return;
    }
    read++;
    if (read === nums.length) fillIdx = write;
    render();
  });

  w.querySelector('[data-op="fill"]').addEventListener('click', function() {
    if (read < nums.length || fillIdx >= nums.length) return;
    nums[fillIdx] = 0;
    fillIdx++;
    render();
  });

  w.querySelector('.reset').addEventListener('click', reset);
  reset();
}

/* ---------- 2. predict widget ---------- */
var PREDICT = [
  {
    k: 2,
    nums: [0, 1, 0, 3, 12],
    expect: 'write = 1, read = 2',
    choices: [
      'write = 0, read = 2',
      'write = 1, read = 2',
      'write = 2, read = 2',
      'write = 3, read = 2'
    ],
    why: function() {
      return 'Having scanned index 0 (value 0) and index 1 (value 1), exactly one non-zero has been written, so write stands at 1 while read stands at 2.';
    }
  },
  {
    k: 5,
    nums: [0, 1, 0, 3, 12],
    expect: '[1, 3, 12, 3, 12]',
    choices: [
      '[0, 1, 0, 3, 12]',
      '[1, 3, 12, 0, 0]',
      '[1, 3, 12, 0, 12]',
      '[1, 3, 12, 3, 12]'
    ],
    why: function() {
      return 'Pass 1 only writes to indices 0, 1, and 2 with values 1, 3, and 12. Slots 3 and 4 were never touched, so they still hold their original values 3 and 12.';
    }
  },
  {
    k: 100,
    nums: [0, 0, 0, 1],
    expect: 'write = 1, 3 zeroes to fill',
    choices: [
      'write = 0, 4 zeroes to fill',
      'write = 1, 3 zeroes to fill',
      'write = 3, 1 zero to fill',
      'write = 4, 0 zeroes to fill'
    ],
    why: function() {
      return 'There is only 1 non-zero element in [0, 0, 0, 1]. write increments once to 1, leaving 4 − 1 = 3 zeroes to be reconstructed in pass 2.';
    }
  }
];

function mountGuess(host) {
  mountPredict(host, PREDICT, {
    question: function(c) {
      if (c.k === 2) return 'Run pass 1 on <code>[0, 1, 0, 3, 12]</code>. When <code>read</code> reaches index 2 (after inspecting 0, 1, and 0), where do <code>write</code> and <code>read</code> stand?';
      if (c.k === 5) return 'At the end of pass 1 on <code>[0, 1, 0, 3, 12]</code> (before pass 2 runs), what are the contents of <code>nums</code>?';
      return 'For an array of 4 elements <code>[0, 0, 0, 1]</code> with 3 zeroes, what is <code>write</code> and how many tail zeroes remain to be filled?';
    },
    choices: function(c) { return c.choices; },
    draw: function(view, c) {
      var row = el('div', 'pl-mini', '<span>input: [' + c.nums.join(', ') + ']</span>');
      view.appendChild(row);
      return {
        reveal: function() {
          row.innerHTML = '<span>input: [' + c.nums.join(', ') + ']</span><span>expected: ' + c.expect + '</span>';
        }
      };
    },
    why: function(c) { return c.why(); }
  });
}

/* ---------- 3. cost comparison plot ---------- */
function mountCost() {
  costChart($('#cost'), {
    names: [
      'one-pass swap: 2·(n − zeroes) writes',
      'compact-and-fill: exactly n writes'
    ],
    ylabel: 'memory writes performed',
    pts: COST_PTS,
    xlabel: 'zeroes present (in an array of 64 elements)',
    xticks: [0, 16, 32, 48, 64],
    aria: 'Memory writes comparison: compact-and-fill always performs exactly 64 writes, while swap performs up to 128 writes when zeroes are rare.'
  });
  $('#costNote').innerHTML = 'Counted by running instrumented code: at 0 zeroes in 64 elements, the swap version performs <b>128</b> writes (2 · 64) while compact-and-fill performs <b>64</b> writes. At 32 zeroes both perform 64 writes, and when zeroes dominate (60 zeroes), swap performs only <b>8</b> writes. Two-pass is strictly optimal for write operations when zeroes are few.';
}

/* ---------- 4. hero animation ---------- */
function heroTrain() {
  var svg = $('#heroTrain');
  if (!svg) return;
  var bw = 70, bh = 52, gap = 14, x0 = 77, y = 70;
  var ax = function(i) { return x0 + i * (bw + gap); };

  var h = '<text class="ht-lab" x="' + x0 + '" y="42">freight train cargo slots: [0, 1, 0, 3, 12]</text>';
  for (var i = 0; i < 5; i++) {
    h += '<rect class="ht-cell" data-i="' + i + '" x="' + ax(i) + '" y="' + y + '" width="' + bw + '" height="' + bh + '" rx="10"/>' +
      '<text class="ht-val" data-i="' + i + '" x="' + (ax(i) + bw / 2) + '" y="' + (y + bh / 2) + '"></text>' +
      '<text class="ht-tag" data-i="' + i + '" data-t="write" x="' + (ax(i) + bw / 2) + '" y="152">write</text>' +
      '<text class="ht-tag" data-i="' + i + '" data-t="read" x="' + (ax(i) + bw / 2) + '" y="168">read</text>';
  }
  h += '<text class="ht-lab" id="htPhase" x="' + x0 + '" y="196"></text>';
  svg.innerHTML = h;

  var num = $('#heroNum'), unit = $('#heroUnit'), cap = $('#heroCap');
  var FRAMES = [
    { arr: [0, 1, 0, 3, 12], w: 0, r: 0, n: 0, p: 'Slot 0 holds 0: empty car skipped by inspector' },
    { arr: [1, 1, 0, 3, 12], w: 1, r: 1, n: 1, p: 'Slot 1 holds 1: compacted forward to slot 0' },
    { arr: [1, 1, 0, 3, 12], w: 1, r: 2, n: 1, p: 'Slot 2 holds 0: empty car skipped' },
    { arr: [1, 3, 0, 3, 12], w: 2, r: 3, n: 2, p: 'Slot 3 holds 3: compacted forward to slot 1' },
    { arr: [1, 3, 12, 3, 12], w: 3, r: 4, n: 3, p: 'Slot 4 holds 12: compacted forward to slot 2' },
    { arr: [1, 3, 12, 0, 12], w: 3, r: -1, n: 3, p: 'Pass 2: fill tail slot 3 with 0' },
    { arr: [1, 3, 12, 0, 0], w: 3, r: -1, n: 3, p: 'Pass 2: fill tail slot 4 with 0' },
    { arr: [1, 3, 12, 0, 0], w: 3, r: -1, n: 3, p: 'Done: [1, 3, 12, 0, 0] in O(n) time and O(1) space' }
  ];

  function show(k) {
    var fr = FRAMES[k] || FRAMES[FRAMES.length - 1];
    svg.querySelectorAll('.ht-cell').forEach(function(el) {
      var idx = +el.dataset.i;
      el.classList.toggle('lit', idx < fr.w);
      el.classList.toggle('zero', fr.arr[idx] === 0);
      el.classList.toggle('done', k === 7);
    });
    svg.querySelectorAll('.ht-val').forEach(function(el) {
      var idx = +el.dataset.i;
      el.textContent = fr.arr[idx];
      el.classList.toggle('zero', fr.arr[idx] === 0);
    });
    svg.querySelectorAll('.ht-tag').forEach(function(el) {
      var idx = +el.dataset.i;
      var t = el.dataset.t;
      if (t === 'write') {
        el.style.opacity = fr.w === idx ? 1 : 0;
      } else if (t === 'read') {
        el.style.opacity = fr.r === idx ? 1 : 0;
      }
    });
    num.textContent = fr.n;
    unit.textContent = 'kept';
    cap.textContent = fr.p;
    var ph = $('#htPhase');
    if (ph) ph.textContent = fr.p;
  }

  if (reduce || !M || !M.animate) {
    show(7);
    return;
  }
  var last = -1;
  M.animate(0, 8, {
    duration: 8 * 1.8,
    ease: 'linear',
    repeat: Infinity,
    onUpdate: function(v) {
      var k = Math.min(7, Math.floor(v));
      if (k !== last) {
        last = k;
        show(k);
      }
    }
  });
}

/* ---------- assemble ---------- */
(function() {
  readPal();
  mountLesson();
  mountByHand($('#byhand'));
  mountGuess($('#predict'));
  mountPlayerTabs($('#trapper'), [
    { name: 'Two-pass compact-and-fill', steps: function() { return twoPassSteps([0, 1, 0, 3, 12], false); } },
    { name: 'Omit pass 2 (trap)', steps: function() { return twoPassSteps([0, 1, 0, 3, 12], true); } }
  ], function(h, o) { return new LanePlayer(h, Object.assign(o, { inv: MZ_INV })); }, { id: 'trap' });
  $('#trapNote').innerHTML = 'Omitting pass 2 leaves stale values in the tail: <b>' + FACTS.exMistakeStr + '</b> instead of <b>' + FACTS.exSolutionStr + '</b>. Run on the lesson\'s test cases, the mistake fails on every array containing zeroes.';
  mountCost();
  mountLaneTabs($('#stepper'), CASES.map(function(c) {
    return {
      name: '[' + c.join(', ') + ']',
      steps: function() { return twoPassSteps(c, false); }
    };
  }), { id: 'stepper', inv: MZ_INV });
  heroTrain();
  kinetic();
  riseIn();
})();
