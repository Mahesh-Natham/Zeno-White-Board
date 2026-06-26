import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CanvasElement, Viewport } from '../types';
import elementService from '../services/elementService';
import syncEngine from '../services/syncEngine';
const UNDO_STACK_LIMIT = 50;

export type ActionType = 'ADD' | 'DELETE' | 'UPDATE';

export interface Action {
  type: ActionType;
  elements?: CanvasElement[];
  updates?: Array<{ id: string; oldProps: Partial<CanvasElement>; newProps: Partial<CanvasElement> }>;
}

interface CanvasState {
  boardId: string | null;
  setBoardId: (boardId: string | null) => void;
  elements: Record<string, CanvasElement>;
  selectedIds: string[];
  viewport: Viewport;
  snapToGrid: boolean;
  toggleSnapToGrid: () => void;
  
  isTransforming: boolean;
  setIsTransforming: (isTransforming: boolean) => void;
  
  clickShortcuts: {
    leftDoubleClick: string;
    rightTripleClick: string;
  };
  updateClickShortcuts: (updates: Partial<CanvasState['clickShortcuts']>) => void;
  
  history: Action[];
  historyStep: number;

  setViewport: (viewportOrUpdater: Viewport | ((vp: Viewport) => Viewport)) => void;
  setSelectedIds: (ids: string[]) => void;
  clearSelection: () => void;
  setElements: (elements: Record<string, CanvasElement>) => void;

  performAction: (action: Action, skipHistory?: boolean) => void;

  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, newProps: Partial<CanvasElement>) => void;
  removeElements: (ids: string[]) => void;
  moveToFront: (id: string) => void;
  moveToBack: (id: string) => void;
  undo: () => void;
  redo: () => void;
}

const useCanvasStore = create<CanvasState>()(
  immer((set, get) => ({
    boardId: null,
    setBoardId: (boardId) => set((state) => { 
      state.boardId = boardId; 
      syncEngine.setBoardId(boardId);
    }),
    elements: {},
    selectedIds: [],
    viewport: { x: 0, y: 0, scale: 1 },
    snapToGrid: false,
    toggleSnapToGrid: () => set((state) => { state.snapToGrid = !state.snapToGrid; }),
    
    isTransforming: false,
    setIsTransforming: (isTransforming) => set((state) => { state.isTransforming = isTransforming; }),
    
    clickShortcuts: {
      leftDoubleClick: 'text',
      rightTripleClick: 'sticky_note'
    },
    updateClickShortcuts: (updates) => set((state) => {
      state.clickShortcuts = { ...state.clickShortcuts, ...updates };
    }),
    
    history: [],
    historyStep: -1,

    setViewport: (viewportOrUpdater) => set((state) => {
      state.viewport = typeof viewportOrUpdater === 'function' 
        ? viewportOrUpdater(state.viewport) 
        : viewportOrUpdater;
    }),
    setSelectedIds: (ids) => set((state) => { state.selectedIds = ids; }),
    clearSelection: () => set((state) => { state.selectedIds = []; }),
    setElements: (elements) => set((state) => { state.elements = elements; }),

    performAction: (action, skipHistory = false) => {
      const state = get();
      const boardId = state.boardId;

      if (boardId) {
        try {
          if (action.type === 'ADD' && action.elements) {
            action.elements.forEach(el => syncEngine.queueAdd(el));
          } else if (action.type === 'DELETE' && action.elements) {
            action.elements.forEach(el => syncEngine.queueDelete(el.id));
          } else if (action.type === 'UPDATE' && action.updates) {
            action.updates.forEach(update => syncEngine.queueUpdate(update.id, update.newProps));
          }
        } catch (error) {
          console.error('Error syncing to Firebase:', error);
        }
      }

      set((state) => {
        if (action.type === 'ADD' && action.elements) {
          action.elements.forEach(el => {
            state.elements[el.id] = el;
          });
        } else if (action.type === 'DELETE' && action.elements) {
          action.elements.forEach(el => {
            delete state.elements[el.id];
          });
        } else if (action.type === 'UPDATE' && action.updates) {
          action.updates.forEach(update => {
            if (!state.elements[update.id]) return;
            Object.assign(state.elements[update.id], update.newProps);
          });
        }

        if (!skipHistory) {
          state.history = state.history.slice(0, state.historyStep + 1);
          state.history.push(action);
          if (state.history.length > UNDO_STACK_LIMIT) {
            state.history.shift();
          } else {
            state.historyStep++;
          }
        }
      });
    },

    addElement: (element) => get().performAction({ type: 'ADD', elements: [element] }),
    
    updateElement: (id, newProps) => {
      const el = get().elements[id];
      if (!el) return;
      
      const oldProps: Partial<CanvasElement> = {};
      const typedKeys = Object.keys(newProps) as Array<keyof CanvasElement>;
      
      typedKeys.forEach(key => { 
        if (el[key] !== undefined) {
          oldProps[key] = el[key] as any; 
        }
      });
      
      get().performAction({ type: 'UPDATE', updates: [{ id, oldProps, newProps }] });
    },

    removeElements: (ids) => {
      const elementsToRemove = ids.map(id => get().elements[id]).filter(Boolean) as CanvasElement[];
      if (elementsToRemove.length > 0) {
        get().performAction({ type: 'DELETE', elements: elementsToRemove });
      }
      set((state) => { state.selectedIds = []; });
    },

    moveToFront: (id) => {
      const el = get().elements[id];
      if (!el) return;
      const maxZ = Math.max(0, ...Object.values(get().elements).map(e => e.zIndex || 0));
      get().updateElement(id, { zIndex: maxZ + 1 });
    },

    moveToBack: (id) => {
      const el = get().elements[id];
      if (!el) return;
      const minZ = Math.min(0, ...Object.values(get().elements).map(e => e.zIndex || 0));
      get().updateElement(id, { zIndex: minZ - 1 });
    },

    undo: () => {
      const state = get();
      if (state.historyStep < 0) return;
      
      const action = state.history[state.historyStep];
      const inverseAction: Action = { type: action.type };
      
      if (action.type === 'ADD') {
        inverseAction.type = 'DELETE';
        inverseAction.elements = action.elements;
      } else if (action.type === 'DELETE') {
        inverseAction.type = 'ADD';
        inverseAction.elements = action.elements;
      } else if (action.type === 'UPDATE' && action.updates) {
        inverseAction.type = 'UPDATE';
        inverseAction.updates = action.updates.map(u => ({
          id: u.id,
          oldProps: u.newProps,
          newProps: u.oldProps
        }));
      }

      state.performAction(inverseAction, true);
      set((s) => { 
        s.historyStep--; 
        s.selectedIds = []; 
      });
    },

    redo: () => {
      const state = get();
      if (state.historyStep >= state.history.length - 1) return;
      
      const nextStep = state.historyStep + 1;
      const action = state.history[nextStep];
      
      state.performAction(action, true);
      set((s) => { 
        s.historyStep = nextStep; 
        s.selectedIds = []; 
      });
    },
  }))
);

export default useCanvasStore;
