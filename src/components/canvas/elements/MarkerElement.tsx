import { Line } from 'react-konva';

export default function MarkerElement({ element }) {
  return (
    <Line
      id={element.id}
      x={element.x}
      y={element.y}
      points={element.points}
      stroke={element.stroke}
      strokeWidth={Math.max(element.strokeWidth, 16)} // Thicker stroke for marker
      dash={element.dash}
      opacity={element.opacity !== 1 ? element.opacity : 0.5} // Translucent by default
      globalCompositeOperation="multiply" // Makes it act like a real highlighter
      rotation={element.rotation}
      scaleX={element.scaleX}
      scaleY={element.scaleY}
      tension={0.5} 
      lineCap="square" // Authentic chisel tip highlighter feel
      lineJoin="miter"
      hitStrokeWidth={Math.max(20, element.strokeWidth)}
      name="board-element"
    />
  );
}
