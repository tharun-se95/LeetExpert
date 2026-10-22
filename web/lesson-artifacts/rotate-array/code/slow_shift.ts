function rotate(nums: number[], k: number): void {
  for (let step = 0; step < k; step++) { // k single steps...
    nums.unshift(nums.pop() as number);  // ...each moves all n elements
  }
}
