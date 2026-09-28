function spiral(m: number[][]): number[] {
  const out: number[] = [];
  let top = 0, bot = m.length - 1, left = 0, right = m[0].length - 1;
  while (top <= bot && left <= right) {    // the untouched part is always this rectangle
    for (let j = left; j <= right; j++) out.push(m[top][j]);
    for (let i = top + 1; i <= bot; i++) out.push(m[i][right]);
    if (top < bot) for (let j = right - 1; j >= left; j--) out.push(m[bot][j]);   // a bottom row distinct from the top one
    if (left < right) for (let i = bot - 1; i > top; i--) out.push(m[i][left]);   // a left column distinct from the right one
    top++; bot--; left++; right--;
  }
  return out;
}
