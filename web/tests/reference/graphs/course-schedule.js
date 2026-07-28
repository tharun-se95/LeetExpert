function canFinish(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    adj[b].push(a);
    indeg[a] += 1;
  }
  const queue = [];
  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) queue.push(i);
  let seen = 0;
  while (queue.length > 0) {
    const node = queue.pop();
    seen += 1;
    for (const next of adj[node]) {
      indeg[next] -= 1;
      if (indeg[next] === 0) queue.push(next);
    }
  }
  return seen === numCourses;
}
