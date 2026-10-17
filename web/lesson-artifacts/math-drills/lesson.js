/* math-drills/lesson.js */
/* PURE:begin */
/* Inputs (10^9 cards, i = 0 on n = 5, 999,999,900 x 999,999,999 mod 10^9 + 7, n = 12, 252 and 105, q = 10^5
   queries with n <= 10^7) are typed because they are the scenarios. Every result below is computed here, and
   check.py recomputes it in Python, in node, or from the real code files. */
var SUPERS = "⁰¹²³⁴⁵⁶⁷⁸⁹";
function pureCommas(x) {
  return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function pureSci(x, digits) {
  var parts = x.toExponential(digits).split("e");
  var e = parseInt(parts[1], 10);
  return parts[0] + " × 10" + String(Math.abs(e)).split("").map(function(c) { return SUPERS[+c]; }).join("");
}
function pureBitLength(n) {
  var h = 0;
  while (n > 0) { h++; n = Math.floor(n / 2); }
  return h;
}
function pureFactorial(n) {
  var r = 1;
  for (var i = 2; i <= n; i++) r *= i;
  return r;
}
function pureEuclid(a, b) {
  var rows = [];
  while (b !== 0) {
    rows.push({ a: a, b: b, q: Math.floor(a / b), r: a % b });
    var t = a % b;
    a = b;
    b = t;
  }
  return { gcd: a, rows: rows };
}
function pureLargestCommonPrime(a, b) {
  var best = 1;
  for (var p = 2; p <= Math.min(a, b); p++) {
    var prime = true;
    for (var d = 2; d * d <= p; d++) if (p % d === 0) { prime = false; break; }
    if (prime && a % p === 0 && b % p === 0) best = p;
  }
  return best;
}
/* marks the sieve makes up to n: for every prime p with p*p <= n, the multiples p*p, p*p + p, ... <= n */
function pureSieveMarks(n) {
  var r = Math.floor(Math.sqrt(n));
  var composite = new Uint8Array(r + 1);
  var marks = 0;
  for (var p = 2; p <= r; p++) {
    if (!composite[p]) {
      for (var m = p * p; m <= r; m += p) composite[m] = 1;
      marks += Math.floor((n - p * p) / p) + 1;
    }
  }
  return marks;
}

var D1 = (function() {
  var n = 1000000000;
  return {
    n: n,
    levels: pureBitLength(n),
    log2: Math.log2(n),
    log2of10: Math.log2(10),
    log2of1000: Math.log2(1000),
    sqrt: Math.round(Math.sqrt(n)),
    cbrt: Math.round(Math.cbrt(n))
  };
})();

var D2 = (function() {
  var i = 0, n = 5;
  var js = (i - 1) % n;                  // the page runs this in the visitor's own JavaScript engine
  var floored = (((i - 1) % n) + n) % n; // what Python's % returns, and the fix in JavaScript
  return { i: i, n: n, js: js, py: floored, fixed: floored };
})();

var D3 = (function() {
  var a = 999999900, b = 999999999, mod = 1000000007;
  var plain = (a * b) % mod;
  var big = Number((BigInt(a) * BigInt(b)) % BigInt(mod));
  return {
    a: a, b: b, mod: mod,
    plain: plain, big: big, diff: Math.abs(plain - big),
    maxProduct: (mod - 1) * (mod - 1),
    maxProductSci: pureSci((mod - 1) * (mod - 1), 2),
    safeMax: Number.MAX_SAFE_INTEGER
  };
})();

var D4 = (function() {
  var n = 12;
  var perms = pureFactorial(n);
  return { n: n, perms: perms, subsets: Math.pow(2, n), seconds: perms / 100000000, dpStates: Math.pow(2, n) * n, subsets20: Math.pow(2, 20) };
})();

var D5 = (function() {
  var a = 252, b = 105;
  var e = pureEuclid(a, b);
  return { a: a, b: b, gcd: e.gcd, rows: e.rows, commonPrime: pureLargestCommonPrime(a, b) };
})();

var D6 = (function() {
  var q = 100000, n = 10000000;
  var marks = pureSieveMarks(n);
  var trial = q * Math.sqrt(n);
  return {
    q: q, n: n,
    trial: trial, trialSci: pureSci(trial, 2), trialSeconds: trial / 100000000,
    marks: marks, nlnln: n * Math.log(Math.log(n)),
    bytes: n + 1, bitsetBytes: Math.ceil((n + 1) / 8),
    breakeven: Math.ceil(marks / Math.sqrt(n))
  };
})();

var DRILLS = [
  {
    id: 1,
    topic: "Logs in disguise",
    question: "A balanced branching cabinet holds 10⁹ index cards. How many drawer-checks does one lookup cost?",
    choices: [
      "About " + pureCommas(D1.sqrt) + ": the square root of n, as in trial division",
      "About " + D1.levels + ": ⌊log₂ n⌋ + 1, one check per halving of the cabinet",
      "About " + pureCommas(D1.cbrt) + ": the cube root of n, one check per row of drawers"
    ],
    answer: 1,
    why: "A balanced tree halves the candidates at each check, so a lookup makes at most ⌊log₂ n⌋ + 1 = " + D1.levels + " checks for n = 10⁹. √10⁹ = " + pureCommas(D1.sqrt) + " is the trial-division bound, a different quantity."
  },
  {
    id: 2,
    topic: "The JavaScript modulo trap",
    question: "Stepping back with (i - 1) % n from i = 0 on n = 5: which runtime hands you a bad index?",
    choices: [
      "TypeScript: it returns " + D2.js + " because JS % keeps the dividend's sign; Python returns " + D2.py,
      "Python: it returns " + D2.js + " because % keeps the dividend's sign; TypeScript returns " + D2.py,
      "Neither: both return " + D2.py + ", because % always wraps into the range 0 to n - 1"
    ],
    answer: 0,
    why: "Python's % takes the divisor's sign: (0 - 1) % 5 = " + D2.py + ". JavaScript's % keeps the dividend's sign: " + D2.js + ". The portable fix is ((i - 1) % n + n) % n."
  },
  {
    id: 3,
    topic: "Huge products and safe integers",
    question: "Multiplying numbers up to 10⁹ modulo 10⁹ + 7 in TypeScript. What must you do?",
    choices: [
      "Reduce after every multiply with plain numbers; each factor stays under 10⁹ + 7",
      "Multiply everything first with plain numbers, then take % once at the end",
      "Reduce after every multiply using BigInt: two residues multiply to about 10¹⁸"
    ],
    answer: 2,
    why: "Even with a reduction at every step, two residues just below 10⁹ + 7 multiply to as much as " + D3.maxProductSci + ", past 2⁵³ = " + pureCommas(D3.safeMax + 1) + ". A double rounds that product before % runs, so TypeScript needs BigInt."
  },
  {
    id: 4,
    topic: "Counting the search space",
    question: "A problem says n ≤ 12 items go on a shelf in the best order. What does n ≤ 12 tell you?",
    choices: [
      "Orderings number 12! = " + pureCommas(D4.perms) + ": a pruned permutation search or a bitmask DP is intended",
      "Orderings number 2¹² = " + pureCommas(D4.subsets) + ": enumerate the subsets, since n is small",
      "Nothing: a constraint bounds memory and input reading, not the algorithm you choose"
    ],
    answer: 0,
    why: "Orderings are permutations, counted by n!. 12! = " + pureCommas(D4.perms) + " is " + D4.seconds.toFixed(2) + " s at 10⁸ operations per second, over a one-second budget, so the bound announces pruning or a subset DP. 2¹² counts selections, not orderings."
  },
  {
    id: 5,
    topic: "Euclid by hand",
    question: "Find gcd(252, 105) by Euclid's algorithm:",
    choices: [
      D5.rows[0].r + ", the first remainder, 252 mod 105",
      D5.commonPrime + ", the largest prime that divides both numbers",
      D5.gcd + ", the last non-zero remainder before one reaches 0"
    ],
    answer: 2,
    why: D5.rows.map(function(r) { return r.a + " mod " + r.b + " = " + r.r; }).join("; ") + ". The remainder reaches 0 after " + D5.rows.length + " steps; the last non-zero remainder, " + D5.gcd + ", is the gcd. " + D5.commonPrime + " divides both numbers but is not the greatest common divisor."
  },
  {
    id: 6,
    topic: "Sieve or trial division?",
    question: "Answering q = 10⁵ queries asking whether numbers n ≤ 10⁷ are prime:",
    choices: [
      "Sieve wins: " + pureCommas(D6.marks) + " marks once, then O(1) a query, against up to " + D6.trialSci + " divisions",
      "They tie: both do the same total work across the 10⁵ queries",
      "Trial division wins: a table of 10⁷ entries risks running out of memory"
    ],
    answer: 0,
    why: "Trial division costs up to q × √n = " + D6.trialSci + " divisions (" + D6.trialSeconds.toFixed(2) + " s at 10⁸ per second). The sieve makes " + pureCommas(D6.marks) + " marks once and then reads one flag per query. One byte per flag is " + pureCommas(D6.bytes) + " bytes, about 10 MB."
  }
];

DRILLS.forEach(function(d) { d.expect = d.choices[d.answer]; });

var FACTS = {
  d1_ans: D1.levels,
  d1_log2of10: D1.log2of10.toFixed(3),
  d1_log2: D1.log2.toFixed(3),
  d1_log2of1000: D1.log2of1000.toFixed(2),
  d1_sqrt: pureCommas(D1.sqrt),
  d1_cbrt: pureCommas(D1.cbrt),
  d2_py: D2.py,
  d2_js: D2.js,
  d2_fixed: D2.fixed,
  d3_plain: pureCommas(D3.plain),
  d3_big: pureCommas(D3.big),
  d3_diff: pureCommas(D3.diff),
  d3_safe: pureCommas(D3.safeMax),
  d4_perms: pureCommas(D4.perms),
  d4_subsets: pureCommas(D4.subsets),
  d4_seconds: D4.seconds.toFixed(2),
  d4_dp: pureCommas(D4.dpStates),
  d5_r1: D5.rows[0].a + " mod " + D5.rows[0].b + " = " + D5.rows[0].r + " (quotient " + D5.rows[0].q + ")",
  d5_r2: D5.rows[1].a + " mod " + D5.rows[1].b + " = " + D5.rows[1].r + " (quotient " + D5.rows[1].q + ")",
  d5_r3: D5.rows[2].a + " mod " + D5.rows[2].b + " = " + D5.rows[2].r + " (quotient " + D5.rows[2].q + ")",
  d5_gcd: D5.gcd,
  d5_steps: D5.rows.length,
  d6_trial_ops: D6.trialSci,
  d6_trial_secs: D6.trialSeconds.toFixed(2),
  d6_sieve_ops: pureCommas(D6.marks),
  d6_nlnln: pureSci(D6.nlnln, 2),
  d6_bytes: pureCommas(D6.bytes),
  d6_bitset: pureCommas(D6.bitsetBytes)
};
/* PURE:end */

// ---- DOM / Widgets ----
/* The hero is plain HTML cards, not SVG text in a scaled viewBox, so its labels keep their real size on a phone. */
/* The cards are in lesson.md, so the hero has its final size at first paint; building them here moved the layout. */
function drawHero() {
  var host = document.getElementById("heroDrills");
  if (!host) return;
  var cards = host.querySelectorAll(".ha-topic");
  if (cards.length !== DRILLS.length) throw new Error("hero cards in lesson.md do not match DRILLS");
  DRILLS.forEach(function(d, i) {
    if (cards[i].textContent !== d.topic) throw new Error("hero card " + (i + 1) + " is '" + cards[i].textContent + "', DRILLS says '" + d.topic + "'");
  });
}

function mountDrills() {
  DRILLS.forEach(function(d) {
    var host = document.getElementById("drill-card-" + d.id);
    if (!host) return;
    mountPredict(host, [{ d: d, expect: d.expect }], {
      question: function(c) { return c.d.question; },
      choices: function(c) { return c.d.choices; },
      draw: function() { return null; },
      why: function(c) { return c.d.why; }
    });
  });
}

document.addEventListener("DOMContentLoaded", function() {
  drawHero();
  mountDrills();
  mountLesson();
});

onRepaint(function() {
  drawHero();
});
