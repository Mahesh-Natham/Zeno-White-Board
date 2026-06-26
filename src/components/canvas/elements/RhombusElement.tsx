import { Group, Line } from 'react-konva';

export default function RhombusElement({ element, onDoubleClick}) {
  // Rhombus drawn as a polygon with 4 points
  const points = [
    element.width / 2, 0,
    element.width, element.height / 2,
    element.width / 2, element.height,
    0, element.height / 2
  ];

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
      onDblClick={(e) => {
        e.cancelBubble = true;
        if (onDoubleClick) onDoubleClick(element);
      }}
      onDblTap={(e) => {
        e.cancelBubble = true;
        if (onDoubleClick) onDoubleClick(element);
      }}
      name="board-element"
    >
      <Line
        points={points}
        closed={true}
        fill={element.fill}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
        opacity={element.opacity}
      />
    </Group>
  );
}
