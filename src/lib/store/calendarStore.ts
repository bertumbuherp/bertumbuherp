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
      customEvents: [
        // Initial events for demonstration
        {
          id: 'evt-mock-1',
          title: 'Evaluasi Kinerja Q2',
          description: 'Rapat evaluasi hasil kinerja masing-masing divisi untuk kuartal kedua.',
          startDate: '2026-06-15',
          startTime: '09:00',
          endDate: '2026-06-15',
          endTime: '10:30',
          assigneeId: 'u4', // PM
          assigneeName: 'Project Manager',
          category: 'meeting',
          color: 'var(--blue)',
          createdBy: 'u1',
          createdAt: new Date().toISOString(),
        },
      ],

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

