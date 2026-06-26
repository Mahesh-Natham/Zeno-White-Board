import { Rect } from 'react-konva';

export default function SelectionRect({ selectionBox }) {
  if (!selectionBox.visible) return null;

  // Ensure width/height are positive for Konva rendering
  const x = Math.min(selectionBox.startX, selectionBox.endX);
  const y = Math.min(selectionBox.startY, selectionBox.endY);
  const width = Math.abs(selectionBox.endX - selectionBox.startX);
  const height = Math.abs(selectionBox.endY - selectionBox.startY);

  if (width === 0 || height === 0) return null;

  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="rgba(66, 98, 255, 0.1)" // Brand color with low opacity
      stroke="#4262FF"
      strokeWidth={1}
      dash={[4, 4]} // Dashed line
      listening={false} // Selection rect shouldn't capture events
    />
  );
}
