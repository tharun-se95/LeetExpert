/* counting-and-combinatorics/lesson.js */
/* PURE:begin */
function pureChoose(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  var res = 1;
  for (var i = 1; i <= k; i++) {
    res = (res * (n - k + i)) / i; // exact: res is C(n - k + i - 1, i - 1), and the product is divisible by i
  }
  return res;
}

function purePerm(n, k) {
  if (k < 0 || k > n) return 0;
  var res = 1;
  for (var i = 0; i < k; i++) {
    res *= (n - i);
  }
  return res;
}

function pureFactorial(n) {
  var res = 1;
  for (var i = 1; i <= n; i++) res *= i;
  return res;
}

var BASKET_DATA = {
  wraps: ["Kraft Box", "Gloss Basket"],
  ribbons: ["Crimson", "Navy", "Gold", "Forest"],
  tokens: ["Bookmark", "Brass Pin", "Wax Seal"]
};

var BASKET_TOTAL = BASKET_DATA.wraps.length * BASKET_DATA.ribbons.length * BASKET_DATA.tokens.length;

function enumeratePermutations(items, k) {
  var out = [];
  function backtrack(curr, used) {
    if (curr.length === k) {
      out.push(curr.join(""));
      return;
    }
    for (var i = 0; i < items.length; i++) {
      if (!used[i]) {
        used[i] = true;
        curr.push(items[i]);
        backtrack(curr, used);
        curr.pop();
        used[i] = false;
      }
    }
  }
  backtrack([], new Array(items.length).fill(false));
  return out;
}

function enumerateCombinations(items, k) {
  var out = [];
  function backtrack(start, curr) {
    if (curr.length === k) {
      out.push(curr.join(""));
      return;
    }
    for (var i = start; i < items.length; i++) {
      curr.push(items[i]);
      backtrack(i + 1, curr);
      curr.pop();
    }
  }
  backtrack(0, []);
  return out;
}

var SAMPLE_ITEMS = ["A", "B", "C", "D"];

var PERM_COMB_DATA = {
  k2: {
    k: 2,
    perms: enumeratePermutations(SAMPLE_ITEMS, 2),
    combs: enumerateCombinations(SAMPLE_ITEMS, 2),
    permCount: purePerm(4, 2),
    combCount: pureChoose(4, 2),
    overcount: pureFactorial(2)
  },
  k3: {
    k: 3,
    perms: enumeratePermutations(SAMPLE_ITEMS, 3),
    combs: enumerateCombinations(SAMPLE_ITEMS, 3),
    permCount: purePerm(4, 3),
    combCount: pureChoose(4, 3),
    overcount: pureFactorial(3)
  }
};

/* Answer-space sizes are exact BigInts; the table prints them and what they cost at 10^8 operations a
   second. Subsets and permutations cost n operations per state (building or inspecting the set), pairs one. */
function bigFactorial(n) {
  var r = 1n;
  for (var i = 2n; i <= BigInt(n); i++) r *= i;
  return r;
}

var OPS_PER_SECOND = 100000000n;

function pureCommas(str) {
  return String(str).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var SUPERS = "\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079";
/* b >= 10^12 prints as m.mm x 10^e, rounded half up on the third digit */
function pureBig(b) {
  var s = b.toString();
  if (s.length <= 12) return pureCommas(s);
  var e = s.length - 1;
  var m = BigInt(s.slice(0, 3)) + (s.charCodeAt(3) >= 53 ? 1n : 0n);
  if (m === 1000n) { m = 100n; e += 1; }
  var ms = m.toString();
  return ms[0] + "." + ms.slice(1) + " \u00d7 10" + String(e).split("").map(function(c) { return SUPERS[+c]; }).join("");
}

/* time = ops / 10^8 seconds, in the largest unit that keeps it readable */
function pureDuration(ops) {
  if (ops < 100000n) return "under 1 ms";
  var ms = ops / 100000n;
  if (ms < 1000n) return ms + " ms";
  var hundredths = ops / 1000000n;
  if (hundredths < 10000n) {
    var h = Number(hundredths);
    return (h / 100).toFixed(2) + " s";
  }
  var secs = ops / OPS_PER_SECOND;
  if (secs < 7200n) return secs + " s";
  var hours = secs / 3600n;
  if (hours < 48n) return hours + " hours";
  var days = secs / 86400n;
  if (days < 730n) return days + " days";
  var years = secs / 31557600n;
  return pureBig(years) + " years";
}

function spaceRow(label, states, perState) {
  var ops = states * perState;
  return { label: label, states: states.toString(), statesText: pureBig(states), ops: ops.toString(), opsText: pureBig(ops), time: pureDuration(ops), fits: ops <= OPS_PER_SECOND };
}

function computeSpace(n) {
  var bn = BigInt(n);
  return {
    n: n,
    rows: [
      spaceRow("All subsets (2\u207f)", 2n ** bn, bn),
      spaceRow("All permutations (n!)", bigFactorial(n), bn),
      spaceRow("All pairs (C(n, 2))", bn * (bn - 1n) / 2n, 1n)
    ]
  };
}

var SPACE_PRESETS = [10, 16, 22, 50, 1000].map(computeSpace);

function spaceSummary(p) {
  var fit = p.rows.filter(function(r) { return r.fits; }).map(function(r) { return r.label.split(" (")[0].replace("All ", "").toLowerCase(); });
  var over = p.rows.filter(function(r) { return !r.fits; }).map(function(r) { return r.label.split(" (")[0].replace("All ", "").toLowerCase(); });
  return "At n = " + p.n + ": " + (fit.length ? fit.join(" and ") + " fit in 10\u2078 operations" : "nothing fits in 10\u2078 operations") + (over.length ? "; " + over.join(" and ") + (over.length > 1 ? " do not." : " does not.") : ".");
}

var FACTS = {
  basketTotal: BASKET_TOTAL,
  perm4_2: PERM_COMB_DATA.k2.permCount,
  comb4_2: PERM_COMB_DATA.k2.combCount,
  perm4_3: PERM_COMB_DATA.k3.permCount,
  comb4_3: PERM_COMB_DATA.k3.combCount,
  subsets16: pureCommas((2n ** 16n).toString()),
  choose50_3: pureCommas(pureChoose(50, 3)),
  digits50: bigFactorial(50).toString().length
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
  var svg = document.getElementById("heroBaskets");
  var layer = document.getElementById("heroLabels");
  if (!svg || !layer) return;
  svg.innerHTML = "";
  layer.innerHTML = "";
  var W = 560, H = 160;
  var nWrap = BASKET_DATA.wraps.length, nRib = BASKET_DATA.ribbons.length, nTok = BASKET_DATA.tokens.length;
  // Branching tree: root -> wraps -> ribbons -> tokens, one leaf per basket
  var rx = 60, ry = 80;
  S("circle", { cx: rx, cy: ry, r: 6, fill: "var(--fam)" }, svg);
  heroLabel(layer, rx, ry + 18, W, H, "start", "hl-mut", "c");

  var wrapY = [52, 108];
  wrapY.forEach(function(wy) {
    S("line", { x1: rx, y1: ry, x2: 190, y2: wy, stroke: "var(--hair2)", "stroke-width": 1.5 }, svg);
    S("circle", { cx: 190, cy: wy, r: 5, fill: "var(--deep)", stroke: "var(--fam)", "stroke-width": 1.5 }, svg);

    for (var ri = 0; ri < nRib; ri++) {
      var ryPos = wy - 18 + ri * 12;
      S("line", { x1: 190, y1: wy, x2: 340, y2: ryPos, stroke: "var(--hair2)", "stroke-width": 1 }, svg);
      S("circle", { cx: 340, cy: ryPos, r: 3, fill: "var(--mut)" }, svg);

      for (var ti = 0; ti < nTok; ti++) {
        var tyPos = ryPos - 4 + ti * 4;
        S("line", { x1: 340, y1: ryPos, x2: 490, y2: tyPos, stroke: "var(--hair)", "stroke-width": 0.8 }, svg);
        S("circle", { cx: 490, cy: tyPos, r: 2, fill: "var(--fam)" }, svg);
      }
    }
  });
  if (wrapY.length !== nWrap) throw new Error("hero draws " + wrapY.length + " wraps but the data has " + nWrap);

  heroLabel(layer, 190, 14, W, H, nWrap + " wraps", "hl-mut", "c");
  heroLabel(layer, 340, 14, W, H, "\u00d7 " + nRib + " ribbons", "hl-mut", "c");
  heroLabel(layer, 490, 14, W, H, "\u00d7 " + nTok + " tokens", "hl-mut", "c");
  heroLabel(layer, 490, 148, W, H, "= " + BASKET_TOTAL + " baskets", "hl-total", "c");
}

function mountBasketWidget() {
  var host = document.getElementById("basketWidget");
  if (!host) return;

  var selWrap = 0;
  var selRibbon = 0;
  var selToken = 0;

  var wrapCol = host.querySelector("#wrapCol");
  var ribbonCol = host.querySelector("#ribbonCol");
  var tokenCol = host.querySelector("#tokenCol");
  var calcReadout = host.querySelector("#basketCalc");
  host.querySelector("#wrapName").textContent = "1. Wrapping style (" + BASKET_DATA.wraps.length + ")";
  host.querySelector("#ribbonName").textContent = "2. Ribbon color (" + BASKET_DATA.ribbons.length + ")";
  host.querySelector("#tokenName").textContent = "3. Token gift (" + BASKET_DATA.tokens.length + ")";

  function renderButtons(col, items, selectedIdx, onSelect) {
    col.innerHTML = "";
    items.forEach(function(item, idx) {
      var btn = el("button", "slot-btn", item);
      btn.type = "button";
      btn.setAttribute("aria-pressed", idx === selectedIdx ? "true" : "false");
      btn.addEventListener("click", function() {
        onSelect(idx);
      });
      col.appendChild(btn);
    });
  }

  function update() {
    renderButtons(wrapCol, BASKET_DATA.wraps, selWrap, function(i) { selWrap = i; update(); });
    renderButtons(ribbonCol, BASKET_DATA.ribbons, selRibbon, function(i) { selRibbon = i; update(); });
    renderButtons(tokenCol, BASKET_DATA.tokens, selToken, function(i) { selToken = i; update(); });

    var chosen = BASKET_DATA.wraps[selWrap] + " + " + BASKET_DATA.ribbons[selRibbon] + " Ribbon + " + BASKET_DATA.tokens[selToken];
    calcReadout.innerHTML = [
      '<span>Selected combination: <b>' + chosen + '</b></span>',
      '<span class="basket-total">' + BASKET_DATA.wraps.length + ' × ' + BASKET_DATA.ribbons.length + ' × ' + BASKET_DATA.tokens.length + ' = ' + BASKET_TOTAL + ' distinct baskets</span>'
    ].join("");
  }

  update();
}

function mountPermCombWidget() {
  var host = document.getElementById("permCombWidget");
  if (!host) return;

  var curK = "k2";
  var tabsWrap = host.querySelector("#pcTabs");
  var permsBox = host.querySelector("#permsList");
  var combsBox = host.querySelector("#combsList");
  var permCountLabel = host.querySelector("#permCountLabel");
  var combCountLabel = host.querySelector("#combCountLabel");
  var formulaLabel = host.querySelector("#pcFormulaLabel");

  function render() {
    var d = PERM_COMB_DATA[curK];
    tabsWrap.querySelectorAll("button").forEach(function(b) {
      b.setAttribute("aria-pressed", b.dataset.k === curK ? "true" : "false");
    });

    permsBox.innerHTML = d.perms.map(function(s) {
      return '<span class="pc-chip">' + s + '</span>';
    }).join("");

    combsBox.innerHTML = d.combs.map(function(s) {
      return '<span class="pc-chip grouped">' + s + '</span>';
    }).join("");

    permCountLabel.textContent = "P(4, " + d.k + ") = " + d.permCount + " ordered displays";
    combCountLabel.textContent = "C(4, " + d.k + ") = " + d.combCount + " crate packages";
    formulaLabel.innerHTML = "Divide out overcount: C(4, " + d.k + ") = P(4, " + d.k + ") / " + d.k + "! = " + d.permCount + " / " + d.overcount + " = <b>" + d.combCount + "</b>";
  }

  [
    { id: "k2", label: "k = 2 items" },
    { id: "k3", label: "k = 3 items" }
  ].forEach(function(t, i) {
    var b = el("button", "tab", t.label);
    b.type = "button";
    b.dataset.k = t.id;
    b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
    b.addEventListener("click", function() {
      curK = t.id;
      render();
    });
    tabsWrap.appendChild(b);
  });

  render();
}

function mountSpaceSizesWidget() {
  var host = document.getElementById("spaceSizesWidget");
  if (!host) return;

  var curIdx = 0;
  var tabsWrap = host.querySelector("#spaceTabs");
  var tableBody = host.querySelector("#spaceTableBody");
  var summaryText = host.querySelector("#spaceSummary");

  function render() {
    var p = SPACE_PRESETS[curIdx];
    tabsWrap.querySelectorAll("button").forEach(function(b, i) {
      b.setAttribute("aria-pressed", i === curIdx ? "true" : "false");
    });

    tableBody.innerHTML = p.rows.map(function(r) {
      return [
        '<tr>',
        '  <td><b>' + r.label + '</b></td>',
        '  <td>' + r.statesText + '</td>',
        '  <td>' + r.opsText + '</td>',
        '  <td class="' + (r.fits ? "feas-good" : "feas-bad") + '">' + r.time + '</td>',
        '</tr>'
      ].join("");
    }).join("");

    summaryText.textContent = spaceSummary(p);
  }

  SPACE_PRESETS.forEach(function(p, i) {
    var b = el("button", "tab", "n = " + p.n);
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

document.addEventListener("DOMContentLoaded", function() {
  drawHero();
  mountBasketWidget();
  mountPermCombWidget();
  mountSpaceSizesWidget();
  mountLesson();
});

onRepaint(function() {
  drawHero();
});
