/* divisibility-primes-gcd/lesson.js */
/* PURE:begin */
function pureGcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    var t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function pureLcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.floor((Math.abs(a) / pureGcd(a, b)) * Math.abs(b));
}

function pureIsPrime(n) {
  if (n < 2) return false;
  for (var d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

function pureSubSteps(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  if (a === 0 || b === 0) return 0;
  var steps = 0;
  while (a !== b) {
    steps++;
    if (a > b) a -= b;
    else b -= a;
  }
  return steps;
}

function computeFactorPreset(n) {
  var sqrtFloor = Math.floor(Math.sqrt(n));
  var pairs = [];
  var trials = [];
  var d;
  for (d = 1; d <= sqrtFloor; d++) {
    if (n % d === 0) {
      pairs.push([d, Math.floor(n / d)]);
    }
  }
  for (d = 2; d <= sqrtFloor; d++) {
    trials.push({ d: d, hit: n % d === 0 });
  }
  return {
    n: n,
    sqrtFloor: sqrtFloor,
    pairs: pairs,
    trials: trials,
    isPrime: pureIsPrime(n),
    trialsCount: Math.max(0, sqrtFloor - 1),
    naiveCount: Math.max(0, n - 2)
  };
}

var FACTOR_PRESETS = [36, 37, 49, 60, 97, 100].map(computeFactorPreset);

function computeSieve(limit) {
  var isP = new Array(limit + 1);
  for (var i = 0; i <= limit; i++) isP[i] = true;
  isP[0] = isP[1] = false;
  var steps = [];
  var totalOps = 0;
  for (var p = 2; p * p <= limit; p++) {
    if (isP[p]) {
      var mults = [];
      for (var m = p * p; m <= limit; m += p) {
        totalOps++;
        mults.push(m);
        isP[m] = false;
      }
      steps.push({ p: p, mults: mults });
    }
  }
  var primes = [];
  for (var j = 2; j <= limit; j++) {
    if (isP[j]) primes.push(j);
  }
  return {
    limit: limit,
    primes: primes,
    steps: steps,
    totalOps: totalOps
  };
}

var SIEVE_50 = computeSieve(50);

function computeEuclidPreset(a, b) {
  var curA = a;
  var curB = b;
  var steps = [];
  while (curB !== 0) {
    var q = Math.floor(curA / curB);
    var r = curA % curB;
    steps.push({ a: curA, b: curB, q: q, r: r });
    curA = curB;
    curB = r;
  }
  return {
    a: a,
    b: b,
    gcd: curA,
    lcm: pureLcm(a, b),
    modSteps: steps,
    modCount: steps.length,
    subCount: pureSubSteps(a, b)
  };
}

var EUCLID_PRESETS = [
  [48, 18],
  [252, 105],
  [100, 60],
  [1000, 2],
  [89, 55]
].map(function(pair) { return computeEuclidPreset(pair[0], pair[1]); });

/* The demo runs the two orders on this machine's own doubles. a and b are inputs; gcd, the products and
   the verdicts are computed, so the page prints what this engine does, not a typed string. */
function pureCommas(str) {
  var parts = String(str).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

var SUPERS = "\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079";
function pureSci(x) {
  var parts = x.toExponential(1).split("e");
  var exp = String(Math.abs(parseInt(parts[1], 10))).split("").map(function(c) { return SUPERS[+c]; }).join("");
  return parts[0] + " \u00d7 10" + (parseInt(parts[1], 10) < 0 ? "\u207b" : "") + exp;
}

var OVERFLOW_DEMO = (function() {
  var a = 300000003, b = 500000005;
  var g = pureGcd(a, b);
  var exact = (BigInt(a) * BigInt(b)) / BigInt(g);
  var mulFirst = (a * b) / g;
  var divFirst = (a / g) * b;
  return {
    a: a,
    b: b,
    g: g,
    aOverG: a / g,
    product: a * b,
    productSci: pureSci(a * b),
    trueLcm: exact.toString(),
    mulFirst: String(mulFirst),
    divFirst: String(divFirst),
    mulFirstExact: String(mulFirst) === exact.toString(),
    divFirstExact: String(divFirst) === exact.toString(),
    safeMax: Number.MAX_SAFE_INTEGER
  };
})();

var FACTS = {
  sieveOps50: SIEVE_50.totalOps,
  primesCount50: SIEVE_50.primes.length,
  euclidSteps48_18: EUCLID_PRESETS[0].modCount,
  euclidSteps252_105: EUCLID_PRESETS[1].modCount,
  euclidSteps1000_2: EUCLID_PRESETS[3].modCount,
  subSteps1000_2: EUCLID_PRESETS[3].subCount,
  lcmDemo: OVERFLOW_DEMO.trueLcm,
  trialDiv1e6: "67,740,404",
  sieveMarks1e6: "2,122,048"
};
/* PURE:end */

// ---- DOM / Widgets ----
/* Labels are HTML over the SVG, never SVG text: the viewBox scales to the card, and 10px text in it drew at ~5px on a phone. */
function heroLabel(layer, x, y, vbW, vbH, html, cls, anchor) {
  var d = el("div", "hl " + (cls || ""), html);
  d.style.left = (x / vbW * 100) + "%";
  d.style.top = (y / vbH * 100) + "%";
  d.setAttribute("data-anchor", anchor || "c");
  layer.appendChild(d);
}

function drawHero() {
  var svg = document.getElementById("heroPairs");
  var layer = document.getElementById("heroLabels");
  if (!svg || !layer) return;
  svg.innerHTML = "";
  layer.innerHTML = "";
  var W = 560, H = 250;
  var n = FACTOR_PRESETS[0].n;
  var root = Math.floor(Math.sqrt(n));
  var pairs = FACTOR_PRESETS[0].pairs; // the same pairs the factor widget lists for 36
  var pivotX = 280;
  S("line", { x1: pivotX, y1: 40, x2: pivotX, y2: 235, stroke: "var(--fam)", "stroke-width": 2, "stroke-dasharray": "4 3" }, svg);
  heroLabel(layer, pivotX, 16, W, H, "\u221a" + n + " = " + root, "hl-pivot", "c");
  var rowGap = 40, top = 60;
  pairs.forEach(function(p, i) {
    var y = top + i * rowGap;
    var x1 = pivotX - 40 - (root - p[0]) * 40;
    var x2 = pivotX + 40 + (p[1] - root) * 6;
    S("path", { d: "M" + x1 + "," + y + " Q" + pivotX + "," + (y - 18) + " " + x2 + "," + y, fill: "none", stroke: "var(--hair2)", "stroke-width": 1.2 }, svg);
    heroLabel(layer, x1, y, W, H, String(p[0]), "hl-chip hl-small", "c");
    heroLabel(layer, x2, y, W, H, String(p[1]), "hl-chip", "c");
  });
}

function mountFactorStepper() {
  var host = document.getElementById("factorStepper");
  if (!host) return;
  var curIdx = 0;

  var tabsWrap = host.querySelector("#factorTabs");
  var card = host.querySelector("#factorCard");

  function render() {
    var p = FACTOR_PRESETS[curIdx];
    // Update tabs
    tabsWrap.querySelectorAll("button").forEach(function(b, i) {
      b.setAttribute("aria-pressed", i === curIdx ? "true" : "false");
    });
    // Build card content
    var badgeClass = p.isPrime ? "good" : "warn";
    var badgeText = p.isPrime ? "Prime (no divisor ≤ √n)" : "Composite (has divisor ≤ √n)";

    var pairsHtml = p.pairs.map(function(pair) {
      return '<div class="pair-bubble"><span class="small-d">' + pair[0] + '</span> × <span class="large-d">' + pair[1] + '</span> = ' + p.n + '</div>';
    }).join("");

    var chipsHtml = p.trials.map(function(t) {
      var cls = t.hit ? "scan-chip hit" : "scan-chip tested";
      return '<span class="' + cls + '">d=' + t.d + (t.hit ? ' (divides!)' : '') + '</span>';
    }).join("");

    card.innerHTML = [
      '<div class="dsa-head">',
      '  <span class="dsa-title">n = ' + p.n + ' (⌊√' + p.n + '⌋ = ' + p.sqrtFloor + ')</span>',
      '  <span class="dsa-badge ' + badgeClass + '">' + badgeText + '</span>',
      '</div>',
      '<div class="factor-pairs-wrap">',
      '  <div style="font: 600 12px Space Mono, monospace; color: var(--mut);">FACTOR PAIRS:</div>',
      '  <div class="pairs-grid">' + pairsHtml + '</div>',
      '  <div style="font: 600 12px Space Mono, monospace; color: var(--mut); margin-top: 8px;">DIVISORS TO TRY, d = 2 … ⌊√n⌋ (a composite stops at its first hit):</div>',
      '  <div class="scanned-list">' + (chipsHtml || '<span style="font: 11px JetBrains Mono; color: var(--mut);">None: n < 4 has no candidate d with d² ≤ n</span>') + '</div>',
      '  <div class="comp-banner" style="margin-top: 10px;">',
      '    <div class="comp-box">',
      '      <div class="comp-box-title">Divisors to try with the √n bound</div>',
      '      <div class="comp-box-val">' + p.trialsCount + ' tests</div>',
      '    </div>',
      '    <div class="comp-box">',
      '      <div class="comp-box-title">Divisors to try without it, d = 2 … n − 1</div>',
      '      <div class="comp-box-val">' + p.naiveCount + ' tests</div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("");
  }

  FACTOR_PRESETS.forEach(function(p, i) {
    var b = el("button", "tab", "n = " + p.n + (p.isPrime ? " (prime)" : ""));
    b.type = "button";
    b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
    b.addEventListener("click", function() {
      curIdx = i;
      render();
    });
    tabsWrap.appendChild(b);
  });

  render();
}

function mountSieveWidget() {
  var host = document.getElementById("sieveWidget");
  if (!host) return;

  var stepIdx = -1; // -1: initial (all pending), 0: p=2, 1: p=3, 2: p=5, 3: p=7, 4: complete
  var gridEl = host.querySelector("#sieveGridEl");
  var stepBtn = host.querySelector("#sieveStepBtn");
  var resetBtn = host.querySelector("#sieveResetBtn");
  var statusEl = host.querySelector("#sieveStatus");
  var opsCountEl = host.querySelector("#sieveOpsCount");
  host.querySelector("#sieveRange").textContent = "Range: 2.." + SIEVE_50.limit;
  host.querySelector("#sieveOpsReadout").textContent = "Marks made, each starting at p²: " + SIEVE_50.totalOps;
  host.querySelector("#sievePrimesCount").textContent = "Primes found: " + SIEVE_50.primes.length;

  function renderGrid() {
    gridEl.innerHTML = "";
    var currentStep = stepIdx >= 0 && stepIdx < SIEVE_50.steps.length ? SIEVE_50.steps[stepIdx] : null;
    var markedUpToStep = new Set();
    var cumulativeOps = 0;
    for (var s = 0; s <= Math.min(stepIdx, SIEVE_50.steps.length - 1); s++) {
      var step = SIEVE_50.steps[s];
      step.mults.forEach(function(m) {
        markedUpToStep.add(m);
        cumulativeOps++;
      });
    }

    for (var num = 2; num <= 50; num++) {
      var cell = el("div", "sieve-cell");
      cell.textContent = String(num);

      if (stepIdx === -1) {
        // Fresh state
      } else if (stepIdx >= SIEVE_50.steps.length) {
        // Complete
        if (SIEVE_50.primes.indexOf(num) >= 0) {
          cell.classList.add("prime");
        } else {
          cell.classList.add("crossed");
        }
      } else {
        // In progress
        if (currentStep && num === currentStep.p) {
          cell.classList.add("current-prime");
        } else if (currentStep && currentStep.mults.indexOf(num) >= 0) {
          cell.classList.add("current-multiple");
        } else if (markedUpToStep.has(num)) {
          cell.classList.add("crossed");
        } else if (SIEVE_50.primes.indexOf(num) >= 0 && num < (currentStep ? currentStep.p : 100)) {
          cell.classList.add("prime");
        }
      }
      gridEl.appendChild(cell);
    }

    opsCountEl.textContent = cumulativeOps + " marks";
    if (stepIdx === -1) {
      statusEl.textContent = "Ready. Click 'Step prime' to mark multiples.";
      stepBtn.disabled = false;
      stepBtn.textContent = "Step prime";
    } else if (stepIdx < SIEVE_50.steps.length) {
      var st = SIEVE_50.steps[stepIdx];
      statusEl.textContent = "p = " + st.p + " is prime. Marking multiples starting at " + st.p + "² = " + (st.p * st.p) + " (" + st.mults.length + " multiples).";
      stepBtn.disabled = false;
    } else {
      statusEl.textContent = "Sieve complete: every prime p with p² ≤ " + SIEVE_50.limit + " has been used (p ≤ " + Math.floor(Math.sqrt(SIEVE_50.limit)) + "). The " + SIEVE_50.primes.length + " unmarked numbers are prime.";
      stepBtn.disabled = true;
    }
  }

  stepBtn.addEventListener("click", function() {
    if (stepIdx < SIEVE_50.steps.length) {
      stepIdx++;
      renderGrid();
    }
  });

  resetBtn.addEventListener("click", function() {
    stepIdx = -1;
    renderGrid();
  });

  renderGrid();
}

function mountEuclidWidget() {
  var host = document.getElementById("euclidWidget");
  if (!host) return;

  var curIdx = 0;
  var tabsWrap = host.querySelector("#euclidTabs");
  var tableBody = host.querySelector("#euclidTableBody");
  var modCountEl = host.querySelector("#euclidModCount");
  var subCountEl = host.querySelector("#euclidSubCount");
  var gcdResEl = host.querySelector("#euclidGcdRes");

  function render() {
    var p = EUCLID_PRESETS[curIdx];
    tabsWrap.querySelectorAll("button").forEach(function(b, i) {
      b.setAttribute("aria-pressed", i === curIdx ? "true" : "false");
    });

    tableBody.innerHTML = "";
    p.modSteps.forEach(function(s, idx) {
      var tr = el("tr");
      tr.innerHTML = [
        "<td>Step " + (idx + 1) + "</td>",
        "<td>" + s.a + "</td>",
        "<td>" + s.b + "</td>",
        "<td>" + s.q + "</td>",
        "<td class='res'>" + s.r + (s.r === 0 ? " (done!)" : "") + "</td>"
      ].join("");
      tableBody.appendChild(tr);
    });

    modCountEl.textContent = p.modCount + " steps";
    subCountEl.textContent = p.subCount + " steps";
    gcdResEl.textContent = "gcd(" + p.a + ", " + p.b + ") = " + p.gcd;
  }

  EUCLID_PRESETS.forEach(function(p, i) {
    var b = el("button", "tab", "(" + p.a + ", " + p.b + ")");
    b.type = "button";
    b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
    b.addEventListener("click", function() {
      curIdx = i;
      render();
    });
    tabsWrap.appendChild(b);
  });

  render();
}

function mountOverflowDemo() {
  var host = document.getElementById("overflowDemo");
  if (!host) return;
  var body = host.querySelector("#overflowTableBody");
  if (!body) return;
  var d = OVERFLOW_DEMO;

  function verdict(ok, goodText, badText) {
    return '<td class="' + (ok ? "val-good" : "val-bad") + '">' + (ok ? goodText : badText) + '</td>';
  }

  body.innerHTML = [
    '<tr>',
    '  <td>Inputs: a, b</td>',
    '  <td colspan="2">a = ' + pureCommas(d.a) + ' &nbsp; b = ' + pureCommas(d.b) + ' &nbsp; (gcd = ' + pureCommas(d.g) + ')</td>',
    '</tr>',
    '<tr>',
    '  <td>Exact lcm (BigInt)</td>',
    '  <td colspan="2" class="val-good">' + pureCommas(d.trueLcm) + '</td>',
    '</tr>',
    '<tr>',
    '  <td>Divide first: (a / gcd) * b</td>',
    '  <td class="' + (d.divFirstExact ? "val-good" : "val-bad") + '">' + pureCommas(d.divFirst) + '</td>',
    verdict(d.divFirstExact, 'EXACT: a / gcd = ' + pureCommas(d.aOverG) + ' and the product equals the lcm', 'NOT EXACT'),
    '</tr>',
    '<tr>',
    '  <td>Multiply first: (a * b) / gcd</td>',
    '  <td class="' + (d.mulFirstExact ? "val-good" : "val-bad") + '">' + pureCommas(d.mulFirst) + '</td>',
    verdict(!d.mulFirstExact, 'EXACT (this input does not trip the rounding)', 'WRONG: a · b = ' + d.productSci + ' is past 2⁵³ (' + pureCommas(d.safeMax) + ' + 1), so it was rounded before the division'),
    '</tr>'
  ].join("");
}

// Global initialization
document.addEventListener("DOMContentLoaded", function() {
  drawHero();
  mountFactorStepper();
  mountSieveWidget();
  mountEuclidWidget();
  mountOverflowDemo();
  mountLesson();
});
onRepaint(function() {
  drawHero();
});
