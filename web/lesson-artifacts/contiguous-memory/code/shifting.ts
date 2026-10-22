function insertAt<T>(slots: (T | null)[], length: number, i: number, value: T): number {
  let moved = 0;
  for (let j = length; j > i; j--) { // right to left, or a move would overwrite the next
    slots[j] = slots[j - 1];
    moved++;
  }
  slots[i] = value;
  return moved;
}

function newestFirst<T>(items: T[]): [(T | null)[], number] {
  const slots: (T | null)[] = new Array(items.length).fill(null);
  let length = 0, moved = 0;
  for (const x of items) {
    moved += insertAt(slots, length, length, x); // at the end nobody has to move
    length++;
  }
  for (let lo = 0, hi = length - 1; lo < hi; lo++, hi--) {
    [slots[lo], slots[hi]] = [slots[hi], slots[lo]]; // a swap moves two elements
    moved += 2;
  }
  return [slots, moved];
}
