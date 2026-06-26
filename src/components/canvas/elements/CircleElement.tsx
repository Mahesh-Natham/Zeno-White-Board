import { Ellipse } from 'react-konva';

export default function CircleElement({ element }) {
  return (
    <Ellipse
      id={element.id}
      // Konva Ellipse uses center as x/y — position at center of bounding box
      x={element.x + element.width / 2}
      y={element.y + element.height / 2}
      radiusX={Math.abs(element.width) / 2}
      radiusY={Math.abs(element.height) / 2}
      fill={element.fill}
      stroke={element.stroke}
      strokeWidth={element.strokeWidth}
      dash={element.dash}
      opacity={element.opacity}
      rotation={element.rotation}
      scaleX={element.scaleX}
      scaleY={element.scaleY}
      name="board-element"
    />
  );
}
