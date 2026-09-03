import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role } from '@/lib/types';

export type SystemModule = 'AUTH' | 'USER_MGMT' | 'CRM' | 'PM' | 'FINANCE' | 'HR' | 'SYSTEM';

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  module: SystemModule;
  action: string;
  details: string;
  ipAddress?: string;
}

interface ActivityLogStoreState {
  logs: ActivityLog[];
  addLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

const initialLogs: ActivityLog[] = [
  {
    id: 'log-101',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    userId: 'u1',
    userName: 'Reza Pratama',
    userRole: 'owner',
    module: 'AUTH',
    action: 'LOGIN',
    details: 'Pengguna berhasil masuk ke Portal Internal Bertumbuh ERP.',
    ipAddress: '192.168.1.10'
  },
  {
    id: 'log-102',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    userId: 'u3',
    userName: 'Andi Firmansyah',
    userRole: 'ae',
    module: 'CRM',
    action: 'CONVERT_QUOTATION',
    details: 'Mengonversi Quotation QTO-2026-06-001 ke Deal & Auto-Onboard Proyek PM.',
    ipAddress: '192.168.1.15'
  },
  {
    id: 'log-103',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userId: 'u4',
    userName: 'Dewi Lestari',
    userRole: 'pm',
    module: 'PM',
    action: 'APPROVE_LEAVE',
    details: 'Menyetujui pengajuan cuti tahap 1 untuk Dimas Prasetyo.',
    ipAddress: '192.168.1.22'
  },
  {
    id: 'log-104',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    userId: 'u5',
    userName: 'Hadi Nugroho',
    userRole: 'finance',
    module: 'FINANCE',
    action: 'PAID_INVOICE',
    details: 'Memverifikasi pelunasan Invoice INV-2026-05-001 (PT Maju Bersama) & menerbitkan Jurnal Umum.',
    ipAddress: '192.168.1.18'
  },
  {
    id: 'log-105',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    userId: 'u9',
    userName: 'Siti Aminah',
    userRole: 'hr',
    module: 'HR',
    action: 'APPROVE_OVERTIME',
    details: 'Menyetujui pengajuan lembur Dimas Prasetyo (3 Jam - Revisi Desain).',
    ipAddress: '192.168.1.25'
  }
];

export const useActivityLogStore = create<ActivityLogStoreState>()(
  persist(
    (set) => ({
      logs: initialLogs,

      addLog: (logData) =>
        set((state) => {
          const newLog: ActivityLog = {
            ...logData,
            id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: new Date().toISOString(),
          };
          return { logs: [newLog, ...state.logs] };
        }),

      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: 'bertumbuh-activity-log-storage',
    }
  )
);
