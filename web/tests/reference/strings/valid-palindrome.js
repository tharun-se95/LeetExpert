function isPalindrome(s) {
  let l = 0, r = s.length - 1;
  const ok = (c) => /[a-z0-9]/i.test(c);
  while (l < r) {
    while (l < r && !ok(s[l])) l++;
    while (l < r && !ok(s[r])) r--;
    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
    l++; r--;
  }
  return true;
}
