def erase_overlap_intervals(intervals):
    intervals.sort(key=lambda iv: iv[1])
    removals = 0
    last_end = float("-inf")
    for start, end in intervals:
        if start >= last_end:
            last_end = end
        else:
            removals += 1
    return removals
