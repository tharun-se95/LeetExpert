function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const counts = new Map();
  for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  for (const ch of t) counts.set(ch, (counts.get(ch) ?? 0) - 1);
  return [...counts.values()].every((n) => n === 0);
}
module.exports = { isAnagram };
