function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const unlocks: number[][] = Array.from({ length: numCourses }, () => []);
  const waiting: number[] = new Array<number>(numCourses).fill(0);
  for (const [course, prereq] of prerequisites) {
    unlocks[prereq].push(course);
    waiting[course]++;
  }

  const ready: number[] = [];
  for (let c = 0; c < numCourses; c++) {
    if (waiting[c] === 0) ready.push(c);
  }

  for (let head = 0; head < ready.length; head++) {
    for (const next of unlocks[ready[head]]) {
      waiting[next]--;
      if (waiting[next] === 0) ready.push(next);
    }
  }

  return true; // the mistake: the queue emptying proves nothing
}
