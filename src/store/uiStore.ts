import { create } from 'zustand';

interface UiState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  dragOffsets: Record<string, { x: number, y: number }>;
  setDragOffsets: (offsets: Record<string, { x: number, y: number }>) => void;
  clearDragOffsets: () => void;
  syncStatus: 'idle' | 'saving' | 'saved';
  setSyncStatus: (status: 'idle' | 'saving' | 'saved') => void;
  embedModalOpen: boolean;
  embedCoordinates: { x: number, y: number } | null;
  openEmbedModal: (coords: { x: number, y: number }) => void;
  closeEmbedModal: () => void;
  maximizedElementId: string | null;
  toggleMaximize: (id: string) => void;
}

const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  dragOffsets: {},
  setDragOffsets: (offsets) => set({ dragOffsets: offsets }),
  clearDragOffsets: () => set({ dragOffsets: {} }),
  syncStatus: 'idle',
  setSyncStatus: (status) => set({ syncStatus: status }),
  embedModalOpen: false,
  embedCoordinates: null,
  openEmbedModal: (coords) => set({ embedModalOpen: true, embedCoordinates: coords }),
  closeEmbedModal: () => set({ embedModalOpen: false, embedCoordinates: null }),
  maximizedElementId: null,
  toggleMaximize: (id) => set((state) => ({ maximizedElementId: state.maximizedElementId === id ? null : id })),
}));

export default useUiStore;
