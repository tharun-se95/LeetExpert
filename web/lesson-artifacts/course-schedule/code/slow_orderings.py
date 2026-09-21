from itertools import permutations


def can_finish(num_courses, prerequisites):
    for order in permutations(range(num_courses)):        # try every possible build order
        position = {course: i for i, course in enumerate(order)}
        if all(position[prereq] < position[course] for course, prereq in prerequisites):
            return True                                   # every prerequisite comes first
    return False
