/* ================= Amortized Analysis & Dynamic Arrays =================
   Live model: dynamic array capacity doubling vs fixed growth.
   All operation counts and theoretical bounds are verified in the PURE block
   and checked by check.py in both Python and TypeScript.
*/

/* PURE:begin (no DOM below this line until PURE:end) */
function simulateDoubling(n, initCap) {
  initCap = initCap || 1;
  var cap = initCap, size = 0, totalCopies = 0, history = [];
  for (var i = 1; i <= n; i++) {
    var curCopies = 0;
    var capBefore = cap;
    if (size === cap) {
      curCopies = size;
      totalCopies += curCopies;
      cap *= 2;
    }
    size++;
    history.push({ append: i, capBefore: capBefore, capAfter: cap, copies: curCopies, totalCopies: totalCopies });
  }
  return { size: size, cap: cap, totalCopies: totalCopies, history: history };
}

function simulateFixed(n, inc, initCap) {
  inc = inc || 1;
  initCap = initCap || 1;
  var cap = initCap, size = 0, totalCopies = 0, history = [];
  for (var i = 1; i <= n; i++) {
    var curCopies = 0;
    var capBefore = cap;
    if (size === cap) {
      curCopies = size;
      totalCopies += curCopies;
      cap += inc;
    }
    size++;
    history.push({ append: i, capBefore: capBefore, capAfter: cap, copies: curCopies, totalCopies: totalCopies });
  }
  return { size: size, cap: cap, totalCopies: totalCopies, history: history };
}

var SIM9_DOUBLE = simulateDoubling(9, 1);
var SIM32_DOUBLE = simulateDoubling(32, 1);
var SIM9_FIXED = simulateFixed(9, 1, 1);
var SIM32_FIXED = simulateFixed(32, 1, 1);

var FACTS = {
  double_copies_9: SIM9_DOUBLE.totalCopies,
  double_total_work_9: 9 + SIM9_DOUBLE.totalCopies,
  double_copies_32: SIM32_DOUBLE.totalCopies,
  double_total_work_32: 32 + SIM32_DOUBLE.totalCopies,
  fixed_copies_9: SIM9_FIXED.totalCopies,
  fixed_copies_32: SIM32_FIXED.totalCopies,
  fixed_total_work_32: 32 + SIM32_FIXED.totalCopies,
  bank_charge: 3,
  bank_credit: 2
};
/* PURE:end */

function mountModel() {
  var strat = 'double';
  var n = 9;

  var btnDouble = $('#strat-double');
  var btnFixed = $('#strat-fixed');
  var btnAppend = $('#btnAppend');
  var btnReset = $('#btnReset');
  var slider = $('#sliderN');
  var lblN = $('#lblN');
  var shelfCells = $('#shelfCells');
  var shelfCap = $('#shelfCap');
  var shelfSize = $('#shelfSize');

  var valSize = $('#mSize');
  var valCap = $('#mCap');
  var valCopies = $('#mCopies');
  var valTotalCopies = $('#mTotalCopies');
  var valBank = $('#mBank');
  var valAvg = $('#mAvg');
  var tableBody = $('#traceBody');
  var note = $('#modelNote');

  function render() {
    if (!shelfCells) return;
    var sim = strat === 'double' ? simulateDoubling(n, 1) : simulateFixed(n, 1, 1);
    var lastStep = sim.history[sim.history.length - 1];

    if (btnDouble) btnDouble.setAttribute('aria-pressed', strat === 'double');
    if (btnFixed) btnFixed.setAttribute('aria-pressed', strat === 'fixed');
    if (slider) slider.value = n;
    if (lblN) lblN.textContent = n;

    if (shelfCap) shelfCap.textContent = sim.cap;
    if (shelfSize) shelfSize.textContent = sim.size;

    if (valSize) valSize.textContent = sim.size;
    if (valCap) valCap.textContent = sim.cap;
    if (valCopies) valCopies.textContent = lastStep ? lastStep.copies : 0;
    if (valTotalCopies) valTotalCopies.textContent = sim.totalCopies;

    if (strat === 'double') {
      var bank = 2 * sim.size - sim.totalCopies;
      if (valBank) valBank.textContent = bank + ' tokens';
      if (valAvg) {
        valAvg.textContent = (sim.totalCopies / sim.size).toFixed(2);
        valAvg.className = 'm-v good';
      }
      if (valTotalCopies) valTotalCopies.className = 'm-v good';
      if (note) note.innerHTML = 'Doubling strategy: across <b>' + n + '</b> appends, only <b>' + sim.totalCopies + '</b> total copies occurred (under <b>2n</b> bound). Average copy cost: <b>' + (sim.totalCopies / sim.size).toFixed(2) + '</b> copies/append.';
    } else {
      if (valBank) valBank.textContent = 'Bank empty';
      if (valAvg) {
        valAvg.textContent = (sim.totalCopies / sim.size).toFixed(2);
        valAvg.className = 'm-v bad';
      }
      if (valTotalCopies) valTotalCopies.className = 'm-v bad';
      if (note) note.innerHTML = 'Fixed growth (+1): resize occurs on almost every append, accumulating <b>' + sim.totalCopies + '</b> total copies (formula: n(n-1)/2). Average copy cost: <b>' + (sim.totalCopies / sim.size).toFixed(2) + '</b> copies/append — quadratic O(n²) total work!';
    }

    shelfCells.innerHTML = '';
    var lastCopies = lastStep ? lastStep.copies : 0;
    for (var i = 0; i < sim.cap; i++) {
      var slot = el('div', 'shelf-slot');
      if (i < sim.size) {
        var isCopied = (i < lastCopies);
        slot.className = 'shelf-slot ' + (isCopied ? 'copied' : 'filled');
        slot.innerHTML = '<span>' + (i + 1) + '</span><span class="slot-idx">[' + i + ']</span>';
      } else {
        slot.className = 'shelf-slot empty';
        slot.innerHTML = '<span>·</span><span class="slot-idx">[' + i + ']</span>';
      }
      shelfCells.appendChild(slot);
    }

    if (tableBody) {
      tableBody.innerHTML = '';
      var startIdx = Math.max(0, sim.history.length - 16);
      for (var h = sim.history.length - 1; h >= startIdx; h--) {
        var step = sim.history[h];
        var tr = el('tr', step.copies > 0 ? 'spike' : '');
        tr.innerHTML = '<td>#' + step.append + '</td>' +
          '<td>' + step.capBefore + '</td>' +
          '<td>' + step.capAfter + '</td>' +
          '<td>' + (step.copies > 0 ? step.copies + ' (resize)' : '0') + '</td>' +
          '<td>' + step.totalCopies + '</td>';
        tableBody.appendChild(tr);
      }
    }
  }

  if (btnDouble) {
    btnDouble.addEventListener('click', function() {
      strat = 'double';
      render();
    });
  }
  if (btnFixed) {
    btnFixed.addEventListener('click', function() {
      strat = 'fixed';
      render();
    });
  }
  if (btnAppend) {
    btnAppend.addEventListener('click', function() {
      if (n < 32) {
        n++;
        render();
      }
    });
  }
  if (btnReset) {
    btnReset.addEventListener('click', function() {
      n = 1;
      render();
    });
  }
  if (slider) {
    slider.addEventListener('input', function() {
      n = parseInt(slider.value, 10);
      render();
    });
  }

  render();
}

function mountHero() {
  var svg = $('#heroShelf');
  if (!svg) return;
  var num = $('#heroNum');
  var cap = $('#heroCap');

  var sequence = [
    { n: 1, cap: 1, copies: 0, desc: 'Package 1 placed on shelf (capacity 1). Cost: 1.' },
    { n: 2, cap: 2, copies: 1, desc: 'Capacity 1 full! Shelf doubles to 2. Copy 1 package, place package 2. Cost: 2.' },
    { n: 3, cap: 4, copies: 2, desc: 'Capacity 2 full! Shelf doubles to 4. Copy 2 packages, place package 3. Cost: 3.' },
    { n: 4, cap: 4, copies: 0, desc: 'Slot 4 free. Place package 4. Cost: 1.' },
    { n: 5, cap: 8, copies: 4, desc: 'Capacity 4 full! Shelf doubles to 8. Copy 4 packages, place package 5. Cost: 5.' },
    { n: 6, cap: 8, copies: 0, desc: 'Slot 6 free. Place package 6. Cost: 1.' },
    { n: 7, cap: 8, copies: 0, desc: 'Slot 7 free. Place package 7. Cost: 1.' },
    { n: 8, cap: 8, copies: 0, desc: 'Slot 8 free. Place package 8. Cost: 1.' },
    { n: 9, cap: 16, copies: 8, desc: 'Capacity 8 full! Shelf doubles to 16. Copy 8 packages, place package 9. Cost: 9.' }
  ];

  function drawHero(stepIdx) {
    svg.innerHTML = '';
    var st = sequence[stepIdx];
    if (num) num.textContent = st.n;
    if (cap) cap.textContent = st.desc;

    S('text', { x: 280, y: 24, class: 'ha-muted', 'text-anchor': 'middle' }, svg).textContent =
      'Dynamic array doubling: capacity ' + st.cap + ', ' + st.n + ' packages placed';

    var slotW = Math.min(32, Math.floor(480 / st.cap));
    var startX = 280 - (st.cap * (slotW + 4)) / 2;
    var startY = 120;

    for (var i = 0; i < st.cap; i++) {
      var x = startX + i * (slotW + 4);
      var isFilled = i < st.n;
      var isMoved = i < st.copies;
      S('rect', {
        x: x, y: startY, width: slotW, height: 42,
        class: isMoved ? 'ha-pkg moved' : isFilled ? 'ha-pkg' : 'ha-shelf',
        rx: 4
      }, svg);

      if (isFilled) {
        var t = S('text', { x: x + slotW / 2, y: startY + 21, class: 'ha-text' }, svg);
        t.textContent = i + 1;
      }
    }

    var coinsY = 75;
    S('text', { x: startX, y: coinsY - 14, class: 'ha-muted' }, svg).textContent = 'Banker token credits (2 per append):';
    for (var c = 0; c < Math.min(st.n * 2, 24); c++) {
      var cx = startX + c * 14 + 6;
      S('circle', { cx: cx, cy: coinsY, r: 5, class: 'ha-coin' }, svg);
    }
  }

  if (reduce || !M || !M.animate) {
    drawHero(sequence.length - 1);
    return;
  }

  var curStep = -1;
  M.animate(0, sequence.length, {
    duration: sequence.length * 1.4,
    ease: 'linear',
    repeat: Infinity,
    onUpdate: function(v) {
      var s = Math.min(sequence.length - 1, Math.floor(v));
      if (s !== curStep) {
        curStep = s;
        drawHero(curStep);
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
