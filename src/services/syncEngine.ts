import { CanvasElement } from '../types';
import elementService from './elementService';
import useUiStore from '../store/uiStore';

interface SyncOptions {
  wait: number;
  maxWait: number;
}

class SyncEngine {
  private pendingUpdates: Map<string, Partial<CanvasElement>> = new Map();
  private pendingAdds: Map<string, CanvasElement> = new Map();
  private pendingDeletes: Set<string> = new Set();
  
  private lockedElements: Set<string> = new Set();
  private lockedTimeouts: Map<string, number> = new Map();
  
  private waitTimeout: number | null = null;
  private maxWaitTimeout: number | null = null;
  
  private wait: number;
  private maxWait: number;
  
  private currentBoardId: string | null = null;

  constructor(options: SyncOptions = { wait: 300, maxWait: 2000 }) {
    this.wait = options.wait;
    this.maxWait = options.maxWait;

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }

  setBoardId(boardId: string | null) {
    if (this.currentBoardId !== boardId) {
      this.flush(); // flush before changing board
      this.currentBoardId = boardId;
    }
  }

  // Check if an element is currently locked by local edits
  isLocked(elementId: string): boolean {
    return this.lockedElements.has(elementId);
  }

  private lockElement(elementId: string) {
    this.lockedElements.add(elementId);
    
    // Safety timeout to unlock an element if flush somehow fails or is delayed indefinitely
    if (this.lockedTimeouts.has(elementId)) {
      window.clearTimeout(this.lockedTimeouts.get(elementId));
    }
    this.lockedTimeouts.set(elementId, window.setTimeout(() => {
      this.lockedElements.delete(elementId);
      this.lockedTimeouts.delete(elementId);
    }, 5000));
  }
  
  private unlockElements(elementIds: string[]) {
    // We delay unlocking slightly to ensure the round-trip from Firebase doesn't rubber-band
    setTimeout(() => {
      elementIds.forEach(id => {
        this.lockedElements.delete(id);
        if (this.lockedTimeouts.has(id)) {
          window.clearTimeout(this.lockedTimeouts.get(id)!);
          this.lockedTimeouts.delete(id);
        }
      });
    }, 500); // 500ms safety buffer
  }

  queueAdd(element: CanvasElement) {
    this.lockElement(element.id);
    this.pendingDeletes.delete(element.id);
    this.pendingAdds.set(element.id, element);
    useUiStore.getState().setSyncStatus('saving');
    this.scheduleFlush();
  }

  queueUpdate(elementId: string, payload: Partial<CanvasElement>) {
    this.lockElement(elementId);
    
    // If it's a pending add, just update the add payload
    if (this.pendingAdds.has(elementId)) {
      const existing = this.pendingAdds.get(elementId)!;
      this.pendingAdds.set(elementId, { ...existing, ...payload } as CanvasElement);
    } else {
      const existing = this.pendingUpdates.get(elementId) || {};
      this.pendingUpdates.set(elementId, { ...existing, ...payload });
    }
    
    useUiStore.getState().setSyncStatus('saving');
    this.scheduleFlush();
  }

  queueDelete(elementId: string) {
    this.lockElement(elementId);
    this.pendingAdds.delete(elementId);
    this.pendingUpdates.delete(elementId);
    this.pendingDeletes.add(elementId);
    useUiStore.getState().setSyncStatus('saving');
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.waitTimeout !== null) {
      window.clearTimeout(this.waitTimeout);
    }
    
    this.waitTimeout = window.setTimeout(() => {
      this.flush();
    }, this.wait);

    if (this.maxWaitTimeout === null) {
      this.maxWaitTimeout = window.setTimeout(() => {
        this.flush();
      }, this.maxWait);
    }
  }

  flush() {
    if (this.waitTimeout !== null) {
      window.clearTimeout(this.waitTimeout);
      this.waitTimeout = null;
    }
    if (this.maxWaitTimeout !== null) {
      window.clearTimeout(this.maxWaitTimeout);
      this.maxWaitTimeout = null;
    }

    if (!this.currentBoardId) {
      this.pendingAdds.clear();
      this.pendingUpdates.clear();
      this.pendingDeletes.clear();
      return;
    }

    const updatesMap: Record<string, any> = {};
    const flushedIds: string[] = [];

    // Process Adds
    for (const [id, element] of this.pendingAdds.entries()) {
      updatesMap[id] = element;
      flushedIds.push(id);
    }

    // Process Updates (flattening keys to avoid overwriting other properties)
    for (const [id, payload] of this.pendingUpdates.entries()) {
      for (const [key, value] of Object.entries(payload)) {
        updatesMap[`${id}/${key}`] = value;
      }
      flushedIds.push(id);
    }

    // Process Deletes
    for (const id of this.pendingDeletes) {
      updatesMap[id] = null; // Setting to null in Firebase RTDB deletes the key
      flushedIds.push(id);
    }

    if (Object.keys(updatesMap).length > 0) {
      elementService.updateMultipleElements(this.currentBoardId, updatesMap)
        .then(() => {
          useUiStore.getState().setSyncStatus('saved');
          setTimeout(() => {
            if (useUiStore.getState().syncStatus === 'saved') {
              useUiStore.getState().setSyncStatus('idle');
            }
          }, 2000);
        })
        .catch(err => {
          console.error("SyncEngine flush error:", err);
          useUiStore.getState().setSyncStatus('idle');
        });
    }

    // Clear queues
    this.pendingAdds.clear();
    this.pendingUpdates.clear();
    this.pendingDeletes.clear();

    if (flushedIds.length > 0) {
      this.unlockElements(flushedIds);
    }
  }
}

export const syncEngine = new SyncEngine();
export default syncEngine;
