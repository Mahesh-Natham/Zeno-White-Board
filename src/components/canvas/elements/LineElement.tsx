import { Line } from 'react-konva';

export default function LineElement({ element }) {
  return (
    <Line
      id={element.id}
      x={element.x}
      y={element.y}
      points={element.points}
      stroke={element.stroke}
      strokeWidth={element.strokeWidth}
      dash={element.dash}
      opacity={element.opacity}
      rotation={element.rotation}
      scaleX={element.scaleX}
      scaleY={element.scaleY}
      hitStrokeWidth={Math.max(10, element.strokeWidth)} // Easier to click
      name="board-element"
    />
  );
}
