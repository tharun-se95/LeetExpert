function strStr(haystack, needle) {
  if (needle === "") return 0;
  const n = haystack.length, m = needle.length;
  for (let i = 0; i + m <= n; i++) if (haystack.slice(i, i + m) === needle) return i;
  return -1;
}
