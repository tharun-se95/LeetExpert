def is_valid_order(order, deps):
    place = {}
    for i, name in enumerate(order):
        if name in place:                 # listed twice: it has no single place
            return False
        place[name] = i
    for name, needs in deps.items():
        if name not in place:             # a module the table names must be taught
            return False
        for dep in needs:
            if dep not in place or place[dep] >= place[name]:
                return False              # missing, or not strictly earlier
    return True
