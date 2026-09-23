function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const unlocks: number[][] = Array.from({ length: numCourses }, () => []); // unlocks[p] = courses that wait on p
  const waiting: number[] = new Array<number>(numCourses).fill(0); // prerequisites of c not built yet
  for (const [course, prereq] of prerequisites) {
    unlocks[prereq].push(course);
    waiting[course]++;
  }

  const ready: number[] = [];
  for (let c = 0; c < numCourses; c++) {
    if (waiting[c] === 0) ready.push(c);
  }

  let built = 0;
  for (let head = 0; head < ready.length; head++) {
    const course = ready[head];
    built++; // nothing it needs is missing: build it
    for (const next of unlocks[course]) {
      waiting[next]--; // one fewer prerequisite outstanding
      if (waiting[next] === 0) ready.push(next);
    }
  }

  return built === numCourses; // a course in a cycle never becomes ready
}
