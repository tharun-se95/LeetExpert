function eraseOverlapIntervals(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  let removed = 0, end = -Infinity;
  for (const [start, finish] of intervals) {
    if (start >= end) end = finish;
    else removed++;
  }
  return removed;
}
