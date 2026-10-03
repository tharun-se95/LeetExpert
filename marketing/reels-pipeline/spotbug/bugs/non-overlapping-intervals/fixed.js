function eraseOverlapIntervals(intervals) {
  intervals.sort((a, b) => a[1] - b[1]);
  let removed = 0, end = -Infinity;
  for (const [start, finish] of intervals) {
    if (start >= end) end = finish;
    else removed++;
  }
  return removed;
}
