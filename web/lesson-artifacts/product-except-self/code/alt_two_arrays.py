def product_except_self(nums):
    n = len(nums)
    left = [1] * n                        # left[i]: the product of everything before i
    for i in range(1, n):
        left[i] = left[i - 1] * nums[i - 1]
    right = [1] * n                       # right[i]: the product of everything after i
    for i in range(n - 2, -1, -1):
        right[i] = right[i + 1] * nums[i + 1]
    return [left[i] * right[i] for i in range(n)]
