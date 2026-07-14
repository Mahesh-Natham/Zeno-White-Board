import { Arrow } from 'react-konva';
import { getStandardArrowPoints } from '../../../utils/arrowUtils';

export default function ArrowElement({ element }) {
  const pts = element.points || [0, 0, 0, 0];
  
  let arrowPoints = pts;
  const isConnector = !!(element.startElementId || element.endElementId);
  const isSCurve = isConnector && (pts.length === 8 || pts.length <= 4);
  
  // If it's a simple 2-point line, apply the standard arrow logic (which will give it an S-curve if it's a connector)
  if (pts.length <= 4) {
    const x1 = pts[0] || 0;
    const y1 = pts[1] || 0;
    const x2 = pts[2] ?? x1;
    const y2 = pts[3] ?? y1;
    arrowPoints = getStandardArrowPoints(x1, y1, x2, y2, isConnector);
  }

  return (
    <Arrow
      id={element.id}
      x={element.x}
      y={element.y}
      points={arrowPoints}
      stroke={element.stroke}
      strokeWidth={element.strokeWidth}
      dash={element.dash}
      fill={element.stroke} // Arrow head fill should match stroke
      opacity={element.opacity}
      rotation={element.rotation}
      scaleX={element.scaleX}
      scaleY={element.scaleY}
      hitStrokeWidth={Math.max(10, element.strokeWidth)}
      pointerLength={Math.max(10, element.strokeWidth * 3 + 5)}
      pointerWidth={Math.max(10, element.strokeWidth * 3 + 5)}
      bezier={isSCurve}
      tension={0.5} // Smooths the arrow body if it has multiple points (and isn't a bezier)
      lineCap="round"
      lineJoin="round"
      name="board-element"
    />
  );
}
