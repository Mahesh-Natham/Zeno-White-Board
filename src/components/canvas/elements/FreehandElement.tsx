import { Path } from 'react-konva';
import { getFreehandPath } from '../../../utils/freehandUtils';

export default function FreehandElement({ element }) {
  const pathData = getFreehandPath(element.points, Math.max(2, element.strokeWidth), false);

  return (
    <Path
      id={element.id}
      x={element.x}
      y={element.y}
      data={pathData}
      fill={element.stroke}
      opacity={element.opacity}
      rotation={element.rotation}
      scaleX={element.scaleX}
      scaleY={element.scaleY}
      hitStrokeWidth={Math.max(15, element.strokeWidth)}
      name="board-element"
    />
  );
}
