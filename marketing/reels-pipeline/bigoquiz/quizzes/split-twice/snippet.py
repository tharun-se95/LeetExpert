def split_twice(n: int) -> int:
    if n <= 1:
        return 1
    return split_twice(n // 2) + split_twice(n // 2)
