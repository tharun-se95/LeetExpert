function largestNumber(nums) {
  const strs = nums.map((n) => String(n));

  strs.sort((a, b) => {
    if (a + b > b + a) return -1;
    if (a + b < b + a) return 1;
    return 0;
  });

  const result = strs.join("");
  return result[0] === "0" ? "0" : result;
}
