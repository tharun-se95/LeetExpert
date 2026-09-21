function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const order: number[] = [];
  const used: boolean[] = new Array<boolean>(numCourses).fill(false);

  function tryOrders(): boolean {
    if (order.length === numCourses) {
      const position = new Map<number, number>();
      order.forEach((course, i) => position.set(course, i));
      // every prerequisite comes first
      return prerequisites.every(([course, prereq]) => position.get(prereq)! < position.get(course)!);
    }
    for (let c = 0; c < numCourses; c++) {
      if (used[c]) continue;
      used[c] = true;
      order.push(c);
      if (tryOrders()) return true;
      order.pop();
      used[c] = false;
    }
    return false;
  }

  return tryOrders(); // try every possible build order
}
