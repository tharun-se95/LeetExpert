def erase_overlap_intervals(intervals):
    intervals.sort(key=lambda iv: iv[0])
    removed, end = 0, float("-inf")
    for start, finish in intervals:
        if start >= end:
            end = finish
        else:
            removed += 1
    return removed
