export function drill1(nums: number[]): number {
  let total = 0;
  for (const x of nums) total += x;
  for (const x of nums) total -= Math.floor(x / 2);
  return total;
}

export function drill2(nums: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === 0) out.push(i);
    }
  }
  return out;
}

export function drill3(n: number): number {
  let count = 0;
  for (let i = n; i > 1; i = Math.floor(i / 2)) {
    for (let k = 0; k < n; k++) count++;
  }
  return count;
}

export function drill4(nums: number[], target: number): boolean {
  for (const x of nums) {
    if (nums.slice(1).includes(x)) {
      /* slice + scan */
    }
    if (x === target) return true;
  }
  return false;
}

export function drill5(n: number): number {
  if (n <= 1) return 1;
  return drill5(Math.floor(n / 2)) + drill5(Math.floor(n / 2));
}

export function drill6(matrix: number[][]): number {
  let best = matrix[0][0];
  for (const row of matrix) {
    for (const value of row) {
      if (value > best) best = value;
    }
  }
  return best;
}
