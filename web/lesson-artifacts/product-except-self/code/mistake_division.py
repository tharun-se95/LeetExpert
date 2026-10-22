def product_except_self(nums):
    total = 1
    for x in nums:
        total *= x                        # the whole product, once
    return [total // x for x in nums]     # then divide each element back out
