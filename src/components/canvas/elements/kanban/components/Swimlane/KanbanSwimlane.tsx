import React, { useState } from 'react';
import { KanbanData, KanbanColumn as KanbanColumnType, KanbanSwimlaneDef } from '../../types';
import { KanbanCard } from '../Card/KanbanCard';
import { getCardsForSwimlaneAndColumn } from '../../utils';
import { useKanbanUIStore } from '../../store';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

interface KanbanSwimlaneProps {
  lane: KanbanSwimlaneDef;
  columns: KanbanColumnType[];
  data: KanbanData;
  onUpdateData: (updates: Partial<KanbanData>) => void;
}

export const KanbanSwimlane: React.FC<KanbanSwimlaneProps> = ({ lane, columns, data, onUpdateData }) => {
  const { groupBy, collapsedSwimlanes, toggleSwimlaneCollapse } = useKanbanUIStore();
  const isCollapsed = collapsedSwimlanes.includes(lane.id);

  return (
    <div className="flex flex-col mb-4 border border-gray-200 bg-white rounded-lg overflow-hidden shadow-sm pointer-events-auto">
      {/* Swimlane Header */}
      <div 
        className="flex items-center p-3 bg-gray-50 border-b border-gray-200 cursor-pointer select-none hover:bg-gray-100 transition-colors sticky left-0 z-10"
      >
        <span className="mr-2 text-gray-500">
          {isCollapsed ? '▶' : '▼'}
        </span>
        <div className="flex items-center gap-2">
          {lane.color && (
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lane.color }} />
          )}
          <h3 className="font-semibold text-gray-700">{lane.title}</h3>
        </div>
      </div>

      {/* Swimlane Cells */}
      {!isCollapsed && (
        <div className="flex flex-col">
          <div className="flex gap-4 p-4 min-w-max border-b border-gray-100 last:border-0">
            {columns.map(column => (
              <SwimlaneCell
                key={`${lane.id}::${column.id}`}
                lane={lane}
                column={column}
                data={data}
                onUpdateData={onUpdateData}
                groupBy={groupBy}
              />
            ))}
          </div>
          
          {/* Render Sub-lanes if it's a group */}
          {lane.children && lane.children.length > 0 && (
            <div className="pl-6 pb-2 pr-2 bg-gray-50/30">
              {lane.children.map(childLane => (
                <KanbanSwimlane
                  key={childLane.id}
                  lane={childLane}
                  columns={columns}
                  data={data}
                  onUpdateData={onUpdateData}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface SwimlaneCellProps {
  lane: KanbanSwimlaneDef;
  column: KanbanColumnType;
  data: KanbanData;
  onUpdateData: (updates: Partial<KanbanData>) => void;
  groupBy: string;
}

const SwimlaneCell: React.FC<SwimlaneCellProps> = ({ lane, column, data, onUpdateData, groupBy }) => {
  const cellId = `${lane.id}::${column.id}`;
  const cards = getCardsForSwimlaneAndColumn(data.cards, column.id, lane.id, groupBy).filter(c => !c.isArchived);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Define this cell as a droppable area for DndKit
  const { setNodeRef } = useDroppable({
    id: cellId,
    data: {
      type: 'swimlane_cell',
      columnId: column.id,
      swimlaneId: lane.id
    }
  });

  const handleAddCard = () => {
    if (!newCardTitle.trim()) {
      setIsAdding(false);
      return;
    }

    const newPosition = cards.length > 0 ? cards[cards.length - 1].position + 1000 : 1000;
    
    let assigneeIds: string[] = [];
    let labelIds: string[] = [];
    let priority: any = 'none';
    let laneId: string | undefined = undefined;

    if (groupBy === 'assignee' && lane.id !== 'unassigned') {
      assigneeIds = [lane.id];
    } else if (groupBy === 'priority') {
      priority = lane.id;
    } else if (groupBy === 'label' && lane.id !== 'unlabeled') {
      labelIds = [lane.id];
    } else if (groupBy === 'lane') {
      laneId = lane.id;
    }
    
    const newCard = {
      id: `card-${Date.now()}`,
      columnId: column.id,
      number: data.nextCardNumber,
      title: newCardTitle.trim(),
      description: '',
      position: newPosition,
      assigneeIds,
      labelIds,
      priority,
      checklists: [],
      commentCount: 0,
      attachmentCount: 0,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'currentUser',
      laneId
    };

    onUpdateData({
      cards: [...data.cards, newCard],
      nextCardNumber: data.nextCardNumber + 1,
    });
    
    setNewCardTitle('');
    setIsAdding(false);
  };

  return (
    <div 
      ref={setNodeRef}
      className={`kanban-card-list kanban-scrollbar rounded-md p-2 bg-gray-50/50 min-h-[100px] border border-transparent hover:border-gray-200 transition-colors ${column.isDone ? 'opacity-60' : ''}`}
      style={{ width: data.settings?.columnWidth || 280 }}
    >
      <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        {cards.map(card => (
          <KanbanCard 
            key={card.id} 
            card={card} 
            boardLabels={data.labels} 
            columnColor={column.color}
            onDelete={(id) => {
              if (window.confirm('Are you sure you want to delete this card?')) {
                const updatedCards = data.cards.filter(c => c.id !== id);
                onUpdateData({ cards: updatedCards });
              }
            }}
            onUpdateCard={(id, updates) => {
              const updatedCards = data.cards.map(c => c.id === id ? { ...c, ...updates } : c);
              onUpdateData({ cards: updatedCards });
            }}
          />
        ))}
      </SortableContext>

      {/* Add Card Input */}
      {isAdding ? (
        <div className="mt-2 bg-white p-2 rounded border border-blue-400 shadow-sm pointer-events-auto">
          <textarea
            autoFocus
            className="w-full text-sm outline-none resize-none"
            rows={2}
            placeholder="Enter a title for this card..."
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddCard();
              } else if (e.key === 'Escape') {
                setIsAdding(false);
                setNewCardTitle('');
              }
            }}
            onBlur={handleAddCard}
          />
        </div>
      ) : (
        <button
          className="mt-2 flex items-center gap-1 text-sm text-gray-500 hover:bg-gray-200/50 hover:text-gray-700 p-2 rounded-md transition-colors w-full text-left pointer-events-auto"
        >
          <span className="text-lg leading-none">+</span> Add card
        </button>
      )}
    </div>
  );
};
