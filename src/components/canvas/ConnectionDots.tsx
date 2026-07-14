import { useEffect, useState } from 'react';
/* eslint-disable react-hooks/refs */
import { Circle, Group } from 'react-konva';
import { TOOLS } from '../../config/constants';
import useToolStore from '../../store/toolStore';

export default function ConnectionDots({ selectedIds, hoveredElementId, elements, stageRef, onDragStart }) {
  const [bounds, setBounds] = useState(null);
  const { setActiveTool } = useToolStore();

  useEffect(() => {
    // Show dots if exactly one element is selected, OR if an element is hovered
    const id = hoveredElementId || (selectedIds.length === 1 ? selectedIds[0] : null);
    
    if (!id) {
      setTimeout(() => setBounds(null), 0);
      return;
    }

    const el = elements[id];
    
    // Only show dots for connectable shapes
    const connectableTypes = [
      TOOLS.RECTANGLE, TOOLS.CIRCLE, TOOLS.TRIANGLE, TOOLS.TEXT, 
      TOOLS.STICKY_NOTE, TOOLS.IMAGE, TOOLS.TABLE, 'kanban', 'timeline', 
      TOOLS.GOOGLE_WORKSPACE
    ];
    if (!el || !connectableTypes.includes(el.type)) {
      setTimeout(() => setBounds(null), 0);
      return;
    }

    const stage = stageRef.current;
    if (!stage) return;
    
    const node = stage.findOne(`#${id}`);
    if (!node) return;

    // Use the element's data model coordinates (canvas space) since dots are rendered 
    // inside a Layer that's already transformed by the Stage
    let w = el.width || 0;
    let h = el.height || 0;

    if (w === 0 || h === 0) {
      if (el.type === 'kanban') {
        w = 900;
        h = 500;
      } else if (['table', 'timeline', 'google_workspace'].includes(el.type)) {
        w = 800;
        h = 400;
      }
    }
    const dotOffset = 8 / (stage.scaleX() || 1); // Scale-compensated offset
    
    // HTML overlays like Kanban, Table, and Google Workspace have floating headers above them
    let topOffset = dotOffset;
    if (['kanban', 'table', 'google_workspace'].includes(el.type)) {
      topOffset += 64 / (stage.scaleX() || 1); // Clear the header offset
    }
    
    setTimeout(() => {
      setBounds({
        top: { x: el.x + w / 2, y: el.y - topOffset },
        right: { x: el.x + w + dotOffset, y: el.y + h / 2 },
        bottom: { x: el.x + w / 2, y: el.y + h + dotOffset },
        left: { x: el.x - dotOffset, y: el.y + h / 2 },
        elementId: id
      });
    }, 0);
  }, [selectedIds, hoveredElementId, elements, stageRef]);

  if (!bounds) return null;

  const stage = stageRef.current;
  const dotRadius = 6 / (stage?.scaleX() || 1); // Scale-compensated radius
  const dotStrokeWidth = 2 / (stage?.scaleX() || 1);

  const handleDotDragStart = (e) => {
    e.cancelBubble = true;
    if (e.evt && e.evt.pointerId !== undefined && e.evt.target && e.evt.target.setPointerCapture) {
      try { e.evt.target.setPointerCapture(e.evt.pointerId); } catch(err) {}
    }
    setActiveTool(TOOLS.ARROW);
    if (onDragStart) {
      onDragStart(bounds.elementId);
    }
  };

  const createDot = (pos) => (
    <Circle
      x={pos.x}
      y={pos.y}
      radius={dotRadius}
      fill="#2563eb"
      stroke="#ffffff"
      strokeWidth={dotStrokeWidth}
      onMouseDown={handleDotDragStart}
      onTouchStart={handleDotDragStart}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        stage.container().style.cursor = 'crosshair';
        e.target.scale({ x: 1.5, y: 1.5 });
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        stage.container().style.cursor = 'default';
        e.target.scale({ x: 1, y: 1 });
      }}
    />
  );

  return (
    <Group>
      {createDot(bounds.top)}
      {createDot(bounds.right)}
      {createDot(bounds.bottom)}
      {createDot(bounds.left)}
    </Group>
  );
}
