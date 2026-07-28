function findCircleNum(isConnected) {
  const n = isConnected.length;
  const seen = new Array(n).fill(false);
  let count = 0;
  for (let start = 0; start < n; start++) {
    if (seen[start]) continue;
    count += 1;
    const stack = [start];
    seen[start] = true;
    while (stack.length > 0) {
      const node = stack.pop();
      for (let j = 0; j < n; j++) {
        if (isConnected[node][j] === 1 && !seen[j]) {
          seen[j] = true;
          stack.push(j);
        }
      }
    }
  }
  return count;
}
