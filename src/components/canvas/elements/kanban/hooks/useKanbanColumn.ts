import { useState } from 'react';
import { KanbanData, KanbanColumn, KanbanCard } from '../types';
import { calculateKanbanWidth } from '../utils';

interface UseKanbanColumnProps {
  column: KanbanColumn;
  data: KanbanData;
  onUpdateData: (updates: Partial<KanbanData>) => void;
  cardsLength: number;
  groupBy: string;
}

export function useKanbanColumn({ column, data, onUpdateData, cardsLength, groupBy }: UseKanbanColumnProps) {
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.title);
  const [wipLimitInput, setWipLimitInput] = useState(column.wipLimit?.toString() || '');

  const handleAddCard = (positionContext: { cardsInColumn: KanbanCard[] }) => {
    if (!newCardTitle.trim()) {
      setIsAdding(false);
      return;
    }

    const { cardsInColumn } = positionContext;
    const newPosition = cardsInColumn.length > 0 ? cardsInColumn[cardsInColumn.length - 1].position + 1000 : 1000;
    
    const newCard: KanbanCard = {
      id: `card-${Date.now()}`,
      columnId: column.id,
      number: data.nextCardNumber,
      title: newCardTitle.trim(),
      description: '',
      position: newPosition,
      assigneeIds: [],
      labelIds: [],
      priority: 'none',
      checklists: [],
      commentCount: 0,
      attachmentCount: 0,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'currentUser', 
    };

    onUpdateData({
      cards: [...data.cards, newCard],
      nextCardNumber: data.nextCardNumber + 1,
    });
    
    setNewCardTitle('');
    setIsAdding(false);
  };

  const handleUpdateTitle = () => {
    onUpdateData({ columns: data.columns.map(c => c.id === column.id ? { ...c, title: columnTitle } : c) });
    setIsEditingTitle(false);
  };

  const handleToggleCollapse = () => {
    const newColumns = data.columns.map(c => c.id === column.id ? { ...c, isCollapsed: !c.isCollapsed } : c);
    const updates: any = { columns: newColumns };
    if (data.settings?.autoSize !== false) {
      updates._elementWidth = calculateKanbanWidth(newColumns, data.settings, groupBy);
    }
    onUpdateData(updates);
    setIsMenuOpen(false);
  };

  const handleSetWipLimit = () => {
    const limit = parseInt(wipLimitInput);
    onUpdateData({ columns: data.columns.map(c => c.id === column.id ? { ...c, wipLimit: isNaN(limit) ? undefined : limit } : c) });
    setIsMenuOpen(false);
  };

  const handleToggleDone = () => {
    onUpdateData({ columns: data.columns.map(c => c.id === column.id ? { ...c, isDone: !c.isDone } : c) });
    setIsMenuOpen(false);
  };

  const handleDeleteColumn = () => {
    if (window.confirm(`Are you sure you want to delete the column "${column.title}"? All cards in this column will be deleted.`)) {
      const newColumns = data.columns.filter(c => c.id !== column.id);
      const updates: any = {
        columns: newColumns,
        cards: data.cards.filter(c => c.columnId !== column.id)
      };
      if (data.settings?.autoSize !== false) {
        updates._elementWidth = calculateKanbanWidth(newColumns, data.settings, groupBy);
      }
      onUpdateData(updates);
    }
    setIsMenuOpen(false);
  };

  const isWipLimitExceeded = column.wipLimit && cardsLength > column.wipLimit;

  return {
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
  };
}
