function topoSortKahn(numVertices, adj) {
  const indegree = new Array(numVertices).fill(0);
  for (let u = 0; u < numVertices; u++) {
    for (const v of adj[u]) indegree[v]++;
  }
  const queue = [];
  for (let u = 0; u < numVertices; u++) {
    if (indegree[u] === 0) queue.push(u);
  }
  const order = [];
  let head = 0;
  while (head < queue.length) {
    const u = queue[head++];
    order.push(u);
    for (const v of adj[u]) {
      indegree[v]--;
      if (indegree[v] === 0) queue.push(v);
    }
  }
  return order.length === numVertices ? order : null;
}

module.exports = { topoSortKahn };
