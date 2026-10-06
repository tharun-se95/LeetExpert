function bruteArea(height) {
  let best = 0;
  for (let i = 0; i < height.length; i++) {
    for (let j = i + 1; j < height.length; j++) {
      const area = (j - i) * Math.min(height[i], height[j]);
      best = Math.max(best, area);
    }
  }
  return best;
}

function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let best = 0;
  while (left < right) {
    const width = right - left;
    if (height[left] <= height[right]) {
      best = Math.max(best, width * height[left]);
      left++;
    } else {
      best = Math.max(best, width * height[right]);
      right--;
    }
  }
  return best;
}

module.exports = { bruteArea, maxArea };
