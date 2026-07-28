function kClosest(points, k) {
  const d = (p) => p[0] * p[0] + p[1] * p[1];
  return [...points].sort((a, b) => d(a) - d(b)).slice(0, k);
}
