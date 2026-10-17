/* ================= Why Efficiency Matters: the lesson =================
   Gift-card matching demonstrates how growth behavior dominates hardware speed.
   Comparing every pair (Version A: O(n^2)) vs remembering seen cards (Version B: O(n))
   shows why counting operations — rather than measuring stopwatch seconds — isolates
   the algorithm from the machine.
   Every number the page shows is computed in the PURE block below and verified by check.py. */

/* PURE:begin (no DOM below this line until PURE:end) */
function countOpsA(n) {
  return (n * (n - 1)) / 2;
}

function countOpsB(n) {
  return n;
}

function crossoverN(speedup) {
  return 2 * speedup + 1;
}

/* The demo's only pair sits at the end, so Version A must walk most pairs
   before it finds it: that is where the two strategies visibly diverge. */
var DEMO_INPUT = [15, 73, 25, 40, 5, 60];
var DEMO_TARGET = 100;

function stepTraceA(nums, target) {
  var steps = [];
  var n = nums.length;
  var ops = 0;
  for (var i = 0; i < n; i++) {
    for (var j = i + 1; j < n; j++) {
      ops++;
      var sum = nums[i] + nums[j];
      var match = sum === target;
      steps.push({ i: i, j: j, sum: sum, match: match, ops: ops });
      if (match) return steps;
    }
  }
  return steps;
}

function stepTraceB(nums, target) {
  var steps = [];
  var seen = [];
  var ops = 0;
  for (var k = 0; k < nums.length; k++) {
    ops++;
    var x = nums[k];
    var needed = target - x;
    var match = seen.indexOf(needed) >= 0;
    steps.push({ k: k, val: x, needed: needed, seen: seen.slice(), match: match, ops: ops });
    if (match) return steps;
    seen.push(x);
  }
  return steps;
}

var DEMO_STEPS_A = stepTraceA(DEMO_INPUT, DEMO_TARGET);
var DEMO_STEPS_B = stepTraceB(DEMO_INPUT, DEMO_TARGET);

var PRESETS = [
  { nums: DEMO_INPUT, target: DEMO_TARGET, label: 'Pair at the end' },
  { nums: [30, 20, 15, 80, 70], target: 100, label: 'Two pairs' },
  { nums: [10, 45, 25, 80, 35, 50], target: 100, label: 'No pair' }
];

var GROWTH_SIZES = [10, 20, 50, 100, 200, 500, 1000, 2000];
var GROWTH_PTS = GROWTH_SIZES.map(function(n) {
  return [n, countOpsA(n), countOpsB(n)];
});

/* Assumed machine rates for the stopwatch widget: illustrative, 10x apart. */
var RATE_LAPTOP = 2.5e7;
var RATE_SERVER = 2.5e8;

function fmtInt(v) { return Math.round(v).toLocaleString('en-US'); }

var FACTS = {
  aOps1k: fmtInt(countOpsA(1000)),
  bOps1k: fmtInt(countOpsB(1000)),
  aOps100k: fmtInt(countOpsA(100000)),
  bOps100k: fmtInt(countOpsB(100000)),
  aGrowth100x: fmtInt(countOpsA(100000) / countOpsA(1000)),
  bGrowth100x: fmtInt(countOpsB(100000) / countOpsB(1000))
};
/* PURE:end */

/* ---------- 1. Pair Stepper Widget ---------- */

function mountPairStepper(host) {
  if (!host) return;
  var tabsHost = host.querySelector('#stepperTabs');
  var stepBtn = host.querySelector('#stepBtn');
  var resetBtn = host.querySelector('#resetBtn');
  var runBtn = host.querySelector('#runEndBtn');

  var aTilesHost = host.querySelector('#aTiles');
  var bTilesHost = host.querySelector('#bTiles');
  var aOpsBadge = host.querySelector('#aOpsBadge');
  var bOpsBadge = host.querySelector('#bOpsBadge');
  var aNote = host.querySelector('#aNote');
  var bNote = host.querySelector('#bNote');
  var chalkVals = host.querySelector('#chalkVals');

  var currentPresetIdx = 0;
  var currentStep = 0;
  var stepsA = [];
  var stepsB = [];

  function loadPreset(idx) {
    currentPresetIdx = idx;
    currentStep = 0;
    var p = PRESETS[idx];
    stepsA = stepTraceA(p.nums, p.target);
    stepsB = stepTraceB(p.nums, p.target);
    render();
  }

  PRESETS.forEach(function(p, idx) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tab';
    b.setAttribute('aria-pressed', idx === 0 ? 'true' : 'false');
    b.textContent = p.label;
    b.addEventListener('click', function() {
      tabsHost.querySelectorAll('button').forEach(function(btn, k) {
        btn.setAttribute('aria-pressed', k === idx ? 'true' : 'false');
      });
      loadPreset(idx);
    });
    tabsHost.appendChild(b);
  });

  function renderTiles(container, nums, activeMap) {
    container.innerHTML = '';
    nums.forEach(function(val, i) {
      var tile = document.createElement('div');
      var cls = 'card-tile';
      if (activeMap[i]) cls += ' ' + activeMap[i];
      tile.className = cls;
      tile.innerHTML = '<span class="c-idx">[' + i + ']</span><span class="c-val">$' + val + '</span>';
      container.appendChild(tile);
    });
  }

  function render() {
    var p = PRESETS[currentPresetIdx];
    var maxStep = Math.max(stepsA.length, stepsB.length);

    // Version A state
    var aIdx = Math.min(currentStep, stepsA.length - 1);
    var stA = stepsA[aIdx];
    var activeA = {};
    if (currentStep > 0 && stA) {
      if (stA.match) {
        activeA[stA.i] = 'pt-match';
        activeA[stA.j] = 'pt-match';
        aNote.textContent = 'Match found! $' + p.nums[stA.i] + ' + $' + p.nums[stA.j] + ' = ' + stA.sum + ' == $' + p.target + '.';
        aOpsBadge.className = 'algo-badge good';
      } else {
        activeA[stA.i] = 'pt-i';
        activeA[stA.j] = 'pt-j';
        aNote.textContent = 'Check pair [' + stA.i + ', ' + stA.j + ']: $' + p.nums[stA.i] + ' + $' + p.nums[stA.j] + ' = $' + stA.sum + ' (not $' + p.target + ').';
        aOpsBadge.className = 'algo-badge active';
      }
      aOpsBadge.textContent = stA.ops + ' operations';
    } else {
      aNote.textContent = 'Click "Step forward" to begin walking pairs.';
      aOpsBadge.textContent = '0 operations';
      aOpsBadge.className = 'algo-badge';
    }
    renderTiles(aTilesHost, p.nums, activeA);

    // Version B state
    var bIdx = Math.min(currentStep, stepsB.length - 1);
    var stB = stepsB[bIdx];
    var activeB = {};
    if (currentStep > 0 && stB) {
      if (stB.match) {
        activeB[stB.k] = 'pt-match';
        bNote.textContent = 'Match found! Card $' + stB.val + ' needed $' + stB.needed + ', which is on the board.';
        bOpsBadge.className = 'algo-badge good';
      } else {
        activeB[stB.k] = 'pt-i';
        bNote.textContent = 'Card $' + stB.val + ' needs $' + stB.needed + '. Not on board -> write $' + stB.val + ' on chalkboard.';
        bOpsBadge.className = 'algo-badge active';
      }
      chalkVals.textContent = stB.seen.length > 0 ? '{ ' + stB.seen.map(function(v) { return '$' + v; }).join(', ') + ' }' : '(empty)';
      bOpsBadge.textContent = stB.ops + ' operations';
    } else {
      bNote.textContent = 'Click "Step forward" to begin checking the board.';
      chalkVals.textContent = '(empty)';
      bOpsBadge.textContent = '0 operations';
      bOpsBadge.className = 'algo-badge';
    }
    renderTiles(bTilesHost, p.nums, activeB);

    stepBtn.disabled = currentStep >= maxStep;
    runBtn.disabled = currentStep >= maxStep;
    resetBtn.disabled = currentStep === 0;
  }

  stepBtn.addEventListener('click', function() {
    var maxStep = Math.max(stepsA.length, stepsB.length);
    if (currentStep < maxStep) {
      currentStep++;
      render();
    }
  });

  resetBtn.addEventListener('click', function() {
    currentStep = 0;
    render();
  });

  runBtn.addEventListener('click', function() {
    currentStep = Math.max(stepsA.length, stepsB.length);
    render();
  });

  loadPreset(0);
}

/* ---------- 2. Growth & Faster Hardware Slider ---------- */
function mountGrowthHardware(host) {
  if (!host) return;
  var chartBox = host.querySelector('#growthChart');
  var slider = host.querySelector('#hwSlider');
  var speedVal = host.querySelector('#speedVal');
  var crossNum = host.querySelector('#crossNum');
  var crossDesc = host.querySelector('#crossDesc');
  var tableBody = host.querySelector('#growthTableBody');
  var presetBtns = host.querySelectorAll('.slider-presets button');

  // Render cost chart
  costChart(chartBox, {
    pts: GROWTH_PTS,
    names: ['Version A: every pair ~ n²/2', 'Version B: seen-set ~ n'],
    xlabel: 'guests (n)',
    ylabel: 'operations counted',
    log: true,
    xticks: [10, 100, 1000, 2000],
    aria: 'Counted operations growing with input size: Version A grows quadratically with n(n-1)/2, while Version B grows linearly with n.'
  });

  function updateHardware(speedup) {
    speedVal.textContent = speedup + '×';
    var cOver = crossoverN(speedup);
    crossNum.textContent = cOver;
    crossDesc.innerHTML = 'For up to <b>' + cOver + ' guests</b>, the ' + speedup + '× faster assistant running Version A is faster. Past <b>' + cOver + ' guests</b>, Version B on the 1× baseline machine wins permanently!';

    var rows = [10, cOver, 50, 100, 500, 1000];
    tableBody.innerHTML = '';
    rows.forEach(function(n) {
      var opsA = countOpsA(n);
      var timeA = opsA / speedup;
      var opsB = countOpsB(n);
      var timeB = opsB / 1; // 1x baseline

      var tr = document.createElement('tr');
      var aWins = timeA < timeB;
      var tie = Math.abs(timeA - timeB) < 1e-4;

      tr.innerHTML = '<td>n = ' + n + (tie ? ' (crossover)' : '') + '</td>' +
        '<td>' + Math.round(opsA).toLocaleString('en-US') + '</td>' +
        '<td class="' + (tie ? '' : aWins ? 'winner' : 'loser') + '">' + (+timeA.toFixed(1)).toLocaleString('en-US') + '</td>' +
        '<td>' + Math.round(opsB).toLocaleString('en-US') + '</td>' +
        '<td class="' + (tie ? '' : !aWins ? 'winner' : 'loser') + '">' + Math.round(timeB).toLocaleString('en-US') + '</td>';
      tableBody.appendChild(tr);
    });
  }

  slider.addEventListener('input', function() {
    updateHardware(parseInt(slider.value, 10));
  });

  presetBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var val = parseInt(btn.getAttribute('data-val'), 10);
      slider.value = val;
      presetBtns.forEach(function(b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      updateHardware(val);
    });
  });

  updateHardware(10);
}

/* ---------- 3. Operations vs Seconds Widget ---------- */
function mountOpsVsSeconds(host) {
  if (!host) return;
  var tabs = host.querySelectorAll('.ops-tabs button');
  var nSizes = [100, 1000, 10000];
  var currentN = 1000;

  var statA1 = host.querySelector('#m1OpsA');
  var statB1 = host.querySelector('#m1OpsB');
  var statTimeA1 = host.querySelector('#m1TimeA');
  var statTimeB1 = host.querySelector('#m1TimeB');

  var statA2 = host.querySelector('#m2OpsA');
  var statB2 = host.querySelector('#m2OpsB');
  var statTimeA2 = host.querySelector('#m2TimeA');
  var statTimeB2 = host.querySelector('#m2TimeB');

  function render(n) {
    var opsA = countOpsA(n);
    var opsB = countOpsB(n);

    var rate1 = RATE_LAPTOP;
    var rate2 = RATE_SERVER;

    var fmtTime = function(sec) {
      if (sec < 0.001) return (sec * 1000).toFixed(3) + ' ms';
      if (sec < 1) return (sec * 1000).toFixed(1) + ' ms';
      return sec.toFixed(2) + ' s';
    };

    statA1.textContent = opsA.toLocaleString('en-US') + ' ops';
    statB1.textContent = opsB.toLocaleString('en-US') + ' ops';
    statTimeA1.textContent = fmtTime(opsA / rate1);
    statTimeB1.textContent = fmtTime(opsB / rate1);

    statA2.textContent = opsA.toLocaleString('en-US') + ' ops';
    statB2.textContent = opsB.toLocaleString('en-US') + ' ops';
    statTimeA2.textContent = fmtTime(opsA / rate2);
    statTimeB2.textContent = fmtTime(opsB / rate2);
  }

  tabs.forEach(function(btn, k) {
    btn.addEventListener('click', function() {
      tabs.forEach(function(b, j) {
        b.setAttribute('aria-pressed', j === k ? 'true' : 'false');
      });
      currentN = nSizes[k];
      render(currentN);
    });
  });

  render(currentN);
}

/* ---------- 4. Hero Animation ---------- */
function mountHero() {
  var svg = document.getElementById('heroGiftCards');
  if (!svg) return;
  var num = document.getElementById('heroNum');
  var unit = document.getElementById('heroUnit');
  var cap = document.getElementById('heroCap');

  var cards = DEMO_INPUT;
  var cardW = 44;
  var cardGap = 8;
  var startX = 60;
  var topY = 40;
  var botY = 100;

  S('text', { x: 280, y: 22, class: 'hd-lab', 'text-anchor': 'middle' }, svg).textContent =
    'Version A (all pairs) vs Version B (seen-set board)';

  var cellsA = [];
  var cellsB = [];

  // Draw Version A row
  S('text', { x: startX - 10, y: topY + 22, class: 'hd-lab', 'text-anchor': 'end' }, svg).textContent = 'A (pairs)';
  cards.forEach(function(v, i) {
    var rect = S('rect', { x: startX + i * (cardW + cardGap), y: topY, width: cardW, height: 32, rx: 6, class: 'hs-prob' }, svg);
    S('text', { x: startX + i * (cardW + cardGap) + cardW / 2, y: topY + 21, class: 'hs-pt', 'text-anchor': 'middle' }, svg).textContent = '$' + v;
    cellsA.push(rect);
  });

  // Draw Version B row
  S('text', { x: startX - 10, y: botY + 22, class: 'hd-lab', 'text-anchor': 'end' }, svg).textContent = 'B (seen)';
  cards.forEach(function(v, i) {
    var rect = S('rect', { x: startX + i * (cardW + cardGap), y: botY, width: cardW, height: 32, rx: 6, class: 'hs-prob' }, svg);
    S('text', { x: startX + i * (cardW + cardGap) + cardW / 2, y: botY + 21, class: 'hs-pt', 'text-anchor': 'middle' }, svg).textContent = '$' + v;
    cellsB.push(rect);
  });

  /* Frame f shows the f-th executed step of each trace; a strategy that has
     already finished holds its final (matching) step. */
  var FRAMES = Math.max(DEMO_STEPS_A.length, DEMO_STEPS_B.length);
  function showFrame(f) {
    var stA = f > 0 ? DEMO_STEPS_A[Math.min(f, DEMO_STEPS_A.length) - 1] : null;
    var stB = f > 0 ? DEMO_STEPS_B[Math.min(f, DEMO_STEPS_B.length) - 1] : null;
    cellsA.forEach(function(r, i) {
      var on = stA && (i === stA.i || i === stA.j);
      r.setAttribute('class', on ? (stA.match ? 'hs-cell ok' : 'hs-cell no') : 'hs-prob');
    });
    cellsB.forEach(function(r, i) {
      var cls = 'hs-prob';
      if (stB && i === stB.k) cls = stB.match ? 'hs-cell ok' : 'hs-cell no';
      else if (stB && i < stB.k && stB.match && cards[i] === stB.needed) cls = 'hs-cell ok';
      r.setAttribute('class', cls);
    });
    if (num) num.textContent = stA ? stA.ops : 0;
    if (unit) unit.textContent = 'pair checks in Version A vs ' + (stB ? stB.ops : 0) + ' lookups in B';
  }

  showFrame(0);

  if (reduce || !M || !M.animate) {
    return;
  }

  var last = -1;
  M.animate(0, FRAMES + 2, {
    duration: (FRAMES + 2) * 0.6,
    ease: 'linear',
    repeat: Infinity,
    onUpdate: function(v) {
      var s = Math.min(FRAMES, Math.floor(v));
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
  mountPairStepper(document.getElementById('pairStepper'));
  mountGrowthHardware(document.getElementById('growthHardware'));
  mountOpsVsSeconds(document.getElementById('opsVsSeconds'));
  mountHero();
  kinetic();
  riseIn();
})();
