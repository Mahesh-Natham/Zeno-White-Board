import { Path } from 'react-konva';
import { getFreehandPath } from '../../../utils/freehandUtils';

export default function MarkerElement({ element }) {
  const pathData = getFreehandPath(element.points, Math.max(element.strokeWidth, 16), true);

  return (
    <Path
      id={element.id}
      x={element.x}
      y={element.y}
      data={pathData}
      fill={element.stroke} // Fill is used for Path
      opacity={element.opacity !== 1 ? element.opacity : 0.5} // Translucent by default
      globalCompositeOperation="multiply" // Makes it act like a real highlighter
      rotation={element.rotation}
      scaleX={element.scaleX}
      scaleY={element.scaleY}
      name="board-element"
    />
  );
}
