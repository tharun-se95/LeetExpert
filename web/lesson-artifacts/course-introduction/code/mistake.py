def first_repeat_swapped(items):
    seen = set()
    for item in items:
        seen.add(item)            # remembered first...
        if item in seen:          # ...so this is always true
            return item
    return None
