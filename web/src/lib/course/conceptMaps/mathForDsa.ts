import type { MindMapNode } from "./types";

/**
 * Concept map for the Math for DSA module. Hand-authored from the
 * module's 6-lesson structure (course/math-for-dsa/*.md), settled by
 * the curriculum-designer review (media-rollout spec §2.5) that added a
 * Summations & Series lesson — the derivation Big O's own lessons lean
 * on informally (triangular sums, geometric/doubling sums) but never
 * gave a dedicated formal treatment.
 */
export const mathForDsaConceptMap: MindMapNode = {
  id: "math-for-dsa",
  label: "Math for DSA",
  children: [
    {
      id: "logs",
      label: "Logarithms & Exponents",
      children: [
        { id: "logs-definition", label: "log_b(x): \"b to what power gives x?\" — inverse of exponentiation" },
        { id: "logs-halving", label: "log2(n) = how many times you can halve n before reaching 1" },
        { id: "logs-magnitude", label: "Every ×1,000 adds ~10 to log2 — 2^10 ≈ 10^3" },
        { id: "logs-rules", label: "Product rule, power rule, change of base (a constant factor, why O never names a base)" },
        { id: "logs-appearances", label: "Halving loops, tree height, divide & conquer depth, digit count" },
      ],
    },
    {
      id: "summations",
      label: "Summations & Series",
      children: [
        { id: "summations-triangular", label: "Arithmetic/triangular sum: 1+2+...+n = n(n+1)/2, via Gauss pairing" },
        { id: "summations-geometric-double", label: "Doubling geometric sum: 1+2+4+...+2^(k-1) = 2^k - 1 — dominated by the last term" },
        { id: "summations-geometric-halve", label: "Halving geometric sum: n+n/2+n/4+... ≈ 2n" },
        { id: "summations-shape", label: "Shape recognition: constant difference → quadratic; constant ratio → dominated by the largest term" },
      ],
    },
    {
      id: "modular",
      label: "Modular Arithmetic",
      children: [
        { id: "modular-clock", label: "a mod m as a clock with m positions — infinite line collapsed onto m values" },
        { id: "modular-survives", label: "Addition/multiplication survive the collapse — reduce at every step, answer unchanged" },
        { id: "modular-negative-trap", label: "Python % takes the divisor's sign; JS % takes the dividend's sign — the ((a%m)+m)%m fix" },
        { id: "modular-wraparound", label: "Ring-buffer indexing, array rotation: (i+k) mod n" },
        { id: "modular-hashing-preview", label: "key mod table_size; JS integer-exactness limit past 2^53" },
      ],
    },
    {
      id: "divisibility",
      label: "Divisibility, Primes & GCD",
      children: [
        {
          id: "divisibility-primality",
          label: "Primality checking — O(√n)",
          children: [
            { id: "divisibility-primality-pairs", label: "Divisors pair up around √n — a proof, not a guess" },
            { id: "divisibility-primality-caveat", label: "√n is the square root of the value, not the input size — exponential in digit count" },
          ],
        },
        {
          id: "divisibility-sieve",
          label: "Sieve of Eratosthenes — O(n log log n)",
          children: [
            { id: "divisibility-sieve-markcomposite", label: "Mark composites starting at p², not 2p — smaller factors already struck those" },
            { id: "divisibility-sieve-when", label: "Reach for it when n ≤ 10^7 and you need many primality answers" },
          ],
        },
        {
          id: "divisibility-gcd",
          label: "GCD — Euclid's algorithm, O(log min(a,b))",
          children: [
            { id: "divisibility-gcd-identity", label: "gcd(a,b) = gcd(b, a mod b) — common-divisor sets are identical" },
            { id: "divisibility-gcd-halving", label: "The smaller number at least halves every two steps" },
            { id: "divisibility-gcd-lcm", label: "lcm(a,b) = a/gcd(a,b)*b — divide before multiplying, to avoid overflow" },
          ],
        },
      ],
    },
    {
      id: "counting",
      label: "Counting & Combinatorics",
      children: [
        { id: "counting-product-rule", label: "Independent choices multiply — k slots, m options each, m^k" },
        { id: "counting-subsets", label: "Subsets: 2^n — each element an independent in/out choice" },
        { id: "counting-permutations", label: "Permutations: n! (order matters); P(n,k) = n!/(n-k)!" },
        { id: "counting-combinations", label: "Combinations: C(n,k) = n!/(k!(n-k)!) — divide out the overcount" },
        { id: "counting-incremental", label: "Compute C(n,k) via incremental multiply-divide, never raw factorials (overflow)" },
        { id: "counting-pascal", label: "Pascal's identity: C(n,k)=C(n-1,k-1)+C(n-1,k) — DP's core move a stage early" },
        { id: "counting-reading", label: "Reading answer-space size off constraints: 2^n / n! / C(n,2) / C(n,k)" },
      ],
    },
    {
      id: "drills",
      label: "Math Drills",
      children: [
        { id: "drills-synthesis", label: "Six drills combining log estimation, mod traps, overflow, counting, gcd, sieve-vs-test" },
        { id: "drills-carryforward", label: "Three tools carry forward: log2 intuition, mod-as-clock, counting spaces" },
      ],
    },
  ],
};
