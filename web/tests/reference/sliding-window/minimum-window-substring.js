function minWindow(s, t) {
  if (!t || !s) return "";

  const need = new Map();
  for (const ch of t) need.set(ch, (need.get(ch) ?? 0) + 1);
  const required = need.size;

  const have = new Map();
  let satisfied = 0;

  let bestLen = Infinity;
  let bestLeft = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    have.set(ch, (have.get(ch) ?? 0) + 1);
    if (need.has(ch) && have.get(ch) === need.get(ch)) satisfied++;

    while (satisfied === required) {
      if (right - left + 1 < bestLen) {
        bestLen = right - left + 1;
        bestLeft = left;
      }

      const leftCh = s[left];
      have.set(leftCh, have.get(leftCh) - 1);
      if (need.has(leftCh) && have.get(leftCh) < need.get(leftCh)) satisfied--;
      left++;
    }
  }

  return bestLen === Infinity ? "" : s.slice(bestLeft, bestLeft + bestLen);
}
