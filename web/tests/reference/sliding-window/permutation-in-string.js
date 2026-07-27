function checkInclusion(s1, s2) {
  const k = s1.length;
  if (k > s2.length) return false;
  const a = "a".charCodeAt(0);

  const need = new Array(26).fill(0);
  const window = new Array(26).fill(0);
  for (const ch of s1) need[ch.charCodeAt(0) - a]++;

  let matches = need.filter((count) => count === 0).length;

  const bump = (idx, delta) => {
    if (window[idx] === need[idx]) matches--;
    window[idx] += delta;
    if (window[idx] === need[idx]) matches++;
  };

  for (let i = 0; i < k; i++) bump(s2.charCodeAt(i) - a, 1);
  if (matches === 26) return true;

  for (let right = k; right < s2.length; right++) {
    bump(s2.charCodeAt(right - k) - a, -1);
    bump(s2.charCodeAt(right) - a, 1);
    if (matches === 26) return true;
  }

  return false;
}
