import { Group, Line } from 'react-konva';

export default function DividerElement({ element }) {
  return (
    <Group
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      scaleX={element.scaleX}
      scaleY={element.scaleY}
      name="board-element"
    >
      <Line
        points={[0, element.height / 2, element.width, element.height / 2]}
        stroke={element.stroke}
        strokeWidth={Math.max(element.strokeWidth, 2)}
        opacity={element.opacity}
        hitStrokeWidth={10} // Make it easier to click/select
      />
    </Group>
  );
}
