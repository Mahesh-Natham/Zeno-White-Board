import React, { useMemo } from 'react';
import { KanbanCard as KanbanCardType, KanbanData } from '../../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useKanbanUIStore } from '../../store';
import { MOCK_USERS } from '../../utils';

interface KanbanCardProps {
  card: KanbanCardType;
  boardLabels: KanbanData['labels'];
  columnColor?: string;
  onDelete?: (id: string) => void;
  onUpdateCard?: (id: string, updates: Partial<KanbanCardType>) => void;
  isOverlay?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ card, boardLabels, columnColor, onDelete, onUpdateCard, isOverlay }) => {
  const { setOpenCardId, searchQuery, filterState } = useKanbanUIStore();

  const isMatch = useMemo(() => {
    if (searchQuery && !card.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (filterState.labelIds.length > 0) {
      if (!card.labelIds || !card.labelIds.some(id => filterState.labelIds.includes(id))) {
        return false;
      }
    }
    
    if (filterState.assigneeIds.length > 0) {
      if (!card.assigneeIds || !card.assigneeIds.some(id => filterState.assigneeIds.includes(id))) {
        return false;
      }
    }

    return true;
  }, [searchQuery, filterState, card.title, card.labelIds, card.assigneeIds]);

  const opacityClass = !isOverlay && !isMatch ? 'opacity-30 grayscale' : 'opacity-100';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      cardId: card.id,
      columnId: card.columnId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = () => {
    switch (card.priority) {
      case 'low': return 'bg-emerald-400';
      case 'medium': return 'bg-amber-400';
      case 'high': return 'bg-red-400';
      case 'critical': return 'bg-red-600';
      default: return 'bg-transparent';
    }
  };

  if (isDragging && !isOverlay) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="h-24 rounded-md border-2 border-dashed border-blue-400 bg-blue-50/50" 
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`kanban-card group p-3 pointer-events-auto bg-white transition-opacity duration-200 cursor-grab ${
        isOverlay ? 'is-drag-overlay' : ''
      } ${opacityClass}`}
    >
      {/* Quick Actions (Hover) */}
      {!isOverlay && onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-red-50 text-red-500 rounded hover:bg-red-100 transition-all z-10"
          title="Delete Card"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
        </button>
      )}

      {/* Cover Color */}
      {card.coverColor && (
        <div 
          className="absolute top-0 left-0 right-0 h-2 rounded-t-md opacity-80" 
          style={{ backgroundColor: card.coverColor }}
        />
      )}

      {/* Left Edge Column Color Indicator */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md opacity-80" 
        style={{ backgroundColor: columnColor || '#CBD5E1' }}
      />
      
      {card.labelIds?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labelIds.map(labelId => {
            const label = (boardLabels || []).find(l => l.id === labelId);
            if (!label) return null;
            return (
              <span 
                key={label.id}
                className="px-2 py-0.5 rounded text-[10px] font-medium text-white"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </span>
            );
          })}
        </div>
      )}

      <h4 className="text-sm font-medium text-gray-800 leading-snug break-words mb-2 line-clamp-3">
        {card.title}
      </h4>

      {card.description && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Milestones and Dependencies Badges */}
      {(card.isMilestone || (card.dependencies && card.dependencies.length > 0)) && (
        <div className="flex gap-2 mb-2">
          {card.isMilestone && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100" title="Milestone">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 12l10 10 10-10L12 2z"/></svg>
              Milestone
            </span>
          )}
          {card.dependencies && card.dependencies.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200" title="Dependencies">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              {card.dependencies.length} Linked
            </span>
          )}
        </div>
      )}

      {/* Editable Dates */}
      <div 
        className="flex items-center gap-1 mb-2 w-max"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center bg-gray-50 hover:bg-gray-100 rounded px-1.5 py-0.5 border border-gray-200 transition-colors">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mr-1"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <input
            type="date"
            className="bg-transparent text-[10px] text-gray-600 font-medium outline-none cursor-pointer w-[76px] p-0"
            value={card.startDate || ''}
            onChange={(e) => {
               if (onUpdateCard) onUpdateCard(card.id, { startDate: e.target.value });
            }}
            title="Start Date"
          />
          <span className="text-gray-400 mx-0.5 text-[10px]">-</span>
          <input
            type="date"
            className="bg-transparent text-[10px] text-gray-600 font-medium outline-none cursor-pointer w-[76px] p-0"
            value={card.dueDate || ''}
            onChange={(e) => {
               if (onUpdateCard) onUpdateCard(card.id, { dueDate: e.target.value });
            }}
            title="Due Date"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">#{card.number}</span>
          
          {card.commentCount > 0 && (
            <span className="flex items-center gap-0.5" title="Comments">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              {card.commentCount}
            </span>
          )}

          {card.estimationPoints !== undefined && (
            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-bold" title="Points">
              {card.estimationPoints}
            </span>
          )}
          {card.checklists?.length > 0 && (
            <span className="flex items-center gap-1" title="Checklist">
              ✓ {card.checklists.reduce((acc, cl) => acc + cl.items.filter(i => i.isCompleted).length, 0)}/
              {card.checklists.reduce((acc, cl) => acc + cl.items.length, 0)}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {card.assigneeIds?.length > 0 && (
            <div className="flex -space-x-1">
              {card.assigneeIds.slice(0, 3).map(id => {
                const user = MOCK_USERS.find(u => u.id === id);
                if (!user) return null;
                return (
                  <div 
                    key={id}
                    className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: user.color }}
                    title={user.name}
                  >
                    {user.initials}
                  </div>
                );
              })}
              {card.assigneeIds.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[9px] font-bold text-gray-600 shadow-sm">
                  +{card.assigneeIds.length - 3}
                </div>
              )}
            </div>
          )}
          
          {card.priority && card.priority !== 'none' && (
            <div 
              className={`w-2.5 h-2.5 rounded-full shadow-sm ${getPriorityColor()}`} 
              title={`Priority: ${card.priority}`}
            />
          )}
        </div>
      </div>
      </div>
  );
};
