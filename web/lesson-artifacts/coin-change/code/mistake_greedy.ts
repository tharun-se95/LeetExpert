function coinChange(coins: number[], amount: number): number {
  let count = 0;
  for (const c of [...coins].sort((x, y) => y - x)) {
    // always take the biggest coin that fits
    count += Math.floor(amount / c);
    amount %= c;
  }
  return amount === 0 ? count : -1;
}
