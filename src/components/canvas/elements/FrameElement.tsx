import { Group, Rect, Text } from 'react-konva';

export default function FrameElement({ element, onDoubleClick}) {
  // Frames are rendered at the bottom of the z-index implicitly if they are created first,
  // but ideally we just render them like any other shape.
  
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
      name="board-element"
    >
      {/* Title Tab / Label */}
      <Text
        x={0}
        y={-24}
        text={element.text || 'Frame'}
        fontSize={16}
        fontFamily="Inter"
        fill="#9ca3af" // subtle gray text
        fontStyle="bold"
      />
      
      {/* Frame Border */}
      <Rect
        width={element.width}
        height={element.height}
        fill="transparent" // empty inside so you can click items inside it
        stroke="#d1d5db" // light gray
        strokeWidth={2}
        dash={[10, 5]} // dashed border for frames
        opacity={element.opacity}
        hitStrokeWidth={20} // Easier to grab the edge
      />
      
      {/* Invisible solid background purely for hit detection? No, we want to click THROUGH it */}
    </Group>
  );
}
