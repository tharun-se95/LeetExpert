def prev_index(i: int, n: int) -> int:
    return (i - 1) % n


def safe_product(nums: list[int], mod: int) -> int:
    acc = 1
    for x in nums:
        acc = (acc * (x % mod)) % mod
    return acc


def tree_height(n: int) -> int:
    if n <= 1:
        return 1
    return n.bit_length()


def euclid_gcd(a: int, b: int) -> int:
    while b:
        a, b = b, a % b
    return a
