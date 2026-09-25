def address(base, i, size=4):
    # sample i sits i whole samples past the start: one multiply, no search
    return base + i * size
