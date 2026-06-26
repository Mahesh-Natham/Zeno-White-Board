import { DragStartEvent, DragEndEvent, DragOverEvent, Modifier } from '@dnd-kit/core';
import { KanbanData } from '../types';
import { getPositionBetween, getCardsInColumn } from '../utils';
import useCanvasStore from '../../../../../store/canvasStore';

interface UseKanbanDndProps {
  data: KanbanData;
  onUpdateData: (updates: Partial<KanbanData>) => void;
  columns: KanbanData['columns'];
  groupBy: 'none' | 'assignee' | 'priority' | 'label' | 'lane';
  setDraggingColumnId: (id: string | null) => void;
  setDraggingCardId: (id: string | null) => void;
}

export function useKanbanDnd({
  data,
  onUpdateData,
  columns,
  groupBy,
  setDraggingColumnId,
  setDraggingCardId,
}: UseKanbanDndProps) {
  const scale = useCanvasStore(state => state.viewport.scale);

  const scaleModifier: Modifier = ({ transform }) => {
    return {
      ...transform,
      x: transform.x / scale,
      y: transform.y / scale,
    };
  };
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { type } = active.data.current ?? {};

    if (type === 'column') {
      setDraggingColumnId(active.id as string);
    } else if (type === 'card') {
      setDraggingCardId(active.id as string);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveCard = active.data.current?.type === 'card';
    if (!isActiveCard) return;

    // Optimistic updates could be handled here in the future
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingColumnId(null);
    setDraggingCardId(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'column' && overType === 'column') {
      // Reorder columns
      const oldIndex = columns.findIndex(c => c.id === activeId);
      const newIndex = columns.findIndex(c => c.id === overId);
      
      const isMovingRight = newIndex > oldIndex;
      const targetIndex = isMovingRight ? newIndex : newIndex - 1;
      const afterIndex = isMovingRight ? newIndex + 1 : newIndex;
      
      const beforePosition = columns[targetIndex]?.position;
      const afterPosition = columns[afterIndex]?.position;
      
      const newPosition = getPositionBetween(beforePosition, afterPosition);

      const updatedColumns = data.columns.map(c => 
        c.id === activeId ? { ...c, position: newPosition } : c
      );

      onUpdateData({ columns: updatedColumns });
      return;
    }

    if (activeType === 'card') {
      // Reorder/move cards
      const activeCard = data.cards.find(c => c.id === activeId);
      if (!activeCard) return;

      let targetColumnId: string;
      let newPosition: number;
      let newAssigneeIds = activeCard.assigneeIds;
      let newLabelIds = activeCard.labelIds;
      let newPriority = activeCard.priority;
      let newLaneId = activeCard.laneId;

      if (overType === 'swimlane_cell') {
         targetColumnId = over.data.current?.columnId;
         const targetSwimlaneId = over.data.current?.swimlaneId;
         
         if (groupBy === 'assignee') {
           newAssigneeIds = targetSwimlaneId === 'unassigned' ? [] : [targetSwimlaneId];
         } else if (groupBy === 'priority') {
           newPriority = targetSwimlaneId;
         } else if (groupBy === 'label') {
           newLabelIds = targetSwimlaneId === 'unlabeled' ? [] : [targetSwimlaneId];
         } else if (groupBy === 'lane') {
           newLaneId = targetSwimlaneId;
         }
         
         const targetCards = data.cards.filter(c => c.columnId === targetColumnId);
         newPosition = targetCards.length > 0 ? targetCards[targetCards.length - 1].position + 1000 : 1000;
      } else if (overType === 'column') {
        targetColumnId = overId as string;
        const targetCards = getCardsInColumn(data.cards, targetColumnId);
        newPosition = targetCards.length > 0 ? targetCards[targetCards.length - 1].position + 1000 : 1000;
      } else {
        const overCard = data.cards.find(c => c.id === overId);
        if (!overCard) return;
        
        targetColumnId = overCard.columnId;
        const targetCards = getCardsInColumn(data.cards, targetColumnId);
        const overIndex = targetCards.findIndex(c => c.id === overId);
        
        const isSameColumn = activeCard.columnId === targetColumnId;
        const activeIndex = isSameColumn ? targetCards.findIndex(c => c.id === activeId) : -1;
        const isDraggingDown = isSameColumn && activeIndex < overIndex;
        
        const beforePosition = isDraggingDown ? targetCards[overIndex]?.position : targetCards[overIndex - 1]?.position;
        const afterPosition = isDraggingDown ? targetCards[overIndex + 1]?.position : targetCards[overIndex]?.position;
        
        newPosition = getPositionBetween(beforePosition, afterPosition);
      }

      const updatedCards = data.cards.map(c => 
        c.id === activeId ? { 
          ...c, 
          columnId: targetColumnId, 
          position: newPosition,
          assigneeIds: newAssigneeIds,
          labelIds: newLabelIds,
          priority: newPriority,
          laneId: newLaneId
        } : c
      );

      onUpdateData({ cards: updatedCards });
    }
  };

  return { handleDragStart, handleDragOver, handleDragEnd, scaleModifier };
}
