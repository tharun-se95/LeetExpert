// Drains the frontier as a STACK where the Python reference uses a queue, so
// the two produce different valid orders on the same input — the reason this
// lesson is graded by a property.
function findOrder(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    adj[b].push(a);
    indeg[a] += 1;
  }
  const stack = [];
  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) stack.push(i);
  const order = [];
  while (stack.length) {
    const node = stack.pop();
    order.push(node);
    for (const next of adj[node]) if (--indeg[next] === 0) stack.push(next);
  }
  return order.length === numCourses ? order : [];
}
