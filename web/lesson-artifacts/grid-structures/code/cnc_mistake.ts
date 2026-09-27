function spiral(m: number[][]): number[] {
  const out: number[] = [];
  let top = 0, bot = m.length - 1, left = 0, right = m[0].length - 1;
  while (top <= bot && left <= right) {
    for (let j = left; j <= right; j++) out.push(m[top][j]);
    for (let i = top + 1; i <= bot; i++) out.push(m[i][right]);
    for (let j = right - 1; j >= left; j--) out.push(m[bot][j]);   // even when bot is top
    for (let i = bot - 1; i > top; i--) out.push(m[i][left]);
    top++; bot--; left++; right--;
  }
  return out;
}
