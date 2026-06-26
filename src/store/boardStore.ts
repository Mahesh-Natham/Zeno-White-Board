import { create } from 'zustand';
import { Board } from '../types';

interface BoardState {
  boards: Board[];
  selectedWorkspaceId: string | null;
  isLoading: boolean;
  activeBoard: Board | null;
  
  setBoards: (boards: Board[]) => void;
  setSelectedWorkspaceId: (id: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  addBoard: (board: Board) => void;
  removeBoard: (boardId: string) => void;
  updateBoardInList: (boardId: string, data: Partial<Board>) => void;
  setActiveBoard: (board: Board | null) => void;
  fetchBoard: (boardId: string) => Promise<Board>;
}

const useBoardStore = create<BoardState>((set) => ({
  boards: [],
  selectedWorkspaceId: null,
  isLoading: true,
  
  setBoards: (boards) => set({ boards, isLoading: false }),
  setSelectedWorkspaceId: (id) => set({ selectedWorkspaceId: id }),
  setLoading: (isLoading) => set({ isLoading }),
  
  addBoard: (board) => set((state) => ({ 
    boards: [board, ...state.boards] 
  })),
  
  removeBoard: (boardId) => set((state) => ({ 
    boards: state.boards.filter(b => b.id !== boardId) 
  })),
  
  updateBoardInList: (boardId, data) => set((state) => ({
    boards: state.boards.map(b => 
      b.id === boardId ? { ...b, ...data } : b
    )
  })),

  activeBoard: null,
  setActiveBoard: (board) => set({ activeBoard: board }),
  
  fetchBoard: async (boardId) => {
    // Dynamically import to avoid circular dependencies if any
    const { getBoard } = await import('../services/boardService');
    const board = await getBoard(boardId);
    if (!board) throw new Error("Board not found");
    set({ activeBoard: board as Board });
    return board as Board;
  },
}));

export default useBoardStore;
