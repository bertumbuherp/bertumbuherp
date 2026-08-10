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
  addCustomEvent: (event: CustomEvent) => void;
  updateCustomEvent: (event: CustomEvent) => void;
  deleteCustomEvent: (id: string) => void;
}

export const useCalendarStore = create<CalendarStoreState>()(
  persist(
    (set) => ({
      customEvents: [
        // Mock initial events in June 2026 for demonstration
        {
          id: 'evt-mock-1',
          title: 'Evaluasi Kinerja Q2',
          description: 'Rapat evaluasi hasil kinerja masing-masing divisi untuk kuartal kedua.',
          startDate: '2026-06-15',
          startTime: '09:00',
          endDate: '2026-06-15',
          endTime: '10:30',
          assigneeId: 'u4', // PM - Dewi Lestari
          assigneeName: 'Dewi Lestari',
          category: 'meeting',
          color: 'var(--blue)',
          createdBy: 'u1',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'evt-mock-2',
          title: 'Negosiasi Penawaran - Properti Andalan',
          description: 'Membahas detail kontrak kerja sama pengelolaan media sosial selama 6 bulan.',
          startDate: '2026-06-18',
          startTime: '13:00',
          endDate: '2026-06-18',
          endTime: '14:30',
          assigneeId: 'u3', // AE - Andi Firmansyah
          assigneeName: 'Andi Firmansyah',
          category: 'meeting',
          color: 'var(--yellow)',
          createdBy: 'u1',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'evt-mock-3',
          title: 'Review Asset Desain Campaign',
          description: 'Meninjau final draft materi promosi dari tim kreatif.',
          startDate: '2026-06-16',
          startTime: '15:00',
          endDate: '2026-06-16',
          endTime: '16:00',
          assigneeId: 'u7', // Designer - Dimas Prasetyo
          assigneeName: 'Dimas Prasetyo',
          category: 'meeting',
          color: 'var(--violet)',
          createdBy: 'u4',
          createdAt: new Date().toISOString(),
        }
      ],

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
