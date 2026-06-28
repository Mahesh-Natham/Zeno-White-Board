import { Group, Line } from 'react-konva';

export default function BlockArrowElement({ element, onDoubleClick}) {
  const w = element.width;
  const h = element.height;
  
  // Right-pointing block arrow polygon
  const points = [
    0, h * 0.25,
    w * 0.6, h * 0.25,
    w * 0.6, 0,
    w, h * 0.5,
    w * 0.6, h,
    w * 0.6, h * 0.75,
    0, h * 0.75
  ];

  return (
    <Group
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      offsetY={element.height / 2}
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
        lineJoin="round"
      />
    </Group>
  );
}
