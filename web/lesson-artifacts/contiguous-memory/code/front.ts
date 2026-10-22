function newestFirstFront<T>(items: T[]): [(T | null)[], number] {
  const slots: (T | null)[] = new Array(items.length).fill(null);
  let length = 0, moved = 0;
  for (const x of items) {
    moved += insertAt(slots, length, 0, x); // one short line, but every element moves
    length++;
  }
  return [slots, moved];
}
