import React from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { KanbanData } from '../../types';
import { useKanbanUIStore } from '../../store';
import { sortByPosition, getSwimlanes } from '../../utils';
import { KanbanColumn } from '../Column/KanbanColumn';
import { KanbanSwimlane } from '../Swimlane/KanbanSwimlane';
import { KanbanCard } from '../Card/KanbanCard';

import { useKanbanDnd } from '../../hooks/useKanbanDnd';
import { useKanbanBoard } from '../../hooks/useKanbanBoard';
import useCanvasStore from '../../../../../../store/canvasStore';

interface KanbanBoardProps {
  data: KanbanData;
  isReadOnly: boolean;
  onUpdateData: (updates: Partial<KanbanData>) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ data, isReadOnly, onUpdateData }) => {
  const { 
    setDraggingCardId, 
    setDraggingColumnId, 
    draggingCardId, 
    draggingColumnId,
    groupBy,
  } = useKanbanUIStore();

  const columns = sortByPosition(data.columns);
  const swimlanes = getSwimlanes(data, groupBy);

  const scale = useCanvasStore(state => state.viewport.scale);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    scaleModifier 
  } = useKanbanDnd({
    data,
    onUpdateData,
    columns,
    groupBy,
    setDraggingColumnId,
    setDraggingCardId,
  });

  const {
    newColumnTitle,
    setNewColumnTitle,
    isAddingColumn,
    setIsAddingColumn,
    handleAddColumn,
    handleToggleAutoSize,
  } = useKanbanBoard({ data, onUpdateData, columns, groupBy });

  const getActiveCard = () => {
    if (!draggingCardId) return null;
    return data.cards.find(c => c.id === draggingCardId) || null;
  };

  const getActiveColumn = () => {
    if (!draggingColumnId) return null;
    return data.columns.find(c => c.id === draggingColumnId) || null;
  };

  const activeCard = getActiveCard();
  const activeColumn = getActiveColumn();

  const boardAreaRef = React.useRef<HTMLDivElement>(null);
  const addColumnRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isAddingColumn && addColumnRef.current) {
      addColumnRef.current.scrollIntoView({ behavior: 'smooth', inline: 'end', block: 'nearest' });
    }
  }, [isAddingColumn]);

  return (
    <div className="flex flex-col h-full w-full bg-transparent rounded-lg">

      {/* Main Board Area */}
      <div 
        ref={boardAreaRef}
        className="flex-1 overflow-auto kanban-scrollbar p-6 kanban-board-bg"
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          modifiers={[scaleModifier]}
        >
          {groupBy === 'none' ? (
            // Standard Column View
            <div className="flex gap-4 min-w-max h-full">
              <SortableContext 
                items={columns.map(c => c.id)} 
                strategy={horizontalListSortingStrategy}
              >
                {columns.map((column) => (
                  <KanbanColumn 
                    key={column.id} 
                    column={column} 
                    data={data}
                    onUpdateData={onUpdateData}
                  />
                ))}
              </SortableContext>

              {/* Add Column Button */}
              {!isReadOnly && (
                <div ref={addColumnRef} className="shrink-0 flex items-start pr-12">
                  {isAddingColumn ? (
                    <div className="w-[180px] bg-white p-2.5 rounded-lg shadow-md border border-blue-400">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Column title..."
                        className="w-full text-sm outline-none mb-2 bg-transparent"
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddColumn();
                          else if (e.key === 'Escape') {
                            setIsAddingColumn(false);
                            setNewColumnTitle('');
                          }
                        }}
                      />
                      <div className="flex gap-1.5">
                        <button
                          className="flex-1 py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition-colors"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setIsAddingColumn(false); setNewColumnTitle(''); }}
                          className="flex-1 py-1 text-gray-600 hover:bg-gray-100 text-xs font-medium rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingColumn(true)}
                      className="flex items-center justify-center w-10 h-10 bg-white/50 backdrop-blur hover:bg-white text-gray-500 hover:text-blue-500 hover:shadow text-xl rounded-full border border-gray-200 transition-all"
                      title="Add Column"
                    >
                      +
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-0 w-max">
              <div className="flex gap-4 mb-2 sticky top-0 z-20">
                {columns.map(col => (
                  <div key={col.id} className="bg-white/90 backdrop-blur-md rounded-t-lg shadow-sm border-b border-gray-200">
                    <KanbanColumn 
                      column={col} 
                      data={data} 
                      onUpdateData={onUpdateData} 
                      isSwimlaneHeader 
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                {swimlanes.map(lane => (
                  <KanbanSwimlane
                    key={lane.id}
                    lane={lane}
                    columns={columns}
                    data={data}
                    onUpdateData={onUpdateData}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Drag Overlays */}
          {createPortal(
            <DragOverlay 
              modifiers={[]} 
              dropAnimation={null}
            >
              {activeCard ? (
                <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                  <KanbanCard 
                    card={activeCard} 
                    boardLabels={data.labels} 
                    columnColor={data.columns.find(c => c.id === activeCard.columnId)?.color}
                    isOverlay 
                  />
                </div>
              ) : null}
              {activeColumn ? (
                <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                  <KanbanColumn 
                    column={activeColumn} 
                    data={data} 
                    onUpdateData={onUpdateData} 
                    isOverlay 
                  />
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>
    </div>
  );
};
