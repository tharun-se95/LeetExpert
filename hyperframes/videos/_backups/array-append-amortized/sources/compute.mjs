// Same simulation in JavaScript; must agree with compute.py exactly.
function simulate(n, grow, start) {
  let capacity = start, length = 0, total = 0, worst = 0, worstAt = 0;
  for (let i = 1; i <= n; i++) {
    if (length === capacity) {
      total += length;
      if (length > worst) { worst = length; worstAt = i; }
      capacity = grow(capacity);
    }
    length += 1;
  }
  return { total, worst, worstAt };
}
const d = simulate(1024, (c) => c * 2, 1), a = simulate(1024, (c) => c + 4, 4);
console.log(JSON.stringify({ doubling: d, add_4: a, ratio: a.total / d.total }));
