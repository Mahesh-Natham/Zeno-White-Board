import { Arrow } from 'react-konva';

export default function ArrowElement({ element }) {
  return (
    <Arrow
      id={element.id}
      x={element.x}
      y={element.y}
      points={element.points}
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
      tension={0.5} // Smooths the arrow body if it has multiple points
      lineCap="round"
      lineJoin="round"
      name="board-element"
    />
  );
}
