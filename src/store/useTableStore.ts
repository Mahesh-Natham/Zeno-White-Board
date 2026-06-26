import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Column, Row, SortRule, FilterRule } from '../types/table-types';
import { arrayMove } from '@dnd-kit/sortable';

interface TableState {
  columns: Column[];
  rows: Row[];
  sorts: SortRule[];
  filters: FilterRule[];
  
  // Actions
  setColumns: (columns: Column[]) => void;
  setRows: (rows: Row[]) => void;
  /**
   * Updates a specific cell's value within the table.
   * 
   * @param rowId - The unique identifier of the row.
   * @param columnId - The identifier of the column to update.
   * @param value - The new value to set.
   */
  updateCell: (rowId: string, columnId: string, value: unknown) => void;
  addRow: () => void;
  deleteRow: (rowId: string) => void;
  moveRow: (activeId: string, overId: string) => void;
  moveColumn: (activeId: string, overId: string) => void;
  resizeColumn: (columnId: string, width: number) => void;
  toggleColumnVisibility: (columnId: string) => void;
  setSort: (columnId: string, direction: 'asc' | 'desc' | null) => void;
}

const initialColumns: Column[] = [
  { id: 'title', label: 'Title', type: 'text', width: 250, visible: true },
  { id: 'description', label: 'Description', type: 'text', width: 200, visible: true },
  { id: 'status', label: 'Status', type: 'status', width: 150, options: ['To Do', 'In Progress', 'Done'], visible: true },
  { id: 'assignee', label: 'Assignee', type: 'assignee', width: 150, visible: true },
  { id: 'startDate', label: 'Start Date', type: 'date', width: 150, visible: true },
  { id: 'endDate', label: 'End Date', type: 'date', width: 150, visible: true },
  { id: 'estimate', label: 'Estimate', type: 'number', width: 120, visible: true },
  { id: 'priority', label: 'Priority', type: 'status', width: 120, options: ['Low', 'Medium', 'High'], visible: true },
];

const initialRows: Row[] = Array.from({ length: 5 }).map((_, i) => ({
  id: `row-${i + 1}`,
  cells: {
    title: { value: i === 0 ? 'Implement Table' : `Task ${i + 1}` },
    description: { value: '' },
    status: { value: i === 0 ? 'In Progress' : 'To Do' },
    assignee: { value: 'John Doe' },
    startDate: { value: new Date().toISOString() },
    endDate: { value: '' },
    estimate: { value: i === 0 ? 5 : 0 },
    priority: { value: i === 0 ? 'High' : 'Medium' },
  }
}));

export const useTableStore = create<TableState>()(
  immer((set) => ({
    columns: initialColumns,
    rows: initialRows,
    sorts: [],
    filters: [],

    setColumns: (columns) => set((state) => { state.columns = columns; }),
    setRows: (rows) => set((state) => { state.rows = rows; }),
    
    updateCell: (rowId, columnId, value) => set((state) => {
      const row = state.rows.find(r => r.id === rowId);
      if (row && row.cells[columnId]) {
        row.cells[columnId].value = value;
      }
    }),

    addRow: () => set((state) => {
      const newId = `row-${Date.now()}`;
      const newCells: Record<string, any> = {};
      state.columns.forEach(col => {
        newCells[col.id] = { value: '' };
      });
      state.rows.push({ id: newId, cells: newCells });
    }),

    deleteRow: (rowId) => set((state) => {
      state.rows = state.rows.filter(row => row.id !== rowId);
    }),

    moveRow: (activeId, overId) => set((state) => {
      const oldIndex = state.rows.findIndex(r => r.id === activeId);
      const newIndex = state.rows.findIndex(r => r.id === overId);
      state.rows = arrayMove(state.rows, oldIndex, newIndex);
    }),

    moveColumn: (activeId, overId) => set((state) => {
      const oldIndex = state.columns.findIndex(c => c.id === activeId);
      const newIndex = state.columns.findIndex(c => c.id === overId);
      state.columns = arrayMove(state.columns, oldIndex, newIndex);
    }),

    resizeColumn: (columnId, width) => set((state) => {
      const col = state.columns.find(c => c.id === columnId);
      if (col) {
        col.width = Math.max(80, width);
      }
    }),

    toggleColumnVisibility: (columnId) => set((state) => {
      const col = state.columns.find(c => c.id === columnId);
      if (col) {
        col.visible = !col.visible;
      }
    }),

    setSort: (columnId, direction) => set((state) => {
      const existingIndex = state.sorts.findIndex(s => s.columnId === columnId);
      
      if (!direction) {
        if (existingIndex !== -1) {
          state.sorts.splice(existingIndex, 1);
        }
      } else if (existingIndex !== -1) {
        state.sorts[existingIndex].direction = direction;
      } else {
        state.sorts.push({ columnId, direction });
      }
    }),
  }))
);
