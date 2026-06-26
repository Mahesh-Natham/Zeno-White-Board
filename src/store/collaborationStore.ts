import { create } from 'zustand';

interface OnlineUser {
  uid: string;
  displayName?: string;
  color?: string;
}

interface Cursor {
  uid: string;
  x: number;
  y: number;
}

interface CollaborationState {
  onlineUsers: OnlineUser[];
  otherCursors: Record<string, Cursor>;
  setOnlineUsers: (users: OnlineUser[]) => void;
  setOtherCursors: (cursors: Record<string, Cursor>) => void;
}

const useCollaborationStore = create<CollaborationState>((set) => ({
  onlineUsers: [],
  otherCursors: {},
  
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  setOtherCursors: (cursors) => set({ otherCursors: cursors }),
}));

export default useCollaborationStore;
