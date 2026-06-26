import { realtimeDb } from '../config/firebase';
import { ref, set, onValue, off, remove, onDisconnect } from 'firebase/database';

class CollaborationService {
  private cursorListeners: Record<string, () => void> = {};
  private presenceListeners: Record<string, () => void> = {};

  writeCursor(boardId: string, userId: string, x: number, y: number, displayName: string, color: string) {
    if (!boardId || !userId) return;
    const cursorRef = ref(realtimeDb, `boards/${boardId}/cursors/${userId}`);
    set(cursorRef, {
      id: userId,
      x,
      y,
      displayName,
      color,
      timestamp: Date.now()
    }).catch(console.error);
    
    // Auto remove cursor on disconnect
    onDisconnect(cursorRef).remove().catch(console.error);
  }

  subscribeToOtherCursors(boardId: string, currentUserId: string, callback: (others: any[]) => void) {
    if (!boardId) return () => {};
    
    const cursorsRef = ref(realtimeDb, `boards/${boardId}/cursors`);
    
    const listener = onValue(cursorsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      
      const others = Object.keys(data)
        .filter(key => key !== currentUserId)
        .map(key => data[key])
        .filter(cursor => Date.now() - cursor.timestamp < 10000); // Filter stale cursors older than 10s
        
      callback(others);
    });

    this.cursorListeners[boardId] = () => off(cursorsRef, 'value', listener);
    return this.cursorListeners[boardId];
  }

  writePresence(boardId: string, userId: string, displayName: string, color: string) {
    if (!boardId || !userId) return;
    const presenceRef = ref(realtimeDb, `boards/${boardId}/presence/${userId}`);
    
    set(presenceRef, {
      id: userId,
      displayName,
      color,
      lastActive: Date.now()
    }).catch(console.error);
    
    // Remove presence on disconnect
    onDisconnect(presenceRef).remove().catch(console.error);
  }

  subscribeToPresence(boardId: string, callback: (users: any[]) => void) {
    if (!boardId) return () => {};
    
    const presenceRef = ref(realtimeDb, `boards/${boardId}/presence`);
    
    const listener = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      
      const users = Object.values(data);
      callback(users);
    });

    this.presenceListeners[boardId] = () => off(presenceRef, 'value', listener);
    return this.presenceListeners[boardId];
  }

  clearPresence(boardId: string, userId: string) {
    if (!boardId || !userId) return;
    
    // Remove from DB
    remove(ref(realtimeDb, `boards/${boardId}/presence/${userId}`)).catch(console.error);
    remove(ref(realtimeDb, `boards/${boardId}/cursors/${userId}`)).catch(console.error);
    
    // Clean up local listeners
    if (this.cursorListeners[boardId]) {
      this.cursorListeners[boardId]();
      delete this.cursorListeners[boardId];
    }
    if (this.presenceListeners[boardId]) {
      this.presenceListeners[boardId]();
      delete this.presenceListeners[boardId];
    }
  }
}

export const collaborationService = new CollaborationService();
export default collaborationService;
