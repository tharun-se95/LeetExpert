function dedupeList<T>(items: T[]): [T[], number] {
  const result: T[] = [];
  let comparisons = 0;
  for (const x of items) {
    // Hidden linear search: 'x in result' checks existing elements
    let found = false;
    for (let i = 0; i < result.length; i++) {
      comparisons++;
      if (result[i] === x) {
        found = true;
        break;
      }
    }
    if (!found) {
      result.push(x);
    }
  }
  return [result, comparisons];
}
