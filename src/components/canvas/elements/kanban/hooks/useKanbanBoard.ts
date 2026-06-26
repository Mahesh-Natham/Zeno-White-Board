import { useState } from 'react';
import { KanbanData, KanbanColumn } from '../types';
import { calculateKanbanWidth } from '../utils';

interface UseKanbanBoardProps {
  data: KanbanData;
  onUpdateData: (updates: Partial<KanbanData>) => void;
  columns: KanbanColumn[];
  groupBy: string;
}

export function useKanbanBoard({ data, onUpdateData, columns, groupBy }: UseKanbanBoardProps) {
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    const newColumn: KanbanColumn = {
      id: `col-${Date.now()}`,
      title: newColumnTitle.trim(),
      position: columns.length > 0 ? columns[columns.length - 1].position + 1000 : 1000,
      color: '#CBD5E1',
      isDone: false,
      isCollapsed: false,
    };
    
    const newColumns = [...data.columns, newColumn];
    const updates: any = { columns: newColumns };
    
    if (data.settings?.autoSize !== false) {
      updates._elementWidth = calculateKanbanWidth(newColumns, data.settings, groupBy);
    }
    
    onUpdateData(updates);
    setNewColumnTitle('');
    setIsAddingColumn(false);
  };

  const handleToggleAutoSize = () => {
    const newAutoSize = data.settings?.autoSize === false ? true : false;
    let newWidth = undefined;
    if (newAutoSize) {
      newWidth = calculateKanbanWidth(columns, data.settings, groupBy);
    }
    onUpdateData({ settings: { ...data.settings, autoSize: newAutoSize }, _elementWidth: newWidth } as any);
  };

  return {
    newColumnTitle,
    setNewColumnTitle,
    isAddingColumn,
    setIsAddingColumn,
    handleAddColumn,
    handleToggleAutoSize,
  };
}
