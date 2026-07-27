function insert(intervals, newInterval) {
  const result = [];
  let [ns, ne] = newInterval;
  const n = intervals.length;
  let i = 0;

  while (i < n && intervals[i][1] < ns) result.push(intervals[i++]);

  while (i < n && intervals[i][0] <= ne) {
    ns = Math.min(ns, intervals[i][0]);
    ne = Math.max(ne, intervals[i][1]);
    i++;
  }
  result.push([ns, ne]);

  while (i < n) result.push(intervals[i++]);

  return result;
}
