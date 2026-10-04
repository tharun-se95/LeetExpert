function checkInclusionBrute(s1, s2) {
  const k = s1.length;
  const target = [...s1].sort().join("");
  for (let i = 0; i + k <= s2.length; i++) {
    const window = [];
    for (let j = i; j < i + k; j++) window.push(s2[j]);
    if (window.sort().join("") === target) return true;
  }
  return false;
}

function checkInclusion(s1, s2) {
  const k = s1.length;
  if (k > s2.length) return false;
  const a = "a".charCodeAt(0);

  const need = new Array(26).fill(0);
  const window = new Array(26).fill(0);
  for (const ch of s1) need[ch.charCodeAt(0) - a]++;

  let matches = need.filter((count) => count === 0).length;

  function bump(idx, delta) {
    if (window[idx] === need[idx]) matches--;
    window[idx] += delta;
    if (window[idx] === need[idx]) matches++;
  }

  for (let i = 0; i < k; i++) bump(s2[i].charCodeAt(0) - a, 1);
  if (matches === 26) return true;

  for (let right = k; right < s2.length; right++) {
    const left = right - k;
    bump(s2[left].charCodeAt(0) - a, -1);
    bump(s2[right].charCodeAt(0) - a, 1);
    if (matches === 26) return true;
  }

  return false;
}

module.exports = { checkInclusionBrute, checkInclusion };
