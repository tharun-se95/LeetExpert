/**
 * Polar-to-cartesian for diagram geometry. Math.cos/Math.sin are only
 * specified to be approximately correct, so Node (server render) and the
 * browser can differ in the last float digit; unrounded, that digit lands in
 * SVG/style attributes and React reports a hydration mismatch. Rounding to
 * 0.01 units (far below a pixel) makes the markup engine-independent.
 */
export function roundCoord(value: number): number {
  return Math.round(value * 100) / 100;
}

export function polarPoint(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
): { x: number; y: number } {
  return {
    x: roundCoord(cx + radius * Math.cos(angle)),
    y: roundCoord(cy + radius * Math.sin(angle)),
  };
}
