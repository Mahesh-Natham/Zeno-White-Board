import { memo } from 'react';
import { Layer, Line } from 'react-konva';

const GRID_SIZE = 40;

function CanvasGridInner({ stagePos, stageScale, windowSize }) {
  // Calculate the bounds of the visible area
  const startX = Math.floor((-stagePos.x / stageScale) / GRID_SIZE) * GRID_SIZE;
  const endX = Math.floor((-stagePos.x + windowSize.width) / stageScale / GRID_SIZE) * GRID_SIZE + GRID_SIZE;
  
  const startY = Math.floor((-stagePos.y / stageScale) / GRID_SIZE) * GRID_SIZE;
  const endY = Math.floor((-stagePos.y + windowSize.height) / stageScale / GRID_SIZE) * GRID_SIZE + GRID_SIZE;

  const lines = [];

  // Vertical lines
  for (let x = startX; x <= endX; x += GRID_SIZE) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, startY, x, endY]}
        stroke="#E5E5E5"
        strokeWidth={1 / stageScale}
        dash={[]}
        listening={false}
      />
    );
  }

  // Horizontal lines
  for (let y = startY; y <= endY; y += GRID_SIZE) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[startX, y, endX, y]}
        stroke="#E5E5E5"
        strokeWidth={1 / stageScale}
        dash={[]}
        listening={false}
      />
    );
  }

  return (
    <Layer listening={false}>
      {lines}
    </Layer>
  );
}

// Only re-render when viewport position/scale or window size changes.
// This skips re-renders on clicks, selections, and element updates.
const CanvasGrid = memo(CanvasGridInner, (prev, next) =>
  prev.stagePos.x === next.stagePos.x &&
  prev.stagePos.y === next.stagePos.y &&
  prev.stageScale === next.stageScale &&
  prev.windowSize.width === next.windowSize.width &&
  prev.windowSize.height === next.windowSize.height
);

CanvasGrid.displayName = 'CanvasGrid';
export default CanvasGrid;

