def employee_free_time(schedule):
    all_intervals = [iv for employee in schedule for iv in employee]
    all_intervals.sort(key=lambda iv: iv[0])

    merged = []
    for start, end in all_intervals:
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])

    free_time = []
    for i in range(1, len(merged)):
        prev_end = merged[i - 1][1]
        curr_start = merged[i][0]
        if prev_end < curr_start:
            free_time.append([prev_end, curr_start])

    return free_time
