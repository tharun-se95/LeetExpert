function linearSearch(arr: number[], target: number): [number, number] {
  let comparisons = 0;
  for (let i = 0; i < arr.length; i++) {
    comparisons++;
    if (arr[i] === target) {
      return [i, comparisons];
    }
  }
  return [-1, comparisons];
}
