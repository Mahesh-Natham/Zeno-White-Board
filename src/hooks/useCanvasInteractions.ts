import { useCallback } from 'react';
import useCanvasStore from '../store/canvasStore';
import useToolStore from '../store/toolStore';
import { TOOLS } from '../config/constants';
import { KonvaEventObject } from 'konva/lib/Node';

interface UseCanvasInteractionsProps {
  isReadOnly?: boolean;
  setEditingElementId: (id: string | null) => void;
}

export const useCanvasInteractions = ({ isReadOnly, setEditingElementId }: UseCanvasInteractionsProps) => {
  const { activeTool } = useToolStore();

  const handleElementSelect = useCallback((e: any, id: string) => {
    if (isReadOnly || activeTool !== TOOLS.SELECT) return;

    const nativeEvt = e?.evt || e;
    const { elements, selectedIds, setSelectedIds } = useCanvasStore.getState();

    // Handle right-click selection without clearing if already selected
    if (nativeEvt?.button === 2) {
      if (!selectedIds.includes(id)) {
        // Find if this element is part of a group
        const groupElements = Object.values(elements).filter(el => el.groupId === elements[id].groupId && elements[id].groupId);
        if (groupElements.length > 0) {
          setSelectedIds(groupElements.map(el => el.id));
        } else {
          setSelectedIds([id]);
        }
      }
      return;
    }
    
    // Shift key for multi-select
    if (nativeEvt?.shiftKey) {
      const isSelected = selectedIds.includes(id);
      setSelectedIds(isSelected ? selectedIds.filter(sid => sid !== id) : [...selectedIds, id]);
    } else {
      setSelectedIds([id]);
    }
  }, [isReadOnly, activeTool]);

  const handleTransformerChange = useCallback((updates: any) => {
    if (isReadOnly) return;
    useCanvasStore.getState().performAction({ type: 'UPDATE', updates });
  }, [isReadOnly]);

  const handleElementDoubleClick = useCallback((element: any) => {
    if (isReadOnly || activeTool !== TOOLS.SELECT) return;
    setEditingElementId(element.id);
  }, [isReadOnly, activeTool, setEditingElementId]);

  const handleElementChange = useCallback((id: string, newProps: any) => {
    if (isReadOnly) return;
    const { elements: els, snapToGrid: snap, performAction: act } = useCanvasStore.getState();
    const GRID_SIZE = 20;
    
    const snappedProps = { ...newProps };
    if (snap && ('x' in snappedProps || 'y' in snappedProps)) {
      if ('x' in snappedProps) snappedProps.x = Math.round(snappedProps.x / GRID_SIZE) * GRID_SIZE;
      if ('y' in snappedProps) snappedProps.y = Math.round(snappedProps.y / GRID_SIZE) * GRID_SIZE;
    }
    
    // TypeScript safe partial extraction
    const typedKeys = Object.keys(snappedProps) as Array<keyof typeof els[string]>;
    const oldProps: Record<string, any> = {};
    typedKeys.forEach(key => {
      if (els[id]?.[key] !== undefined) {
        oldProps[key] = els[id][key];
      }
    });

    act({
      type: 'UPDATE',
      updates: [{
        id,
        oldProps,
        newProps: snappedProps,
      }],
    });
  }, [isReadOnly]);

  return {
    handleElementSelect,
    handleTransformerChange,
    handleElementDoubleClick,
    handleElementChange,
  };
};
