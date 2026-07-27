def sort_array(nums):
    if len(nums) <= 1:
        return nums
    mid = len(nums) // 2
    left = sort_array(nums[:mid])
    right = sort_array(nums[mid:])

    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
