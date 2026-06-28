import { Group, Rect, Text } from 'react-konva';

export default function StickyNoteElement({ element, isEditing, onDoubleClick}) {
  // Padding for text inside sticky note
  const PADDING = 16;
  const innerWidth = element.width - PADDING * 2;
  const innerHeight = element.height - PADDING * 2;

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
      {/* Sticky Note Background */}
      <Rect
        width={element.width}
        height={element.height}
        fill={element.fill}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
        opacity={element.opacity}
        cornerRadius={10}
        shadowColor="rgba(0,0,0,0.15)"
        shadowBlur={10}
        shadowOffset={{ x: 2, y: 4 }}
      />
      
      {/* Sticky Note Text */}
      {!isEditing && (
        <Text
          x={PADDING}
          y={PADDING}
          width={innerWidth}
          height={innerHeight}
          text={element.text}
          fontSize={element.fontSize}
          fontFamily={element.fontFamily}
          fill={element.textColor}
          align={element.align}
          verticalAlign="middle"
          wrap="word"
          // Don't intercept pointer events, let Group handle it
          listening={false}
        />
      )}
    </Group>
  );
}
