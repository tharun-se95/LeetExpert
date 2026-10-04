def can_attend_brute(intervals):
    for i in range(len(intervals)):
        for j in range(i + 1, len(intervals)):
            a, b = intervals[i], intervals[j]
            if max(a[0], b[0]) < min(a[1], b[1]):
                return False
    return True

def can_attend_meetings(intervals: list[list[int]]) -> bool:
    intervals.sort(key=lambda iv: iv[0])
    for i in range(1, len(intervals)):
        if intervals[i][0] < intervals[i - 1][1]:
            return False
    return True
