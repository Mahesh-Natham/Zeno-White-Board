import { useRef } from 'react';
import useCanvasStore from '../store/canvasStore';
import useToolStore from '../store/toolStore';
import useUiStore from '../store/uiStore';
import { TOOLS } from '../config/constants';

interface UseElementDraggingProps {
  stageRef: React.RefObject<any>;
  isReadOnly: boolean;
  isAltPressed: boolean;
}

export function useElementDragging({
  stageRef,
  isReadOnly,
  isAltPressed,
}: UseElementDraggingProps) {
  const isDraggingRef = useRef(false);
  const dragStartPositionsRef = useRef<Record<string, { elementX: number, elementY: number }>>({});
  const initialPointerRef = useRef<{ x: number, y: number } | null>(null);

  const startDrag = (targetId: string, pointerPos: { x: number, y: number }) => {
    const { activeTool } = useToolStore.getState();
    const { elements, selectedIds, addElement } = useCanvasStore.getState();

    if (isReadOnly || activeTool !== TOOLS.SELECT) return;

    isDraggingRef.current = true;
    initialPointerRef.current = pointerPos;
    dragStartPositionsRef.current = {};

    const idsToProcess = selectedIds.includes(targetId) ? selectedIds : [targetId];

    idsToProcess.forEach(selId => {
      dragStartPositionsRef.current[selId] = {
        elementX: elements[selId]?.x || 0,
        elementY: elements[selId]?.y || 0
      };
    });

    if (isAltPressed) {
      const newElements = idsToProcess.map(selId => {
        const el = elements[selId];
        return {
          ...el,
          id: `${el.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          x: dragStartPositionsRef.current[selId].elementX,
          y: dragStartPositionsRef.current[selId].elementY,
        };
      });
      newElements.forEach(el => addElement(el));
    }
  };

  const moveDrag = (pointerPos: { x: number, y: number }) => {
    if (!isDraggingRef.current || !initialPointerRef.current) return;

    const { activeTool } = useToolStore.getState();
    if (isReadOnly || activeTool !== TOOLS.SELECT) return;

    let dx = pointerPos.x - initialPointerRef.current.x;
    let dy = pointerPos.y - initialPointerRef.current.y;

    const { snapToGrid } = useCanvasStore.getState();
    if (snapToGrid) {
      const GRID_SIZE = 20;
      dx = Math.round(dx / GRID_SIZE) * GRID_SIZE;
      dy = Math.round(dy / GRID_SIZE) * GRID_SIZE;
    }

    const offsets: Record<string, { x: number, y: number }> = {};
    Object.keys(dragStartPositionsRef.current).forEach(id => {
      offsets[id] = { x: dx, y: dy };
    });

    useUiStore.getState().setDragOffsets(offsets);
  };

  const endDrag = (pointerPos: { x: number, y: number }) => {
    if (!isDraggingRef.current || !initialPointerRef.current) return;

    const { snapToGrid, performAction } = useCanvasStore.getState();

    isDraggingRef.current = false;
    
    let dx = pointerPos.x - initialPointerRef.current.x;
    let dy = pointerPos.y - initialPointerRef.current.y;

    if (snapToGrid) {
      const GRID_SIZE = 20;
      dx = Math.round(dx / GRID_SIZE) * GRID_SIZE;
      dy = Math.round(dy / GRID_SIZE) * GRID_SIZE;
    }

    const updates: any[] = [];
    Object.keys(dragStartPositionsRef.current).forEach(id => {
      const startPos = dragStartPositionsRef.current[id];
      const newX = startPos.elementX + dx;
      const newY = startPos.elementY + dy;

      if (dx !== 0 || dy !== 0) {
        updates.push({
          id,
          oldProps: { x: startPos.elementX, y: startPos.elementY },
          newProps: { x: newX, y: newY }
        });
      }
    });

    if (updates.length > 0) {
      performAction({ type: 'UPDATE', updates });
    }

    useUiStore.getState().clearDragOffsets();
    dragStartPositionsRef.current = {};
    initialPointerRef.current = null;
  };

  return {
    isDraggingRef,
    startDrag,
    moveDrag,
    endDrag,
  };
}
