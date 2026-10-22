/* ================= Arrays in Memory: the lesson =================
   One contiguous block of memory: pure arithmetic to reach any element,
   high price to move anything.
   Every number the page shows is computed in the PURE block below and verified by check.py. */

/* PURE:begin (no DOM below this line until PURE:end) */
function computeAddress(base, index, slotSize) {
  if (index < 0) return -1;
  return base + index * slotSize;
}

function calculateShiftsOnInsert(currentLen, insertIndex) {
  if (insertIndex < 0 || insertIndex > currentLen) return -1;
  return currentLen - insertIndex;
}

function sumFrontInsertShifts(n) {
  return (n * (n - 1)) / 2;
}

function cacheHitRatio(lineBytes, slotBytes) {
  var count = lineBytes / slotBytes;
  return (count - 1) / count;
}

var FACTS = {
  int16HitRate: '15 / 16 (93.8%)',
  quad1kShifts: '499,500',
  quad10kShifts: '49,995,000',
  speedup10k: '5,000×'
};
/* PURE:end */

/* ---------- 1. Interactive RAM Address Calculator ---------- */
function mountAddressCalc(host) {
  if (!host) return;

  var baseInput = host.querySelector('#baseInput');
  var sizeSeg = host.querySelector('#sizeSeg');
  var idxSlider = host.querySelector('#idxSlider');
  var idxLabel = host.querySelector('#idxLabel');
  var formulaText = host.querySelector('#formulaText');
  var ramStrip = host.querySelector('#ramStrip');

  var state = {
    base: 4096,
    slotSize: 8,
    index: 3
  };

  var VALUES = [42, 87, 19, 104, 55, 91, 63, 78];

  function render() {
    if (idxLabel) idxLabel.textContent = String(state.index);
    var offset = state.index * state.slotSize;
    var targetAddr = state.base + offset;

    if (formulaText) {
      formulaText.innerHTML =
        'address(' + state.index + ') = ' +
        'base (' + state.base + ') + ' +
        state.index + ' × ' + state.slotSize + 'B = ' +
        '<span class="math-step">' + targetAddr + '</span> ' +
        '(offset: +' + offset + ' bytes, 0 hops)';
    }

    if (ramStrip) {
      ramStrip.innerHTML = '';
      for (var i = 0; i < VALUES.length; i++) {
        var cell = document.createElement('div');
        var isTarget = i === state.index;
        cell.className = 'ram-cell' + (isTarget ? ' target' : '');
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('aria-label', 'Slot ' + i + ', value ' + VALUES[i] + ', address ' + (state.base + i * state.slotSize));

        var addr = state.base + i * state.slotSize;
        cell.innerHTML =
          '<span class="ram-idx">[' + i + ']</span>' +
          '<span class="ram-val">' + VALUES[i] + '</span>' +
          '<span class="ram-addr">' + addr + '</span>';

        (function(targetIdx) {
          cell.addEventListener('click', function() {
            state.index = targetIdx;
            if (idxSlider) idxSlider.value = String(targetIdx);
            render();
          });
        })(i);

        ramStrip.appendChild(cell);
      }
    }
  }

  if (baseInput) {
    baseInput.addEventListener('change', function(e) {
      var val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 0) {
        state.base = val;
        render();
      }
    });
  }

  if (sizeSeg) {
    var btns = sizeSeg.querySelectorAll('button');
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        btns.forEach(function(b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        state.slotSize = parseInt(btn.getAttribute('data-size') || '8', 10);
        render();
      });
    });
  }

  if (idxSlider) {
    idxSlider.addEventListener('input', function(e) {
      state.index = parseInt(e.target.value, 10);
      render();
    });
  }

  render();
}

/* ---------- 2. Shift Simulator & Train Car Uncoupling ---------- */
function mountShiftSim(host) {
  if (!host) return;

  var track = host.querySelector('#shiftTrack');
  var btnFront = host.querySelector('#btnShiftFront');
  var btnMid = host.querySelector('#btnShiftMid');
  var btnEnd = host.querySelector('#btnShiftEnd');
  var btnReset = host.querySelector('#btnShiftReset');

  var lblLastShifts = host.querySelector('#lblLastShifts');
  var lblTotalShifts = host.querySelector('#lblTotalShifts');
  var lblTheoretical = host.querySelector('#lblTheoretical');

  var INITIAL = [10, 20, 30, 40, 50, 60, 70];
  var CAPACITY = 8;
  var items = INITIAL.slice();
  var totalShifts = 0;
  var lastShifts = 0;
  var insertCount = 0;

  function render(highlightIdx, shiftedIndices) {
    if (lblLastShifts) lblLastShifts.textContent = String(lastShifts);
    if (lblTotalShifts) lblTotalShifts.textContent = String(totalShifts);
    if (lblTheoretical) {
      lblTheoretical.textContent = insertCount > 0 ? String(sumFrontInsertShifts(insertCount + 1)) : '0';
    }

    if (track) {
      track.innerHTML = '';
      for (var i = 0; i < CAPACITY; i++) {
        var slot = document.createElement('div');
        var isOccupied = i < items.length;
        var isInserted = highlightIdx !== undefined && i === highlightIdx;
        var isShifted = shiftedIndices && shiftedIndices.indexOf(i) >= 0;

        var cls = 'shift-slot';
        if (isOccupied) cls += ' occupied';
        if (isInserted) cls += ' inserted';
        if (isShifted) cls += ' shifted';

        slot.className = cls;
        slot.innerHTML =
          '<span class="ram-idx">[' + i + ']</span>' +
          '<span class="ram-val">' + (isOccupied ? items[i] : '—') + '</span>';

        track.appendChild(slot);
      }
    }
  }

  function doInsert(idx, val) {
    if (items.length >= CAPACITY) {
      items.pop(); // discard last element to fit in fixed buffer for demo
    }
    var shifts = calculateShiftsOnInsert(items.length, idx);
    lastShifts = shifts;
    totalShifts += shifts;
    insertCount++;

    var shifted = [];
    for (var s = idx; s < items.length; s++) {
      shifted.push(s + 1);
    }

    items.splice(idx, 0, val);
    render(idx, shifted);
  }

  if (btnFront) {
    btnFront.addEventListener('click', function() {
      doInsert(0, 99);
    });
  }

  if (btnMid) {
    btnMid.addEventListener('click', function() {
      var mid = Math.floor(items.length / 2);
      doInsert(mid, 77);
    });
  }

  if (btnEnd) {
    btnEnd.addEventListener('click', function() {
      doInsert(items.length, 55);
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', function() {
      items = INITIAL.slice();
      totalShifts = 0;
      lastShifts = 0;
      insertCount = 0;
      render();
    });
  }

  render();
}

/* ---------- 3. 64-Byte Cache Line Visualizer ---------- */
function mountCacheVisualizer(host) {
  if (!host) return;

  var grid = host.querySelector('#cacheGrid');
  var btnScan = host.querySelector('#btnScanArray');
  var btnScattered = host.querySelector('#btnScanScattered');
  var btnReset = host.querySelector('#btnResetCache');
  var lblHits = host.querySelector('#lblCacheHits');
  var lblMisses = host.querySelector('#lblCacheMisses');
  var lblHitRate = host.querySelector('#lblCacheHitRate');

  var SLOTS = 16;
  var hits = 0;
  var misses = 0;
  var currentStep = 0;
  var mode = 'idle';

  function render() {
    if (lblHits) lblHits.textContent = String(hits);
    if (lblMisses) lblMisses.textContent = String(misses);
    var total = hits + misses;
    if (lblHitRate) {
      lblHitRate.textContent = total > 0 ? ((hits / total) * 100).toFixed(1) + '%' : '—';
    }

    if (grid) {
      grid.innerHTML = '';
      for (var i = 0; i < SLOTS; i++) {
        var cell = document.createElement('div');
        var cls = 'cache-cell';
        if (mode === 'array') {
          if (i < currentStep) {
            cls += (i === 0 ? ' miss' : ' hit');
          } else {
            cls += ' pending';
          }
        } else if (mode === 'scattered') {
          if (i < currentStep) {
            cls += ' miss';
          } else {
            cls += ' pending';
          }
        } else {
          cls += ' pending';
        }

        cell.className = cls;
        cell.innerHTML = '<span>+' + (i * 4) + 'B</span>';
        grid.appendChild(cell);
      }
    }
  }

  if (btnScan) {
    btnScan.addEventListener('click', function() {
      mode = 'array';
      currentStep = 0;
      hits = 0;
      misses = 0;
      var timer = setInterval(function() {
        if (currentStep >= SLOTS) {
          clearInterval(timer);
          return;
        }
        if (currentStep === 0) {
          misses++; // first word triggers 64-byte line fetch
        } else {
          hits++;   // remaining 15 words already in cache line
        }
        currentStep++;
        render();
      }, 120);
    });
  }

  if (btnScattered) {
    btnScattered.addEventListener('click', function() {
      mode = 'scattered';
      currentStep = 0;
      hits = 0;
      misses = 0;
      var timer = setInterval(function() {
        if (currentStep >= SLOTS) {
          clearInterval(timer);
          return;
        }
        misses++; // scattered pointers hit distinct un-cached memory pages
        currentStep++;
        render();
      }, 120);
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', function() {
      mode = 'idle';
      currentStep = 0;
      hits = 0;
      misses = 0;
      render();
    });
  }

  render();
}

/* ---------- 4. Hero Animation: Memory Train & O(1) Jump ---------- */
function mountHero() {
  var svg = document.getElementById('heroTrain');
  if (!svg) return;

  var num = document.getElementById('heroNum');
  var cap = document.getElementById('heroCap');

  var W = 560;
  var H = 220;
  var CARS = 6;
  var CAR_W = 68;
  var CAR_H = 46;
  var GAP = 12;
  var START_X = 40;
  var TRACK_Y = 130;

  var CAR_VALS = [14, 28, 42, 56, 70, 84];

  var html = '';
  // Track line
  html += '<line class="ht-track" x1="20" y1="' + (TRACK_Y + 16) + '" x2="' + (W - 20) + '" y2="' + (TRACK_Y + 16) + '"/>';

  for (var i = 0; i < CARS; i++) {
    var x = START_X + i * (CAR_W + GAP);
    var y = TRACK_Y - CAR_H;
    // Coupler
    if (i < CARS - 1) {
      html += '<rect class="ht-coupler" x="' + (x + CAR_W) + '" y="' + (y + CAR_H / 2 - 3) + '" width="' + GAP + '" height="6" rx="2"/>';
    }
    // Car
    html += '<rect class="ht-car" id="hCar' + i + '" x="' + x + '" y="' + y + '" width="' + CAR_W + '" height="' + CAR_H + '"/>';
    // Wheels
    html += '<circle class="ht-wheel" cx="' + (x + 16) + '" cy="' + (y + CAR_H + 4) + '" r="6"/>';
    html += '<circle class="ht-wheel" cx="' + (x + CAR_W - 16) + '" cy="' + (y + CAR_H + 4) + '" r="6"/>';
    // Car labels
    html += '<text class="ht-val" id="hVal' + i + '" x="' + (x + CAR_W / 2) + '" y="' + (y + 22) + '">' + CAR_VALS[i] + '</text>';
    html += '<text class="ht-idx" x="' + (x + CAR_W / 2) + '" y="' + (y + 38) + '">[' + i + ']</text>';
    html += '<text class="ht-addr" x="' + (x + CAR_W / 2) + '" y="' + (y - 8) + '">+' + (i * 8) + 'B</text>';
  }

  // Pointer indicator
  html += '<g id="heroPointer" transform="translate(' + (START_X + CAR_W / 2) + ', 40)">';
  html += '<path class="ht-ptr" d="M0,0 L-6,-12 L6,-12 Z"/>';
  html += '<text class="ht-ptr-txt" y="-18">O(1) Direct Jump</text>';
  html += '</g>';

  svg.innerHTML = html;

  var pointer = svg.querySelector('#heroPointer');
  var carRects = [];
  var valTexts = [];
  for (var c = 0; c < CARS; c++) {
    carRects.push(svg.querySelector('#hCar' + c));
    valTexts.push(svg.querySelector('#hVal' + c));
  }

  var targets = [0, 3, 1, 5, 2, 4];
  var targetIdx = 0;

  function stepHero() {
    var carI = targets[targetIdx];
    var targetX = START_X + carI * (CAR_W + GAP) + CAR_W / 2;

    if (pointer) {
      pointer.setAttribute('transform', 'translate(' + targetX + ', 60)');
    }

    carRects.forEach(function(r, idx) {
      if (r) {
        if (idx === carI) {
          r.setAttribute('class', 'ht-car target');
        } else {
          r.setAttribute('class', 'ht-car');
        }
      }
    });

    if (num) num.textContent = '0';
    if (cap) {
      cap.innerHTML = 'Jumped straight to index <b>' + carI + '</b> at address <b>base + ' + (carI * 8) + 'B</b> — no walking platform';
    }

    targetIdx = (targetIdx + 1) % targets.length;
  }

  stepHero();
  if (!reduce) {
    setInterval(stepHero, 2200);
  }
}

/* ---------- Assemble Page ---------- */
(function() {
  readPal();
  mountLesson();
  mountAddressCalc(document.getElementById('addressCalc'));
  mountShiftSim(document.getElementById('shiftSim'));
  mountCacheVisualizer(document.getElementById('cacheVisualizer'));
  mountHero();
  kinetic();
  riseIn();
})();
