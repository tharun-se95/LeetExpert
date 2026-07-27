function findMinArrowShots(points) {
  points.sort((a, b) => a[1] - b[1]);
  let arrows = 1;
  let arrowX = points[0][1];
  for (const [start, end] of points.slice(1)) {
    if (start > arrowX) {
      arrows++;
      arrowX = end;
    }
  }
  return arrows;
}
