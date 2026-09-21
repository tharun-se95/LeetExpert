from collections import deque


def can_finish(num_courses, prerequisites):
    unlocks = [[] for _ in range(num_courses)]   # unlocks[p] = courses that wait on p
    waiting = [0] * num_courses                  # waiting[c] = prerequisites of c not built yet
    for course, prereq in prerequisites:
        unlocks[prereq].append(course)
        waiting[course] += 1

    ready = deque(c for c in range(num_courses) if waiting[c] == 0)
    built = 0
    while ready:
        course = ready.popleft()
        built += 1                               # nothing it needs is missing: build it
        for nxt in unlocks[course]:
            waiting[nxt] -= 1                    # one fewer prerequisite outstanding
            if waiting[nxt] == 0:
                ready.append(nxt)

    return built == num_courses                  # a course in a cycle never becomes ready
