import { Group, Rect, Text } from 'react-konva';

export default function TextElement({ element, isEditing, onDoubleClick}) {
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
      {/* Invisible background to make the entire bounding box draggable/clickable */}
      <Rect
        width={element.width}
        height={element.height}
        fill="transparent"
      />
      {!isEditing && (
        <Text
          width={element.width}
          height={element.height}
          text={element.text}
          fontSize={element.fontSize}
          fontFamily={element.fontFamily}
          fill={element.textColor}
          align={element.align}
          verticalAlign="top"
          wrap="word"
          listening={false}
        />
      )}
    </Group>
  );
}
