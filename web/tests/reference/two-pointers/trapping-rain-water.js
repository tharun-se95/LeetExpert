function trap(height) {
  if (!height.length) return 0;
  let l = 0, r = height.length - 1, lm = height[0], rm = height[height.length - 1], total = 0;
  while (l < r) {
    if (lm <= rm) { l++; lm = Math.max(lm, height[l]); total += lm - height[l]; }
    else { r--; rm = Math.max(rm, height[r]); total += rm - height[r]; }
  }
  return total;
}
