import { create } from 'zustand';

export interface FilterState {
  labelIds: string[];
  assigneeIds: string[];
  dueDate: 'overdue' | 'due-soon' | 'no-date' | null;
  priority: ('none' | 'low' | 'medium' | 'high' | 'critical')[];
  showArchived: boolean;
}

interface KanbanUIState {
  // Navigation & Detail View
  openCardId: string | null;
  setOpenCardId: (id: string | null) => void;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  filterState: FilterState;
  setFilterState: (filters: Partial<FilterState>) => void;
  toggleFilter: (type: keyof FilterState, value: string) => void;
  clearFilters: () => void;

  // Grouping (Swimlanes)
  groupBy: 'none' | 'assignee' | 'priority' | 'label' | 'lane';
  setGroupBy: (groupBy: KanbanUIState['groupBy']) => void;
  
  collapsedSwimlanes: string[];
  toggleSwimlaneCollapse: (id: string) => void;

  // Drag & Drop State
  draggingCardId: string | null;
  setDraggingCardId: (id: string | null) => void;
  
  draggingColumnId: string | null;
  setDraggingColumnId: (id: string | null) => void;

  // Inline Editing
  editingColumnId: string | null;
  setEditingColumnId: (id: string | null) => void;

  addingCardInColumnId: string | null;
  setAddingCardInColumnId: (id: string | null) => void;
}

const defaultFilterState: FilterState = {
  labelIds: [],
  assigneeIds: [],
  dueDate: null,
  priority: [],
  showArchived: false,
};

export const useKanbanUIStore = create<KanbanUIState>((set) => ({
  openCardId: null,
  setOpenCardId: (id) => set({ openCardId: id }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  filterState: defaultFilterState,
  setFilterState: (filters) => 
    set((state) => ({ filterState: { ...state.filterState, ...filters } })),
  toggleFilter: (type, value) => set((state) => {
    const current = state.filterState[type] as string[];
    const updated = current.includes(value) 
      ? current.filter((v) => v !== value)
      : [...current, value];
      
    return {
      filterState: {
        ...state.filterState,
        [type]: updated
      }
    };
  }),
  clearFilters: () => set({ filterState: defaultFilterState }),

  groupBy: 'none',
  setGroupBy: (groupBy) => set({ groupBy }),

  collapsedSwimlanes: [],
  toggleSwimlaneCollapse: (id) => set((state) => ({
    collapsedSwimlanes: state.collapsedSwimlanes.includes(id)
      ? state.collapsedSwimlanes.filter(sId => sId !== id)
      : [...state.collapsedSwimlanes, id]
  })),

  draggingCardId: null,
  setDraggingCardId: (id) => set({ draggingCardId: id }),

  draggingColumnId: null,
  setDraggingColumnId: (id) => set({ draggingColumnId: id }),

  editingColumnId: null,
  setEditingColumnId: (id) => set({ editingColumnId: id }),

  addingCardInColumnId: null,
  setAddingCardInColumnId: (id) => set({ addingCardInColumnId: id }),
}));
