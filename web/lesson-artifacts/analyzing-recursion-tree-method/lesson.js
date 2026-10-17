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

function binarySearchTree(n) {
  var levels = [];
  var curr = n;
  while (curr >= 1) {
    levels.push({ size: curr, nodes: 1, workPerNode: 1, totalWork: 1 });
    if (curr === 1) break;
    curr = Math.floor(curr / 2);
  }
  var totalWork = levels.reduce(function(acc, l) { return acc + l.totalWork; }, 0);
  return { levels: levels, depth: levels.length, totalWork: totalWork };
}

function mergeSortTree(n) {
  var levels = [];
  var currSize = n;
  var currNodes = 1;
  while (currSize >= 1) {
    levels.push({ size: currSize, nodes: currNodes, workPerNode: currSize, totalWork: currNodes * currSize });
    if (currSize === 1) break;
    currSize = Math.floor(currSize / 2);
    currNodes *= 2;
  }
  var totalWork = levels.reduce(function(acc, l) { return acc + l.totalWork; }, 0);
  return { levels: levels, depth: levels.length, totalWork: totalWork };
}

var FACTS = (function() {
  var bs = binarySearchTree(16);
  var ms = mergeSortTree(16);
  return {
    bsN: 16,
    bsLevels: bs.depth,
    bsTotalWork: bs.totalWork,
    msN: 16,
    msLevels: ms.depth,
    msWorkPerLevel: 16,
    msTotalWork: ms.totalWork,
    fibN: 4,
    fibNaiveCalls: countFibNaive(4),
    fibMemoCalls: countFibMemo(4),
    fibDistinct: 5,
    fib6NaiveCalls: countFibNaive(6),
    fib6MemoCalls: countFibMemo(6),
    fib8NaiveCalls: countFibNaive(8),
    fib8MemoCalls: countFibMemo(8)
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
  var tableBody = host.querySelector('#levelsBody');

  var TREES = [
    {
      id: 'bs',
      name: 'Binary Search (Halve once)',
      rec: 'T(n) = T(n/2) + O(1)',
      asymp: '\u0398(log n)',
      depth: '5 levels (\u2308log\u2082 n\u2309 + 1)',
      totalWork: '5 operations',
      formula: '1 + 1 + 1 + 1 + 1 = 5',
      verdict: 'Logarithmic chain',
      levels: [
        { lvl: 0, subproblems: 1, size: 'n = 16', workEach: 1, total: 1 },
        { lvl: 1, subproblems: 1, size: 'n = 8', workEach: 1, total: 1 },
        { lvl: 2, subproblems: 1, size: 'n = 4', workEach: 1, total: 1 },
        { lvl: 3, subproblems: 1, size: 'n = 2', workEach: 1, total: 1 },
        { lvl: 4, subproblems: 1, size: 'n = 1', workEach: 1, total: 1 }
      ],
      draw: function(svg) {
        var W = 520, H = 220;
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
        svg.innerHTML = '';
        var X = 200, Y0 = 25, dY = 40;
        var sizes = [16, 8, 4, 2, 1];
        for (var i = 0; i < sizes.length; i++) {
          var y = Y0 + i * dY;
          if (i < sizes.length - 1) {
            var line = S('line', { x1: X, y1: y + 14, x2: X, y2: y + dY - 14, class: 'tree-edge' }, svg);
          }
          var g = S('g', {}, svg);
          var rect = S('rect', { x: X - 36, y: y - 14, width: 72, height: 28, rx: 6, class: i === 0 ? 'tree-node-bg root' : (i === 4 ? 'tree-node-bg base' : 'tree-node-bg') }, g);
          var txt = S('text', { x: X, y: y, class: 'tree-node-lbl' }, g);
          txt.textContent = 'n = ' + sizes[i];

          // level annotation on left and work on right
          var lvlTxt = S('text', { x: 30, y: y + 4, class: 'tree-level-lbl' }, svg);
          lvlTxt.textContent = 'Level ' + i;
          var workTxt = S('text', { x: 480, y: y + 4, class: 'tree-level-work' }, svg);
          workTxt.textContent = '1 op';
        }
      }
    },
    {
      id: 'ms',
      name: 'Merge Sort (Split twice + merge)',
      rec: 'T(n) = 2T(n/2) + O(n)',
      asymp: '\u0398(n log n)',
      depth: '5 levels (\u2308log\u2082 n\u2309 + 1)',
      totalWork: '80 operations (n \u00D7 log n)',
      formula: '16 \u00D7 5 levels = 80',
      verdict: 'Balanced flat pyramid',
      levels: [
        { lvl: 0, subproblems: 1, size: 'n = 16', workEach: 16, total: 16 },
        { lvl: 1, subproblems: 2, size: 'n = 8', workEach: 8, total: 16 },
        { lvl: 2, subproblems: 4, size: 'n = 4', workEach: 4, total: 16 },
        { lvl: 3, subproblems: 8, size: 'n = 2', workEach: 2, total: 16 },
        { lvl: 4, subproblems: 16, size: 'n = 1', workEach: 1, total: 16 }
      ],
      draw: function(svg) {
        var W = 520, H = 220;
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
        svg.innerHTML = '';
        var Y0 = 25, dY = 40;
        var treeData = [
          [{ label: 'n=16', x: 230 }],
          [{ label: 'n=8', x: 150 }, { label: 'n=8', x: 310 }],
          [{ label: 'n=4', x: 110 }, { label: 'n=4', x: 190 }, { label: 'n=4', x: 270 }, { label: 'n=4', x: 350 }],
          [{ label: 'n=2', x: 90 }, { label: 'n=2', x: 130 }, { label: 'n=2', x: 170 }, { label: 'n=2', x: 210 }, { label: 'n=2', x: 250 }, { label: 'n=2', x: 290 }, { label: 'n=2', x: 330 }, { label: 'n=2', x: 370 }]
        ];

        // Draw connections
        for (var l = 0; l < treeData.length - 1; l++) {
          var parents = treeData[l];
          var children = treeData[l + 1];
          var yP = Y0 + l * dY + 12;
          var yC = Y0 + (l + 1) * dY - 12;
          for (var p = 0; p < parents.length; p++) {
            var c1 = children[p * 2];
            var c2 = children[p * 2 + 1];
            S('line', { x1: parents[p].x, y1: yP, x2: c1.x, y2: yC, class: 'tree-edge' }, svg);
            S('line', { x1: parents[p].x, y1: yP, x2: c2.x, y2: yC, class: 'tree-edge' }, svg);
          }
        }

        // Draw nodes for first 4 levels (level 4 indicated with ellipsis)
        for (var l = 0; l < treeData.length; l++) {
          var y = Y0 + l * dY;
          var nodes = treeData[l];
          for (var n = 0; n < nodes.length; n++) {
            var g = S('g', {}, svg);
            var rect = S('rect', { x: nodes[n].x - 18, y: y - 11, width: 36, height: 22, rx: 4, class: l === 0 ? 'tree-node-bg root' : 'tree-node-bg' }, g);
            var txt = S('text', { x: nodes[n].x, y: y, class: 'tree-node-lbl' }, g);
            txt.setAttribute('font-size', '10px');
            txt.textContent = nodes[n].label;
          }
          // level labels
          var lvlTxt = S('text', { x: 20, y: y + 4, class: 'tree-level-lbl' }, svg);
          lvlTxt.textContent = 'Level ' + l;
          var workTxt = S('text', { x: 500, y: y + 4, class: 'tree-level-work' }, svg);
          workTxt.textContent = '16 ops';
        }

        // Base level indication
        var yBase = Y0 + 4 * dY;
        var lvl4Txt = S('text', { x: 20, y: yBase + 4, class: 'tree-level-lbl' }, svg);
        lvl4Txt.textContent = 'Level 4 (n=1 leaves)';
        var dotTxt = S('text', { x: 230, y: yBase + 4, class: 'tree-node-lbl' }, svg);
        dotTxt.textContent = '... 16 base leaves of size 1 ...';
        var work4Txt = S('text', { x: 500, y: yBase + 4, class: 'tree-level-work' }, svg);
        work4Txt.textContent = '16 ops';
      }
    },
    {
      id: 'fib',
      name: 'Naive Fibonacci (Branches twice, shrinks by 1)',
      rec: 'T(n) = T(n-1) + T(n-2) + O(1)',
      asymp: '\u0398(\u03C6\u207F) \u2248 O(2\u207F)',
      depth: '4 levels (depth n)',
      totalWork: '9 recursive calls',
      formula: '1 + 2 + 4 + 2 = 9 calls',
      verdict: 'Exponential explosion',
      levels: [
        { lvl: 0, subproblems: 1, size: 'fib(4)', workEach: 1, total: 1 },
        { lvl: 1, subproblems: 2, size: 'fib(3), fib(2)', workEach: 1, total: 2 },
        { lvl: 2, subproblems: 4, size: 'fib(2), fib(1), fib(1), fib(0)', workEach: 1, total: 4 },
        { lvl: 3, subproblems: 2, size: 'fib(1), fib(0)', workEach: 1, total: 2 }
      ],
      draw: function(svg) {
        var W = 520, H = 220;
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
        svg.innerHTML = '';
        var Y0 = 25, dY = 48;

        // Tree structure for fib(4)
        var nodes = [
          { id: '4', label: 'fib(4)', x: 230, y: Y0, root: true },
          // Level 1
          { id: '3', label: 'fib(3)', x: 130, y: Y0 + dY, p: '4' },
          { id: '2a', label: 'fib(2)', x: 330, y: Y0 + dY, p: '4', repeat: true },
          // Level 2
          { id: '2b', label: 'fib(2)', x: 80, y: Y0 + 2 * dY, p: '3', repeat: true },
          { id: '1a', label: 'fib(1)', x: 180, y: Y0 + 2 * dY, p: '3', base: true },
          { id: '1b', label: 'fib(1)', x: 290, y: Y0 + 2 * dY, p: '2a', base: true },
          { id: '0a', label: 'fib(0)', x: 370, y: Y0 + 2 * dY, p: '2a', base: true },
          // Level 3
          { id: '1c', label: 'fib(1)', x: 50, y: Y0 + 3 * dY, p: '2b', base: true },
          { id: '0b', label: 'fib(0)', x: 110, y: Y0 + 3 * dY, p: '2b', base: true }
        ];

        var nodeMap = {};
        nodes.forEach(function(n) { nodeMap[n.id] = n; });

        // Draw edges
        nodes.forEach(function(n) {
          if (n.p) {
            var parent = nodeMap[n.p];
            S('line', {
              x1: parent.x,
              y1: parent.y + 12,
              x2: n.x,
              y2: n.y - 12,
              class: n.repeat ? 'tree-edge repeat-edge' : 'tree-edge'
            }, svg);
          }
        });

        // Draw nodes
        nodes.forEach(function(n) {
          var g = S('g', {}, svg);
          var cls = 'tree-node-bg';
          if (n.root) cls += ' root';
          if (n.repeat) cls += ' repeat';
          if (n.base) cls += ' base';
          S('rect', { x: n.x - 26, y: n.y - 12, width: 52, height: 24, rx: 5, class: cls }, g);
          var txt = S('text', { x: n.x, y: n.y, class: 'tree-node-lbl' }, g);
          txt.setAttribute('font-size', '10.5px');
          txt.textContent = n.label;
        });

        // Level labels and work
        var lvlTotals = [1, 2, 4, 2];
        for (var l = 0; l < 4; l++) {
          var y = Y0 + l * dY;
          var lvlTxt = S('text', { x: 16, y: y + 4, class: 'tree-level-lbl' }, svg);
          lvlTxt.textContent = 'Level ' + l;
          var workTxt = S('text', { x: 500, y: y + 4, class: 'tree-level-work' }, svg);
          workTxt.textContent = lvlTotals[l] + ' calls';
        }
      }
    }
  ];

  function showTree(tree) {
    recLabel.textContent = tree.rec;
    asympLabel.textContent = tree.asymp;
    depthVal.textContent = tree.depth;
    totalWorkVal.textContent = tree.totalWork;
    formulaVal.textContent = tree.formula;
    verdictVal.textContent = tree.verdict;

    tree.draw(svgHost);

    // Populate levels table
    if (tableBody) {
      tableBody.innerHTML = '';
      tree.levels.forEach(function(row) {
        var tr = el('tr');
        tr.innerHTML = '<td>' + row.lvl + '</td><td>' + row.subproblems + '</td><td>' + row.size + '</td><td>' + row.workEach + '</td><td><strong>' + row.total + '</strong></td>';
        tableBody.appendChild(tr);
      });
    }
  }

  TREES.forEach(function(t, i) {
    var btn = el('button', 'tab', t.name);
    btn.type = 'button';
    btn.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    btn.addEventListener('click', function() {
      tabsHost.querySelectorAll('button').forEach(function(b, k) {
        b.setAttribute('aria-pressed', k === i ? 'true' : 'false');
      });
      showTree(t);
    });
    tabsHost.appendChild(btn);
  });

  showTree(TREES[0]);
}

/* ---------- Boot wiring ---------- */
(function() {
  mountLesson();
  mountRecursionTrees($('#treeWidget'));
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
