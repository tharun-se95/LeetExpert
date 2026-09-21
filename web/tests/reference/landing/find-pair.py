def find_pair(nums, target):
    seen = set()
    for n in nums:
        if target - n in seen:
            return (target - n, n)
        seen.add(n)
    return None
