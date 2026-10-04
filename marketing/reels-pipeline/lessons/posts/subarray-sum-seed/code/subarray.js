function bruteCount(nums, k) {
  let count = 0;
  for (let l = 0; l < nums.length; l++) {
    let total = 0;
    for (let r = l; r < nums.length; r++) {
      total += nums[r];
      if (total === k) count++;
    }
  }
  return count;
}

function subarrayCount(nums, k) {
  const seen = new Map([[0, 1]]);
  let running = 0;
  let count = 0;
  for (const x of nums) {
    running += x;
    count += seen.get(running - k) ?? 0;
    seen.set(running, (seen.get(running) ?? 0) + 1);
  }
  return count;
}

module.exports = { bruteCount, subarrayCount };
