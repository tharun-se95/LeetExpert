def min_window(s, t):
    if not t or not s:
        return ""

    need = {}
    for ch in t:
        need[ch] = need.get(ch, 0) + 1
    required = len(need)

    have = {}
    satisfied = 0

    best_len = float("inf")
    best_left = 0
    left = 0

    for right, ch in enumerate(s):
        have[ch] = have.get(ch, 0) + 1
        if ch in need and have[ch] == need[ch]:
            satisfied += 1

        while satisfied == required:
            if right - left + 1 < best_len:
                best_len = right - left + 1
                best_left = left

            left_ch = s[left]
            have[left_ch] -= 1
            if left_ch in need and have[left_ch] < need[left_ch]:
                satisfied -= 1
            left += 1

    return "" if best_len == float("inf") else s[best_left : best_left + best_len]
