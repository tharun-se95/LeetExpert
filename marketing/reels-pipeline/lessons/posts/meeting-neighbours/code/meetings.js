function canAttendBrute(intervals) {
  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      const a = intervals[i], b = intervals[j];
      if (Math.max(a[0], b[0]) < Math.min(a[1], b[1])) return false;
    }
  }
  return true;
}

function canAttendMeetings(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] < intervals[i - 1][1]) {
      return false;
    }
  }
  return true;
}

module.exports = { canAttendBrute, canAttendMeetings };
