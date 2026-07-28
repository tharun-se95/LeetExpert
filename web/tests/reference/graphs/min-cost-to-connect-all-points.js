function minCostConnectPoints(points) {
  const n = points.length;
  if (n <= 1) return 0;
  const inTree = new Array(n).fill(false);
  const best = new Array(n).fill(Infinity);
  best[0] = 0;
  let total = 0;
  for (let step = 0; step < n; step++) {
    let pick = -1;
    for (let i = 0; i < n; i++) {
      if (!inTree[i] && (pick === -1 || best[i] < best[pick])) pick = i;
    }
    inTree[pick] = true;
    total += best[pick];
    for (let j = 0; j < n; j++) {
      if (!inTree[j]) {
        const d =
          Math.abs(points[pick][0] - points[j][0]) +
          Math.abs(points[pick][1] - points[j][1]);
        if (d < best[j]) best[j] = d;
      }
    }
  }
  return total;
}
