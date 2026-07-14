/**
 * Utility functions for calculating paths and transforms for different arrow styles.
 */

/**
 * Calculates standard arrow points. For connectors, it generates intermediate 
 * points that produce an S-curve when rendered with tension.
 * For regular straight arrows, it can just return the two points.
 */
export function getStandardArrowPoints(x1: number, y1: number, x2: number, y2: number, isConnector: boolean = true): number[] {
  if (!isConnector) {
    return [x1, y1, x2, y2];
  }

  const dx = x2 - x1;
  const dy = y2 - y1;
  const isHorizontal = Math.abs(dx) > Math.abs(dy);

  if (isHorizontal) {
    const cp1X = x1 + Math.max(15, Math.abs(dx) * 0.15);
    const cp1Y = y1;
    const cp2X = x2 - Math.max(15, Math.abs(dx) * 0.15);
    const cp2Y = y2;
    return [x1, y1, cp1X, cp1Y, cp2X, cp2Y, x2, y2];
  } else {
    const cp1X = x1;
    const cp1Y = y1 + Math.max(15, Math.abs(dy) * 0.15);
    const cp2X = x2;
    const cp2Y = y2 - Math.max(15, Math.abs(dy) * 0.15);
    return [x1, y1, cp1X, cp1Y, cp2X, cp2Y, x2, y2];
  }
}

/**
 * Calculates orthogonal points for a 90-degree elbow arrow.
 */
export function getElbowArrowPoints(x1: number, y1: number, x2: number, y2: number): number[] {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const isHorizontal = Math.abs(dx) > Math.abs(dy);

  if (isHorizontal) {
    return [x1, y1, (x1 + x2) / 2, y1, (x1 + x2) / 2, y2, x2, y2];
  } else {
    return [x1, y1, x1, (y1 + y2) / 2, x2, (y1 + y2) / 2, x2, y2];
  }
}

/**
 * Calculates the required rotation and width (length) to point a block arrow from start to end.
 */
export function getBlockArrowTransform(x1: number, y1: number, x2: number, y2: number): { rotation: number, length: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const rotation = (Math.atan2(dy, dx) * 180) / Math.PI;

  return { rotation, length };
}
