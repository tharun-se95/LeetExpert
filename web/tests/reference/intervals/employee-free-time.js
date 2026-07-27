function employeeFreeTime(schedule) {
  const allIntervals = schedule.flat();
  allIntervals.sort((a, b) => a[0] - b[0]);

  const merged = [];
  for (const [start, end] of allIntervals) {
    if (merged.length && start <= merged[merged.length - 1][1]) {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], end);
    } else {
      merged.push([start, end]);
    }
  }

  const freeTime = [];
  for (let i = 1; i < merged.length; i++) {
    const prevEnd = merged[i - 1][1];
    const currStart = merged[i][0];
    if (prevEnd < currStart) freeTime.push([prevEnd, currStart]);
  }

  return freeTime;
}
