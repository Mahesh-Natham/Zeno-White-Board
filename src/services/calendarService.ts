import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { CalendarEvent } from '../types';

export const createEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
  try {
    const id = uuidv4();
    const eventRef = doc(db, 'calendar_events', id);
    await setDoc(eventRef, {
      id,
      ...eventData,
      createdAt: serverTimestamp()
    });
    return id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
    await deleteDoc(doc(db, 'calendar_events', eventId));
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

export const getEventsListener = (workspaceId: string, callback: (events: CalendarEvent[]) => void) => {
  const q = query(
    collection(db, 'calendar_events'),
    where('workspaceId', '==', workspaceId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
      } as CalendarEvent;
    });
    callback(events);
  });
};
