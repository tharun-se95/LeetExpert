function longestCommonPrefix(strs) {
  if (!strs.length) return "";
  let prefix = strs[0];
  for (const s of strs.slice(1)) {
    while (!s.startsWith(prefix)) { prefix = prefix.slice(0, -1); if (!prefix) return ""; }
  }
  return prefix;
}
