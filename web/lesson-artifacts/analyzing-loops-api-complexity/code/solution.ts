function countIterations(shape: string, n: number): number {
  let count = 0;
  if (shape === "doubling") {
    let i = 1;
    while (i < n) {
      count++;
      i *= 2;
    }
  } else if (shape === "sequential") {
    for (let i = 0; i < n; i++) count++;
    for (let j = 0; j < n; j++) count++;
  } else if (shape === "dependent") {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < i; j++) {
        count++;
      }
    }
  }
  return count;
}

function dedupeSet<T>(items: T[]): [T[], number] {
  const seen = new Set<T>();
  const result: T[] = [];
  let comparisons = 0;
  for (const x of items) {
    comparisons++;
    if (!seen.has(x)) {
      seen.add(x);
      result.push(x);
    }
  }
  return [result, comparisons];
}
