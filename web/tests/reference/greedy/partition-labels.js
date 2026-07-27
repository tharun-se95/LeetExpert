function partitionLabels(s) {
  const lastOccurrence = new Map();
  for (let i = 0; i < s.length; i++) lastOccurrence.set(s[i], i);

  const result = [];
  let start = 0;
  let end = 0;
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, lastOccurrence.get(s[i]));
    if (i === end) {
      result.push(end - start + 1);
      start = i + 1;
    }
  }
  return result;
}
