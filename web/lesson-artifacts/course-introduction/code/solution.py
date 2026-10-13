def first_repeat(items):
    seen = set()
    for item in items:
        if item in seen:          # ask first: only earlier items are in there
            return item
        seen.add(item)            # then remember this one
    return None
