import React, { createContext, useContext, useCallback } from 'react';
import { Column, Row, SortRule, FilterRule } from '../../../types/table-types';
import { arrayMove } from '@dnd-kit/sortable';

export interface TableData {
  id?: string;
  columns: Column[];
  rows: Row[];
  sorts: SortRule[];
  filters: FilterRule[];
  title?: string;
  settings?: {
    autoSize?: boolean;
  };
}

interface TableContextType extends TableData {
  searchQuery: string;
  hideCompleted: boolean;
  setHideCompleted: (hide: boolean | ((prev: boolean) => boolean)) => void;
  activeFilter: string | null;
  setActiveFilter: (f: string | null) => void;
  sortMode: string;
  setSortMode: (s: string) => void;
  updateData: (updates: Partial<TableData>) => void;
  moveRow: (activeId: string, overId: string) => void;
  addRow: () => void;
  updateCell: (rowId: string, columnId: string, value: any) => void;
  toggleColumnVisibility: (columnId: string) => void;
  updateColumnWidth: (columnId: string, width: number) => void;
  updateColumnLabel: (columnId: string, label: string) => void;
  deleteColumn: (columnId: string) => void;
  addColumn: () => void;
}

const TableContext = createContext<TableContextType | null>(null);

export const useTableContext = () => {
  const ctx = useContext(TableContext);
  if (!ctx) throw new Error("useTableContext must be used within a TableProvider");
  return ctx;
};

export const TableProvider: React.FC<{ data: TableData; onUpdateData: (updates: Partial<TableData>) => void; children: React.ReactNode }> = ({ data, onUpdateData, children }) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [hideCompleted, setHideCompleted] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);
  const [sortMode, setSortMode] = React.useState<string>('manual');

  const moveRow = useCallback((activeId: string, overId: string) => {
    const oldIndex = data.rows.findIndex(r => r.id === activeId);
    const newIndex = data.rows.findIndex(r => r.id === overId);
    if (oldIndex !== -1 && newIndex !== -1) {
      onUpdateData({ rows: arrayMove(data.rows, oldIndex, newIndex) });
    }
  }, [data.rows, onUpdateData]);

  const addRow = useCallback(() => {
    const newRow: Row = {
      id: `row-${Date.now()}`,
      cells: {}
    };
    onUpdateData({ rows: [...data.rows, newRow] });
  }, [data.rows, onUpdateData]);

  const addColumn = useCallback(() => {
    const newColumn: Column = {
      id: `col-${Date.now()}`,
      label: 'New Column',
      type: 'text',
      width: 150,
      visible: true
    };
    onUpdateData({ columns: [...data.columns, newColumn] });
  }, [data.columns, onUpdateData]);

  const updateCell = useCallback((rowId: string, columnId: string, value: any) => {
    const newRows = data.rows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          cells: {
            ...row.cells,
            [columnId]: { ...row.cells[columnId], value }
          }
        };
      }
      return row;
    });
    onUpdateData({ rows: newRows });
  }, [data.rows, onUpdateData]);

  const toggleColumnVisibility = useCallback((columnId: string) => {
    const newColumns = data.columns.map(col => {
      if (col.id === columnId) return { ...col, visible: !col.visible };
      return col;
    });
    onUpdateData({ columns: newColumns });
  }, [data.columns, onUpdateData]);

  const updateColumnWidth = useCallback((columnId: string, width: number) => {
    const newColumns = data.columns.map(col => {
      if (col.id === columnId) return { ...col, width };
      return col;
    });
    onUpdateData({ columns: newColumns });
  }, [data.columns, onUpdateData]);

  const updateColumnLabel = useCallback((columnId: string, label: string) => {
    const newColumns = data.columns.map(col => {
      if (col.id === columnId) return { ...col, label };
      return col;
    });
    onUpdateData({ columns: newColumns });
  }, [data.columns, onUpdateData]);

  const deleteColumn = useCallback((columnId: string) => {
    // Only allow deletion if there's more than one column left
    if (data.columns.length <= 1) return;
    const newColumns = data.columns.filter(col => col.id !== columnId);
    onUpdateData({ columns: newColumns });
  }, [data.columns, onUpdateData]);

  return (
    <TableContext.Provider value={{
      ...data,
      searchQuery,
      setSearchQuery,
      hideCompleted,
      setHideCompleted,
      activeFilter,
      setActiveFilter,
      sortMode,
      setSortMode,
      updateData: onUpdateData,
      moveRow,
      addRow,
      updateCell,
      toggleColumnVisibility,
      updateColumnWidth,
      updateColumnLabel,
      deleteColumn,
      addColumn
    }}>
      {children}
    </TableContext.Provider>
  );
};
