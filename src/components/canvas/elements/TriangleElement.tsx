import { RegularPolygon } from 'react-konva';

export default function TriangleElement({ element }) {
  return (
    <RegularPolygon
      id={element.id}
      // Konva RegularPolygon uses center as x/y
      x={element.x + element.width / 2}
      y={element.y + element.height / 2}
      sides={3}
      radius={Math.max(Math.abs(element.width), Math.abs(element.height)) / 2}
      fill={element.fill}
      stroke={element.stroke}
      strokeWidth={element.strokeWidth}
      dash={element.dash}
      cornerRadius={element.cornerRadius || 0}
      opacity={element.opacity}
      rotation={element.rotation}
      scaleX={element.scaleX}
      scaleY={element.scaleY}
      name="board-element"
    />
  );
}
