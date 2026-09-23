from collections import deque


def can_finish(num_courses, prerequisites):
    unlocks = [[] for _ in range(num_courses)]
    waiting = [0] * num_courses
    for course, prereq in prerequisites:
        unlocks[prereq].append(course)
        waiting[course] += 1

    ready = deque(c for c in range(num_courses) if waiting[c] == 0)
    while ready:
        course = ready.popleft()
        for nxt in unlocks[course]:
            waiting[nxt] -= 1
            if waiting[nxt] == 0:
                ready.append(nxt)

    return True                                  # the mistake: the queue emptying proves nothing
