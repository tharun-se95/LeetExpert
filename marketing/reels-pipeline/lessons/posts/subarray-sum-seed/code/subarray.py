def brute_count(nums, k):
    count = 0
    for l in range(len(nums)):
        total = 0
        for r in range(l, len(nums)):
            total += nums[r]
            if total == k:
                count += 1
    return count

def subarray_count(nums: list[int], k: int) -> int:
    seen: dict[int, int] = {0: 1}
    running = 0
    count = 0
    for x in nums:
        running += x
        count += seen.get(running - k, 0)
        seen[running] = seen.get(running, 0) + 1
    return count
