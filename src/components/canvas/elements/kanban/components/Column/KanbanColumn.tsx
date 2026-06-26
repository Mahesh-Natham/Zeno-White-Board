import React from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KanbanColumn as KanbanColumnType, KanbanData } from '../../types';
import { getCardsInColumn, getContrastColor } from '../../utils';
import { useKanbanColumn } from '../../hooks/useKanbanColumn';
import { KanbanCard } from '../Card/KanbanCard';
import { useKanbanUIStore } from '../../store';

interface KanbanColumnProps {
  column: KanbanColumnType;
  data: KanbanData;
  onUpdateData: (updates: Partial<KanbanData>) => void;
  isOverlay?: boolean;
  isSwimlaneHeader?: boolean;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, data, onUpdateData, isOverlay, isSwimlaneHeader }) => {
  const { groupBy } = useKanbanUIStore();
  const cards = getCardsInColumn(data.cards, column.id).filter(c => !c.isArchived);

  const {
    newCardTitle,
    setNewCardTitle,
    isAdding,
    setIsAdding,
    isMenuOpen,
    setIsMenuOpen,
    isEditingTitle,
    setIsEditingTitle,
    columnTitle,
    setColumnTitle,
    wipLimitInput,
    setWipLimitInput,
    handleAddCard,
    handleUpdateTitle,
    handleToggleCollapse,
    handleSetWipLimit,
    handleToggleDone,
    handleDeleteColumn,
    isWipLimitExceeded,
  } = useKanbanColumn({ column, data, onUpdateData, cardsLength: cards.length, groupBy });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      columnId: column.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: column.isCollapsed ? 56 : (data.settings?.columnWidth || 280),
  };

  const columnRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutside = (e: PointerEvent) => {
      if (isMenuOpen && columnRef.current && !columnRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('pointerdown', handleOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen, setIsMenuOpen]);

  if (isDragging && !isOverlay) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="kanban-column opacity-50 bg-gray-200 border-2 border-dashed border-gray-400" 
      />
    );
  }

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (node) columnRef.current = node;
      }}
      style={style}
      className={`kanban-column pointer-events-auto transition-all ${isOverlay ? 'opacity-90 shadow-2xl scale-[1.02] rotate-1' : ''}`}
    >
      {/* Column Header */}
      <div 
        {...attributes} 
        {...listeners} 
        className={`p-3 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-gray-200/50 ${column.isCollapsed ? 'flex-col gap-4 py-4' : ''}`}
        style={{
          backgroundColor: isWipLimitExceeded ? '#FEF2F2' : 'transparent' // Red warning background
        }}
      >
        <div className={`flex items-center gap-2 font-semibold text-gray-700 ${column.isCollapsed ? 'flex-col' : ''}`}>
          {/* Removed dot */}
          {column.isCollapsed ? (
            <h3 className="text-sm writing-vertical-rl rotate-180 min-h-[100px] kanban-exclude-color">{column.title}</h3>
          ) : (
            isEditingTitle ? (
              <input
                autoFocus
                className="text-sm font-semibold border-b border-blue-500 outline-none w-full kanban-exclude-color"
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
                onBlur={handleUpdateTitle}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              />
            ) : (
              <div 
                className="text-xs cursor-pointer px-2 py-1 rounded shadow-sm font-bold truncate transition-opacity hover:opacity-90 kanban-exclude-color"
                style={{ backgroundColor: column.color || '#3B82F6', color: getContrastColor(column.color || '#3B82F6') }}
                title={column.title}
              >
                {column.title}
              </div>
            )
          )}
          
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
            isWipLimitExceeded ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-600'
          }`}>
            {cards.length} {column.wipLimit ? `/ ${column.wipLimit}` : ''}
          </span>
        </div>
        
        <div className="relative pointer-events-auto flex items-center gap-1">
          <button onClick={() => {}}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
          
          <button 
            onClick={() => {}}
            className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-lg leading-none">+</span>
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {column.isCollapsed ? 'Expand Column' : 'Collapse Column'}
              </button>
              
              <div className="px-4 py-2 border-b border-gray-100">
                <label className="block text-xs font-medium text-gray-500 mb-1">Column Color</label>
                <div className="flex gap-1.5 flex-wrap">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'].map(color => (
                    <button
                      key={color}
                      className="w-5 h-5 rounded-full shadow-sm hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }} onClick={() => {}}
                    />
                  ))}
                </div>
              </div>

              <div className="px-4 py-2 border-b border-gray-100">
                <label className="block text-xs font-medium text-gray-500 mb-1">WIP Limit</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={wipLimitInput}
                    onChange={(e) => setWipLimitInput(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 outline-none"
                    placeholder="None"
                  />
                  <button onClick={() => {}}
                    className="text-xs bg-blue-500 text-white px-2 rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
              <button onClick={() => {}}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {column.isDone ? 'Mark as Not Done' : 'Mark as Done'}
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button onClick={() => {}}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
              >
                Delete Column
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards List */}
      {!column.isCollapsed && !isSwimlaneHeader && (
        <div className={`kanban-card-list kanban-scrollbar ${column.isDone ? 'opacity-60' : ''}`}>
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
                  handleAddCard({ cardsInColumn: cards });
                } else if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewCardTitle('');
                }
              }}
              onBlur={() => handleAddCard({ cardsInColumn: cards })}
            />
          </div>
        ) : (
          <button
            className="mt-2 flex items-center gap-1 text-sm text-gray-500 hover:bg-gray-200/50 hover:text-gray-700 p-2 rounded-md transition-colors w-full text-left pointer-events-auto"
          >
            <span className="text-lg leading-none">+</span> Add a card
          </button>
        )}
      </div>
      )}
    </div>
  );
};
