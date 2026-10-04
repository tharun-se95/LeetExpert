def collision_chance(slots, inserts):
    clear = 1.0
    for i in range(inserts):
        clear *= (slots - i) / slots
    return 1 - clear
