function networkDelayTime(times, n, k) {
  const adj = new Map();
  for (const [u, v, w] of times) {
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u).push([v, w]);
  }
  const dist = new Map();
  // Small graphs here: a linear scan for the nearest unsettled node is
  // Dijkstra's selection step without the heap's bookkeeping.
  const pq = [[0, k]];
  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, node] = pq.shift();
    if (dist.has(node)) continue;
    dist.set(node, d);
    for (const [v, w] of adj.get(node) || []) {
      if (!dist.has(v)) pq.push([d + w, v]);
    }
  }
  if (dist.size < n) return -1;
  return Math.max(...dist.values());
}
