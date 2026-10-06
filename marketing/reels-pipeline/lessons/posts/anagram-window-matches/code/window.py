def check_inclusion_brute(s1, s2):
    k = len(s1)
    target = sorted(s1)
    for i in range(len(s2) - k + 1):
        window = [s2[j] for j in range(i, i + k)]
        if sorted(window) == target:
            return True
    return False

def check_inclusion(s1: str, s2: str) -> bool:
    k = len(s1)
    if k > len(s2):
        return False
    a = ord("a")

    need = [0] * 26
    window = [0] * 26
    for ch in s1:
        need[ord(ch) - a] += 1

    matches = sum(1 for count in need if count == 0)

    def bump(idx: int, delta: int) -> None:
        nonlocal matches
        if window[idx] == need[idx]:
            matches -= 1
        window[idx] += delta
        if window[idx] == need[idx]:
            matches += 1

    for i in range(k):
        bump(ord(s2[i]) - a, 1)

    if matches == 26:
        return True

    for right in range(k, len(s2)):
        left = right - k
        bump(ord(s2[left]) - a, -1)
        bump(ord(s2[right]) - a, 1)
        if matches == 26:
            return True

    return False
