import { create } from 'zustand';
import { CalendarEvent } from '../types';

interface CalendarState {
  events: CalendarEvent[];
  isLoading: boolean;
  setEvents: (events: CalendarEvent[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  events: [],
  isLoading: true,
  setEvents: (events) => set({ events, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
