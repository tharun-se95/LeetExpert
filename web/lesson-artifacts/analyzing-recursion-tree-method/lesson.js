/* ================= Analyzing Recursion: The Tree Method =================
   Draws call trees level by level for three recurrences:
     1. Binary Search: T(n) = T(n/2) + O(1) -> single chain, O(log n)
     2. Merge Sort:    T(n) = 2T(n/2) + O(n) -> balanced tree, flat O(n) per level -> O(n log n)
     3. Fibonacci:     T(n) = T(n-1) + T(n-2) + O(1) -> barely shrinking, O(2^n)
   Every number the page shows is computed in the PURE block below and verified by check.py. */

/* PURE:begin (no DOM below this line until PURE:end) */
function countFibNaive(n) {
  var calls = 0;
  function h(k) {
    calls++;
    if (k <= 1) return k;
    return h(k - 1) + h(k - 2);
  }
  h(n);
  return calls;
}

function countFibMemo(n) {
  var memo = {};
  var calls = 0;
  function h(k) {
    calls++;
    if (k in memo) return memo[k];
    var res;
    if (k <= 1) {
      res = k;
    } else {
      res = h(k - 1) + h(k - 2);
    }
    memo[k] = res;
    return res;
  }
  h(n);
  return calls;
}

/* The tree widget traces REAL recursive calls: each call records its depth, its parent and
   the non-recursive work it did, so every level total on the page is a sum of counted work. */
function traceCalls(kind, n) {
  var nodes = [];
  function rec(parent, depth, label, size) {
    var node = { id: nodes.length, parent: parent, depth: depth, label: label, size: size, work: 0 };
    nodes.push(node);
    return node;
  }
  if (kind === 'bs') {
    // binary search for a key larger than every element: the worst case, one probe per call
    var arr = []; for (var i = 0; i < n; i++) arr.push(2 * i);
    var bs = function(parent, depth, lo, hi) {
      var node = rec(parent, depth, 'n=' + (hi - lo), hi - lo);
      node.work++;
      if (hi - lo <= 1) return arr[lo] === 2 * n ? lo : -1;
      var mid = (lo + hi) >> 1;
      return 2 * n < arr[mid] ? bs(node.id, depth + 1, lo, mid) : bs(node.id, depth + 1, mid, hi);
    };
    bs(-1, 0, 0, n);
  } else if (kind === 'ms') {
    // merge sort on reversed input; work = elements written by this call's merge
    var ms = function(parent, depth, a) {
      var node = rec(parent, depth, 'n=' + a.length, a.length);
      if (a.length <= 1) return a.slice();
      var m = a.length >> 1;
      var L = ms(node.id, depth + 1, a.slice(0, m)), R = ms(node.id, depth + 1, a.slice(m));
      var out = [], x = 0, y = 0;
      while (x < L.length || y < R.length) {
        if (y >= R.length || (x < L.length && L[x] <= R[y])) out.push(L[x++]); else out.push(R[y++]);
        node.work++;
      }
      return out;
    };
    var input = []; for (var j = n; j > 0; j--) input.push(j);
    ms(-1, 0, input);
  } else {
    // naive Fibonacci; work = 1 per call
    var fib = function(parent, depth, k) {
      var node = rec(parent, depth, 'f(' + k + ')', k);
      node.work++;
      if (k <= 1) return k;
      return fib(node.id, depth + 1, k - 1) + fib(node.id, depth + 1, k - 2);
    };
    fib(-1, 0, n);
  }
  var levels = [];
  nodes.forEach(function(nd) {
    if (!levels[nd.depth]) levels[nd.depth] = { nodes: 0, work: 0 };
    levels[nd.depth].nodes++;
    levels[nd.depth].work += nd.work;
  });
  var total = levels.reduce(function(s, l) { return s + l.work; }, 0);
  return { nodes: nodes, levels: levels, total: total };
}

function fibValue(k) { var a = 0, b = 1; for (var i = 0; i < k; i++) { var t = a + b; a = b; b = t; } return a; }

/* Closed forms, written from the recurrences rather than from the traces, so the widget's
   "counted = closed form" verdict compares two independent things. n is a power of two for
   bs and ms. */
function closedForm(kind, n) {
  var lg = Math.round(Math.log2(n));
  if (kind === 'bs') return { value: lg + 1, text: 'log₂ n + 1 = ' + lg + ' + 1 = ' + (lg + 1) };
  if (kind === 'ms') return { value: n * lg, text: 'n × log₂ n = ' + n + ' × ' + lg + ' = ' + n * lg };
  var v = 2 * fibValue(n + 1) - 1;
  return { value: v, text: '2·F(n+1) − 1 = 2·' + fibValue(n + 1) + ' − 1 = ' + v };
}

var TREE_KINDS = [
  { id: 'bs', name: 'Binary search (halve once)', rec: 'T(n) = T(n/2) + O(1)', asymp: 'Θ(log n)',
    unit: 'probe', sizes: [4, 8, 16, 32], start: 2 },
  { id: 'ms', name: 'Merge sort (split twice, merge)', rec: 'T(n) = 2T(n/2) + O(n)', asymp: 'Θ(n log n)',
    unit: 'merge write', sizes: [4, 8, 16, 32], start: 2 },
  { id: 'fib', name: 'Naive Fibonacci (branch twice, shrink by 1)', rec: 'T(n) = T(n−1) + T(n−2) + O(1)',
    asymp: 'Θ(φⁿ), at most O(2ⁿ)', unit: 'call', sizes: [3, 4, 5, 6], start: 1 }
];

var MEMO_NS = [4, 6, 8, 10, 12, 16, 20];
var MEMO_ROWS = MEMO_NS.map(function(n) { return { n: n, naive: countFibNaive(n), memo: countFibMemo(n) }; });

var FACTS = (function() {
  var bs = traceCalls('bs', 16), ms = traceCalls('ms', 16), fb = traceCalls('fib', 4);
  return {
    bsN: 16, bsLevels: bs.levels.length, bsTotalWork: bs.total,
    msN: 16, msLevels: ms.levels.length, msTotalWork: ms.total,
    fibN: 4, fibNaiveCalls: countFibNaive(4), fibMemoCalls: countFibMemo(4),
    fib8NaiveCalls: countFibNaive(8), fib8MemoCalls: countFibMemo(8)
  };
})();
/* PURE:end */

/* ---------- 1. Interactive recursion tree model ---------- */
function mountRecursionTrees(host) {
  if (!host) return;
  var tabsHost = host.querySelector('.extabs');
  var recLabel = host.querySelector('#treeRec');
  var asympLabel = host.querySelector('#treeAsymp');
  var svgHost = host.querySelector('#treeSvg');
  var totalWorkVal = host.querySelector('#totalWorkVal');
  var depthVal = host.querySelector('#depthVal');
  var formulaVal = host.querySelector('#formulaVal');
  var verdictVal = host.querySelector('#verdictVal');

  var sizeHost = host.querySelector('#treeSizes');
  var kind = TREE_KINDS[0], sizeIdx = kind.start;

  function draw(trace) {
    var W = 560, top = 22, dY = 40, H = top + trace.levels.length * dY;
    svgHost.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svgHost.innerHTML = '';
    var X0 = 64, X1 = W - 92;
    var kids = trace.nodes.map(function() { return []; });
    trace.nodes.forEach(function(nd) { if (nd.parent >= 0) kids[nd.parent].push(nd.id); });
    var leaves = trace.nodes.filter(function(nd) { return !kids[nd.id].length; }).length;
    var slot = (X1 - X0) / leaves, next = 0, xs = [];
    (function place(id) {
      if (!kids[id].length) { xs[id] = X0 + slot * (next++ + 0.5); return; }
      kids[id].forEach(place);
      xs[id] = kids[id].reduce(function(s, c) { return s + xs[c]; }, 0) / kids[id].length;
    })(0);
    var y = function(nd) { return top + nd.depth * dY + 8; };
    trace.nodes.forEach(function(nd) {
      if (nd.parent >= 0) {
        var p = trace.nodes[nd.parent];
        S('line', { x1: xs[p.id], y1: y(p) + 10, x2: xs[nd.id], y2: y(nd) - 10, class: 'tree-edge' }, svgHost);
      }
    });
    var bw = Math.min(52, slot * 0.86);
    trace.nodes.forEach(function(nd) {
      var cls = 'tree-node-bg' + (nd.id === 0 ? ' root' : (!kids[nd.id].length ? ' base' : ''));
      S('rect', { x: xs[nd.id] - bw / 2, y: y(nd) - 10, width: bw, height: 20, rx: 4, class: cls }, svgHost);
      if (bw >= 30) S('text', { x: xs[nd.id], y: y(nd), class: 'tree-node-lbl' }, svgHost).textContent = nd.label;
    });
    trace.levels.forEach(function(l, k) {
      var yy = top + k * dY + 8;
      S('text', { x: 6, y: yy + 4, class: 'tree-level-lbl' }, svgHost).textContent = 'Level ' + k;
      S('text', { x: W - 6, y: yy + 4, class: 'tree-level-work', 'text-anchor': 'end' }, svgHost)
        .textContent = l.nodes + ' × → ' + l.work;
    });
  }

  function show() {
    var n = kind.sizes[sizeIdx];
    var trace = traceCalls(kind.id, n);
    var cf = closedForm(kind.id, n);
    recLabel.textContent = kind.rec + ',  n = ' + n;
    asympLabel.textContent = kind.asymp;
    depthVal.textContent = trace.levels.length + ' levels';
    totalWorkVal.textContent = trace.levels.map(function(l) { return l.work; }).join(' + ') + ' = ' +
      trace.total + ' ' + kind.unit + (trace.total === 1 ? '' : 's');
    formulaVal.textContent = cf.text;
    var ok = cf.value === trace.total;
    verdictVal.textContent = ok ? 'counted = closed form' : 'mismatch';
    verdictVal.className = 'stat-val ' + (ok ? 'good' : 'bad');
    svgHost.setAttribute('aria-label', 'Recursion tree for ' + kind.rec + ' at n = ' + n + ': ' +
      trace.levels.length + ' levels, level work ' + trace.levels.map(function(l) { return l.work; }).join(', ') + '.');
    draw(trace);
  }

  function sizeButtons() {
    sizeHost.innerHTML = '';
    kind.sizes.forEach(function(n, i) {
      var b = el('button', 'tab', 'n = ' + n);
      b.type = 'button';
      b.setAttribute('aria-pressed', i === sizeIdx ? 'true' : 'false');
      b.addEventListener('click', function() {
        sizeIdx = i;
        sizeHost.querySelectorAll('button').forEach(function(x, k) { x.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
        show();
      });
      sizeHost.appendChild(b);
    });
  }

  TREE_KINDS.forEach(function(t, i) {
    var btn = el('button', 'tab', t.name);
    btn.type = 'button';
    btn.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    btn.addEventListener('click', function() {
      tabsHost.querySelectorAll('button').forEach(function(b, k) {
        b.setAttribute('aria-pressed', k === i ? 'true' : 'false');
      });
      kind = t; sizeIdx = t.start;
      sizeButtons();
      show();
    });
    tabsHost.appendChild(btn);
  });

  sizeButtons();
  show();
}

function mountMemoTable(host) {
  if (!host) return;
  var body = host.querySelector('#memoBody');
  MEMO_ROWS.forEach(function(r) {
    var tr = el('tr');
    tr.innerHTML = '<td>' + r.n + '</td><td class="bad">' + r.naive.toLocaleString() + '</td><td class="good">' +
      r.memo + '</td><td>' + (r.naive / r.memo).toFixed(1) + '×</td>';
    body.appendChild(tr);
  });
}

/* ---------- Boot wiring ---------- */
(function() {
  mountLesson();
  mountRecursionTrees($('#treeWidget'));
  mountMemoTable($('#memoTable'));
})();

/* ---------- Systems hero: office hierarchy delegation ---------- */
(function() {
  function heroHierarchy() {
    var svg = $('#heroHierarchy');
    if (!svg) return;
    var W = 560, H = 140;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    S('text', { x: W / 2, y: 22, class: 'hd-lab', 'text-anchor': 'middle' }, svg)
      .textContent = 'delegation hierarchy: work flows down and results sum back up';

    var nodes = [
      { id: 'mgr', x: 280, y: 46, label: 'Manager: size n', lvl: 0 },
      { id: 'c1', x: 180, y: 88, label: 'Clerk A', lvl: 1, p: 'mgr' },
      { id: 'c2', x: 380, y: 88, label: 'Clerk B', lvl: 1, p: 'mgr' },
      { id: 'a1', x: 130, y: 122, label: 'Asst 1', lvl: 2, p: 'c1' },
      { id: 'a2', x: 230, y: 122, label: 'Asst 2', lvl: 2, p: 'c1' },
      { id: 'a3', x: 330, y: 122, label: 'Asst 3', lvl: 2, p: 'c2' },
      { id: 'a4', x: 430, y: 122, label: 'Asst 4', lvl: 2, p: 'c2' }
    ];

    var nodeMap = {};
    nodes.forEach(function(n) { nodeMap[n.id] = n; });

    nodes.forEach(function(n) {
      if (n.p) {
        var parent = nodeMap[n.p];
        S('line', { x1: parent.x, y1: parent.y + 10, x2: n.x, y2: n.y - 10, class: 'hs-prob' }, svg);
      }
    });

    var rects = [];
    nodes.forEach(function(n) {
      var g = S('g', {}, svg);
      var w = n.lvl === 0 ? 110 : (n.lvl === 1 ? 70 : 54);
      var r = S('rect', { x: n.x - w / 2, y: n.y - 11, width: w, height: 22, rx: 4, class: 'hs-prob' }, g);
      var txt = S('text', { x: n.x, y: n.y + 4, class: 'hs-pt', 'text-anchor': 'middle' }, g);
      txt.setAttribute('font-size', n.lvl === 0 ? '11px' : '9.5px');
      txt.textContent = n.label;
      rects.push({ el: r, lvl: n.lvl });
    });

    var num = $('#heroNum'), unit = $('#heroUnit'), cap = $('#heroCap');

    function show(step) {
      rects.forEach(function(item) {
        if (item.lvl === step) {
          item.el.setAttribute('class', 'hs-cell ok');
        } else if (item.lvl < step) {
          item.el.setAttribute('class', 'hs-cell no');
        } else {
          item.el.setAttribute('class', 'hs-prob');
        }
      });
      if (num) num.textContent = step + 1;
      if (unit) unit.textContent = 'of 3 hierarchy levels active';
      if (cap) {
        if (step === 0) {
          cap.innerHTML = '<strong>Level 0 (Root)</strong>: Manager receives problem of size n.';
        } else if (step === 1) {
          cap.innerHTML = '<strong>Level 1 (Subproblems)</strong>: Two clerks receive delegated sub-tasks.';
        } else {
          cap.innerHTML = '<strong>Level 2 (Base work)</strong>: Assistants process atomic work and return answers.';
        }
      }
    }

    if (reduce || !M || !M.animate) {
      show(0);
      return;
    }

    var last = -1;
    M.animate(0, 3, {
      duration: 4.5,
      ease: 'linear',
      repeat: Infinity,
      onUpdate: function(v) {
        var s = Math.min(2, Math.floor(v));
        if (s !== last) {
          last = s;
          show(s);
        }
      }
    });
  }

  heroHierarchy();
  kinetic();
  riseIn();
})();
