import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role } from '@/lib/types';
import { supabaseDataService } from '@/lib/services/supabaseDataService';

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
  fetchFromSupabase: () => Promise<void>;
  clearMockData: () => void;
  addLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

const initialLogs: ActivityLog[] = [];

export const useActivityLogStore = create<ActivityLogStoreState>()(
  persist(
    (set) => ({
      logs: [],

      fetchFromSupabase: async () => {
        const dbLogs = await supabaseDataService.getActivityLogs();
        if (dbLogs && dbLogs.length > 0) {
          const mappedLogs: ActivityLog[] = dbLogs.map((l: any) => ({
            id: l.id,
            timestamp: l.timestamp,
            userId: l.user_id,
            userName: l.user_name,
            userRole: l.user_role,
            module: l.module,
            action: l.action,
            details: l.details,
            ipAddress: l.ip_address,
          }));
          set({ logs: mappedLogs });
        }
      },

      clearMockData: () => set({ logs: [] }),

      addLog: (logData) => {
        const newLog: ActivityLog = {
          ...logData,
          id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ logs: [newLog, ...state.logs] }));

        supabaseDataService.addActivityLog({
          user_id: newLog.userId,
          user_name: newLog.userName,
          user_role: newLog.userRole,
          module: newLog.module,
          action: newLog.action,
          details: newLog.details,
          ip_address: newLog.ipAddress || '127.0.0.1',
        });
      },

      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: 'bertumbuh-activity-log-storage',
    }
  )
);

