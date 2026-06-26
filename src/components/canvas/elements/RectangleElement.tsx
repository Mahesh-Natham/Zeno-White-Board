import { Rect } from 'react-konva';

export default function RectangleElement({ element }) {
  return (
    <Rect
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
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
