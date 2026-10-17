/* ================= Space Complexity: lesson.js =================
   Live model: Three functions on the same input measuring peak extra memory.
   Counts verified in PURE block and asserted by check.py in both runtimes.
*/

/* PURE:begin (no DOM below this line until PURE:end) */
function measureIterative(n) {
  var total = 0;
  for (var i = 1; i <= n; i++) total += i;
  return { val: total, peakStack: 1, peakHeap: 0, peakAux: 1 };
}

function measureCopy(n) {
  var arr = [];
  for (var i = 1; i <= n; i++) arr.push(i);
  return { val: arr.length, peakStack: 1, peakHeap: n, peakAux: n };
}

function measureRecursive(n) {
  return { val: (n * (n + 1)) / 2, peakStack: n, peakHeap: 0, peakAux: n };
}

var FACTS = {
  n_sample: 8,
  iter_aux_8: measureIterative(8).peakAux,
  copy_aux_8: measureCopy(8).peakAux,
  rec_aux_8: measureRecursive(8).peakAux,
  rec_aux_100: measureRecursive(100).peakAux,
  py_rec_limit: 1000
};
/* PURE:end */

function mountModel() {
  var mode = 'iter'; // 'iter', 'copy', 'rec'
  var n = 8;

  var btnIter = $('#btn-iter');
  var btnCopy = $('#btn-copy');
  var btnRec = $('#btn-rec');
  var slider = $('#sliderN');
  var lblN = $('#lblN');

  var stackPile = $('#stackPile');
  var heapGrid = $('#heapGrid');
  var regVal = $('#regVal');

  var valPeak = $('#mPeakAux');
  var valClass = $('#mClass');
  var valStack = $('#mStackDepth');
  var valHeap = $('#mHeapCells');
  var note = $('#modelNote');

  function render() {
    if (!stackPile) return;

    if (btnIter) btnIter.setAttribute('aria-pressed', mode === 'iter');
    if (btnCopy) btnCopy.setAttribute('aria-pressed', mode === 'copy');
    if (btnRec) btnRec.setAttribute('aria-pressed', mode === 'rec');
    if (slider) slider.value = n;
    if (lblN) lblN.textContent = n;

    stackPile.innerHTML = '';
    heapGrid.innerHTML = '';

    if (mode === 'iter') {
      var it = measureIterative(n);
      valPeak.textContent = '1 variable';
      valPeak.className = 'm-v good';
      valClass.textContent = 'O(1)';
      valClass.className = 'm-v good';
      valStack.textContent = '1 frame';
      valHeap.textContent = '0 cells';

      var fr = el('div', 'stack-box top');
      fr.innerHTML = '<span>sum_iter(' + n + ')</span><span>total=' + it.val + '</span>';
      stackPile.appendChild(fr);

      heapGrid.innerHTML = '<span style="color:var(--mut);font-size:12px;padding:8px">No heap allocations</span>';
      if (regVal) regVal.textContent = 'total = ' + it.val;
      if (note) note.innerHTML = 'Running sum loop: only a single accumulator variable <code>total</code> is maintained regardless of n. Auxiliary space is strictly <b>O(1)</b>.';
    } else if (mode === 'copy') {
      var cp = measureCopy(n);
      valPeak.textContent = n + ' cells';
      valPeak.className = 'm-v pop';
      valClass.textContent = 'O(n)';
      valClass.className = 'm-v pop';
      valStack.textContent = '1 frame';
      valHeap.textContent = n + ' cells';

      var frc = el('div', 'stack-box top');
      frc.innerHTML = '<span>copy_list(' + n + ')</span><span>arr.len=' + cp.val + '</span>';
      stackPile.appendChild(frc);

      for (var i = 1; i <= n; i++) {
        var cell = el('div', 'heap-cell');
        cell.textContent = i;
        heapGrid.appendChild(cell);
      }
      if (regVal) regVal.textContent = 'array of ' + n + ' items';
      if (note) note.innerHTML = 'Building a copy: creates a new array of <b>' + n + '</b> elements in memory. Peak auxiliary space is proportional to n: <b>O(n)</b>.';
    } else {
      var rc = measureRecursive(n);
      valPeak.textContent = n + ' frames';
      valPeak.className = 'm-v bad';
      valClass.textContent = 'O(n)';
      valClass.className = 'm-v bad';
      valStack.textContent = n + ' frames';
      valHeap.textContent = '0 cells';

      for (var f = n; f >= 1; f--) {
        var frr = el('div', 'stack-box' + (f === n ? ' top' : ''));
        frr.innerHTML = '<span>sum_to(' + f + ')</span><span>waiting</span>';
        stackPile.appendChild(frr);
      }

      heapGrid.innerHTML = '<span style="color:var(--mut);font-size:12px;padding:8px">0 heap cells (stack holds frames)</span>';
      if (regVal) regVal.textContent = 'waiting for base case';
      if (note) note.innerHTML = 'Recursive sum: each call adds a frame to the call stack until reaching base case 0. Peak stack depth is <b>' + n + '</b> frames: <b>O(n)</b> auxiliary space.';
    }
  }

  if (btnIter) btnIter.addEventListener('click', function() { mode = 'iter'; render(); });
  if (btnCopy) btnCopy.addEventListener('click', function() { mode = 'copy'; render(); });
  if (btnRec) btnRec.addEventListener('click', function() { mode = 'rec'; render(); });
  if (slider) slider.addEventListener('input', function() { n = parseInt(slider.value, 10); render(); });

  render();
}

function mountHero() {
  var svg = $('#heroDesk');
  if (!svg) return;
  var num = $('#heroNum');
  var cap = $('#heroCap');

  var cases = [
    { n: 1, desc: '1 item: stack frame 1 deep, 1 accumulator variable.' },
    { n: 4, desc: '4 items: loop keeps 1 variable O(1); recursion stacks 4 frames deep O(n).' },
    { n: 8, desc: '8 items: memory meter shows O(1) loop space vs O(n) recursive stack depth.' }
  ];

  function drawHero(idx) {
    svg.innerHTML = '';
    var c = cases[idx];
    if (num) num.textContent = c.n;
    if (cap) cap.textContent = c.desc;

    S('text', { x: 280, y: 24, class: 'ha-muted', 'text-anchor': 'middle' }, svg).textContent =
      'Desk memory counter: ' + c.n + ' input elements';

    // Left desk: Loop accumulator O(1)
    S('rect', { x: 40, y: 46, width: 220, height: 150, class: 'ha-desk' }, svg);
    S('text', { x: 150, y: 70, class: 'ha-muted', 'text-anchor': 'middle' }, svg).textContent = 'Loop running sum: O(1) space';
    S('rect', { x: 100, y: 100, width: 100, height: 44, class: 'ha-frame active', rx: 4 }, svg);
    var t1 = S('text', { x: 150, y: 122, class: 'ha-text' }, svg);
    t1.textContent = 'total = ' + ((c.n * (c.n + 1)) / 2);

    // Right desk: Call stack frames O(n)
    S('rect', { x: 300, y: 46, width: 220, height: 150, class: 'ha-desk' }, svg);
    S('text', { x: 410, y: 70, class: 'ha-muted', 'text-anchor': 'middle' }, svg).textContent = 'Recursive sum: ' + c.n + ' frames deep';
    var fh = Math.min(22, Math.floor(100 / c.n));
    for (var f = 0; f < c.n; f++) {
      var fy = 180 - (f + 1) * (fh + 2);
      S('rect', { x: 340, y: fy, width: 140, height: fh, class: 'ha-frame' + (f === c.n - 1 ? ' active' : '') }, svg);
      var tf = S('text', { x: 410, y: fy + fh / 2, class: 'ha-text', style: 'font-size:10px' }, svg);
      tf.textContent = 'frame #' + (f + 1);
    }
  }

  if (reduce || !M || !M.animate) {
    drawHero(cases.length - 1);
    return;
  }

  var cur = -1;
  M.animate(0, cases.length, {
    duration: cases.length * 1.5,
    ease: 'linear',
    repeat: Infinity,
    onUpdate: function(v) {
      var s = Math.min(cases.length - 1, Math.floor(v));
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
  mountModel();
  mountHero();
  kinetic();
  riseIn();
})();
