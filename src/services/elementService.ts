import { realtimeDb } from '../config/firebase';
import { ref, set, update, remove, onValue, off } from 'firebase/database';

class ElementService {
  /**
   * Subscribe to elements on a specific board.
   * @param {string} boardId 
   * @param {function} callback 
   * @returns {function} Unsubscribe function
   */
  subscribeToElements(boardId: string, callback: (data: Record<string, any>) => void) {
    if (!boardId) return () => {};
    
    const elementsRef = ref(realtimeDb, `boards/${boardId}/elements`);
    
    const listener = onValue(elementsRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || {});
    });

    return () => {
      off(elementsRef, 'value', listener);
    };
  }

  async createElement(boardId: string, element: any) {
    if (!boardId || !element || !element.id) return;
    
    const elementRef = ref(realtimeDb, `boards/${boardId}/elements/${element.id}`);
    try {
      await set(elementRef, element);
    } catch (error) {
      console.error('Error creating element:', error);
    }
  }

  async updateElement(boardId: string, elementId: string, changes: any) {
    if (!boardId || !elementId) return;
    
    const elementRef = ref(realtimeDb, `boards/${boardId}/elements/${elementId}`);
    try {
      await update(elementRef, changes);
    } catch (error) {
      console.error('Error updating element:', error);
    }
  }

  async deleteElement(boardId: string, elementId: string) {
    if (!boardId || !elementId) return;
    
    const elementRef = ref(realtimeDb, `boards/${boardId}/elements/${elementId}`);
    try {
      await remove(elementRef);
    } catch (error) {
      console.error('Error deleting element:', error);
    }
  }

  async deleteAllElements(boardId: string) {
    if (!boardId) return;
    
    const elementsRef = ref(realtimeDb, `boards/${boardId}/elements`);
    try {
      await remove(elementsRef);
    } catch (error) {
      console.error('Error deleting all elements:', error);
    }
  }

  async updateMultipleElements(boardId: string, updatesMap: Record<string, any>) {
    if (!boardId || !updatesMap || Object.keys(updatesMap).length === 0) return;
    
    const boardRef = ref(realtimeDb, `boards/${boardId}/elements`);
    try {
      await update(boardRef, updatesMap);
    } catch (error) {
      console.error('Error updating multiple elements:', error);
    }
  }
}

export const elementService = new ElementService();
export default elementService;
