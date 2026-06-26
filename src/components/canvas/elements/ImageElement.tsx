import { Image as KonvaImage, Group, Rect, Text } from 'react-konva';
import useImage from 'use-image';

interface ImageElementProps {
  element: any;
  isSelected: boolean;
  onSelect: (e: any, id: string) => void;
  onChange: (id: string, newProps: any) => void;
}

export default function ImageElement({ element, isSelected, onSelect, onChange }: ImageElementProps) {
  // src might be a placeholder or "loading" or the actual Firebase URL
  const [image] = useImage(element.src, 'anonymous');

  if (element.src === 'loading') {
    return (
      <Group
        id={element.id}
        name="board-element"
        x={element.x}
        y={element.y}
        onClick={(e) => onSelect(e, element.id)}
        onTap={(e) => onSelect(e, element.id)}
      >
        <Rect
          width={element.width || 200}
          height={element.height || 200}
          fill="#f3f4f6"
          stroke={isSelected ? '#3b82f6' : '#d1d5db'}
          strokeWidth={isSelected ? 2 : 1}
          cornerRadius={4}
          dash={[5, 5]}
        />
        <Text
          text="Uploading..."
          width={element.width || 200}
          height={element.height || 200}
          align="center"
          verticalAlign="middle"
          fontSize={14}
          fill="#6b7280"
        />
      </Group>
    );
  }

  return (
    <Group
      id={element.id}
      name="board-element"
      x={element.x}
      y={element.y}
      onClick={(e) => onSelect(e, element.id)}
      onTap={(e) => onSelect(e, element.id)}
    >
      <KonvaImage
        image={image}
        width={element.width}
        height={element.height}
        stroke={isSelected ? '#3b82f6' : undefined}
        strokeWidth={isSelected ? 2 : 0}
        cornerRadius={4}
      />
    </Group>
  );
}
