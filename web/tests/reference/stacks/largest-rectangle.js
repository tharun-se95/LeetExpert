function largestRectangleArea(heights) {
  const stack = []; let best = 0;
  const hs = [...heights, 0];
  for (let i = 0; i < hs.length; i++) {
    while (stack.length && hs[stack[stack.length - 1]] >= hs[i]) {
      const height = hs[stack.pop()];
      const left = stack.length ? stack[stack.length - 1] + 1 : 0;
      best = Math.max(best, height * (i - left));
    }
    stack.push(i);
  }
  return best;
}
