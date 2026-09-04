import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CustomEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endDate: string; // YYYY-MM-DD
  endTime?: string; // HH:MM
  assigneeId?: string;
  assigneeName?: string;
  category: 'meeting' | 'task' | 'milestone' | 'general';
  color: string;
  createdBy: string;
  createdAt: string;
}

interface CalendarStoreState {
  customEvents: CustomEvent[];
  clearMockData: () => void;
  addCustomEvent: (event: CustomEvent) => void;
  updateCustomEvent: (event: CustomEvent) => void;
  deleteCustomEvent: (id: string) => void;
}

export const useCalendarStore = create<CalendarStoreState>()(
  persist(
    (set) => ({
      customEvents: [],

      clearMockData: () => set({ customEvents: [] }),

      addCustomEvent: (event) =>
        set((state) => ({ customEvents: [...state.customEvents, event] })),

      updateCustomEvent: (updatedEvent) =>
        set((state) => ({
          customEvents: state.customEvents.map((event) =>
            event.id === updatedEvent.id ? updatedEvent : event
          ),
        })),

      deleteCustomEvent: (id) =>
        set((state) => ({
          customEvents: state.customEvents.filter((event) => event.id !== id),
        })),
    }),
    {
      name: 'bertumbuh-calendar-storage',
    }
  )
);

