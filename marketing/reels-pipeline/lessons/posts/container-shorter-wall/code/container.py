def brute_area(height):
    best = 0
    for i in range(len(height)):
        for j in range(i + 1, len(height)):
            area = (j - i) * min(height[i], height[j])
            best = max(best, area)
    return best

def max_area(height: list[int]) -> int:
    left, right = 0, len(height) - 1
    best = 0
    while left < right:
        width = right - left
        if height[left] <= height[right]:
            best = max(best, width * height[left])
            left += 1
        else:
            best = max(best, width * height[right])
            right -= 1
    return best
