def is_valid_order(order, deps):
    for i in range(len(order) - 1):
        if order[i + 1] in deps.get(order[i], []):   # only the next module is compared
            return False
    return True
