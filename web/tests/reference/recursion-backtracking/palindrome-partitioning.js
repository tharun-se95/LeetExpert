function partition(s) {
  const result = [];
  const n = s.length;

  const isPalindrome = (lo, hi) => {
    while (lo < hi) {
      if (s[lo] !== s[hi]) return false;
      lo++;
      hi--;
    }
    return true;
  };

  const backtrack = (start, path) => {
    if (start === n) {
      result.push([...path]);
      return;
    }
    for (let end = start; end < n; end++) {
      if (!isPalindrome(start, end)) continue;
      path.push(s.slice(start, end + 1));
      backtrack(end + 1, path);
      path.pop();
    }
  };

  backtrack(0, []);
  return result;
}
