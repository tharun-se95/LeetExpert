def length_of_longest_substring(s):
    window = set()
    left = 0
    best = 0
    for right in range(len(s)):
        best = max(best, right - left + 1)   # the mistake: counted BEFORE the duplicate is removed
        while s[right] in window:
            window.remove(s[left])
            left += 1
        window.add(s[right])
    return best
