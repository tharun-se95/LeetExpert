function bruteSpeed(piles, h) {
  let speed = 1;
  while (piles.reduce((total, pile) => total + Math.ceil(pile / speed), 0) > h) {
    speed++;
  }
  return speed;
}

function minEatingSpeed(piles, h) {
  function hoursNeeded(speed) {
    return piles.reduce((total, pile) => total + Math.ceil(pile / speed), 0);
  }

  let lo = 1;
  let hi = Math.max(...piles);
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (hoursNeeded(mid) <= h) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
}

module.exports = { bruteSpeed, minEatingSpeed };
