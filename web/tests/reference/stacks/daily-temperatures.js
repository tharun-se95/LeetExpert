function dailyTemperatures(temperatures) {
  const out = new Array(temperatures.length).fill(0), stack = [];
  for (let i = 0; i < temperatures.length; i++) {
    while (stack.length && temperatures[stack[stack.length - 1]] < temperatures[i]) {
      const j = stack.pop(); out[j] = i - j;
    }
    stack.push(i);
  }
  return out;
}
