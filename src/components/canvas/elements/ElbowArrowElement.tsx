import { Arrow, Group } from 'react-konva';
import { Html } from 'react-konva-utils';

import { Trash2 } from 'lucide-react';
import useCanvasStore from '../../../store/canvasStore';

export default function ElbowArrowElement({ element, isSelected }) {
  // We receive element.points as [x1, y1, x2, y2]
  // Default x2, y2 to x1, y1 to prevent NaN crashes when the arrow is first instantiated with [0,0]
  const pts = element.points || [0, 0, 0, 0];
  const x1 = pts[0] || 0;
  const y1 = pts[1] || 0;
  const x2 = pts[2] ?? x1;
  const y2 = pts[3] ?? y1;

  // Calculate bezier control points for a smooth curve
  // We use the same aesthetic as the timeline: curving out from the start and end by 40% of the distance
  const dx = x2 - x1;
  const dy = y2 - y1;
  const isHorizontal = Math.abs(dx) > Math.abs(dy);
  
  const cp1X = isHorizontal ? x1 + dx * 0.4 : x1;
  const cp1Y = isHorizontal ? y1 : y1 + dy * 0.4;
  const cp2X = isHorizontal ? x2 - dx * 0.4 : x2;
  const cp2Y = isHorizontal ? y2 : y2 - dy * 0.4;
  
  const bezierPoints = [x1, y1, cp1X, cp1Y, cp2X, cp2Y, x2, y2];

  // Cubic bezier midpoint calculation (t = 0.5)
  const t = 0.5;
  const midX = (1 - t) ** 3 * x1 + 3 * (1 - t) ** 2 * t * cp1X + 3 * (1 - t) * t ** 2 * cp2X + t ** 3 * x2;
  const midY = (1 - t) ** 3 * y1 + 3 * (1 - t) ** 2 * t * cp1Y + 3 * (1 - t) * t ** 2 * cp2Y + t ** 3 * y2;

  const handleDelete = (e) => {
    e.stopPropagation();
    e.preventDefault();
    useCanvasStore.getState().removeElements([element.id]);
  };

  return (
    <Group
      id={element.id}
      x={element.x}
      y={element.y}
      name="board-element"
    >
      <Arrow
        points={bezierPoints}
        stroke={isSelected ? '#ef4444' : element.stroke}
        strokeWidth={isSelected ? 2.5 : element.strokeWidth}
        dash={element.dash}
        opacity={element.opacity}
        bezier={true}
        pointerLength={10}
        pointerWidth={10}
        fill={isSelected ? '#ef4444' : element.stroke} // arrow head fill matches stroke
        hitStrokeWidth={Math.max(15, element.strokeWidth)}
      />

      {isSelected && (
        <Html groupProps={{ x: midX, y: midY }} divProps={{ style: { position: 'absolute' } }}>
           <button 
             className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto"
             onPointerDown={handleDelete}
           >
             <Trash2 size={12} />
           </button>
        </Html>
      )}
    </Group>
  );
}
