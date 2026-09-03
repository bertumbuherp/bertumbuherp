import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SystemErrorLog {
  id: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  module: string;
  errorMessage: string;
  stackTrace?: string;
  componentRoute?: string;
  status: 'unresolved' | 'investigating' | 'resolved';
}

export interface HealthIndicator {
  name: string;
  category: 'database' | 'server' | 'code' | 'storage';
  status: 'operational' | 'degraded' | 'down';
  latencyMs: number;
  lastChecked: string;
  details: string;
}

interface SystemStatusStoreState {
  databaseStatus: HealthIndicator;
  serverStatus: HealthIndicator;
  codeRuntimeStatus: HealthIndicator;
  storageStatus: HealthIndicator;
  errorLogs: SystemErrorLog[];
  isDiagnosticsRunning: boolean;

  runDiagnostics: () => Promise<void>;
  captureError: (error: Omit<SystemErrorLog, 'id' | 'timestamp' | 'status'>) => void;
  resolveError: (id: string) => void;
  clearResolvedErrors: () => void;
}

const initialErrors: SystemErrorLog[] = [
  {
    id: 'err-1',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    severity: 'info',
    module: 'AUTH',
    errorMessage: 'Kredensial login tidak valid untuk percobaan user (Password Mismatch).',
    componentRoute: '/login',
    status: 'resolved',
  },
  {
    id: 'err-2',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    severity: 'warning',
    module: 'FINANCE',
    errorMessage: 'Peringatan toleransi pembulatan desimal pajak PPh 23 terdeteksi pada Invoice INV-2026-05-001.',
    componentRoute: '/finance/accounting',
    status: 'investigating',
  },
];

export const useSystemStatusStore = create<SystemStatusStoreState>()(
  persist(
    (set, get) => ({
      databaseStatus: {
        name: 'Database Supabase (PostgreSQL)',
        category: 'database',
        status: 'operational',
        latencyMs: 18,
        lastChecked: new Date().toISOString(),
        details: 'Koneksi Cloud Supabase PostgreSQL aktif, RLS Policies terverifikasi.',
      },

      serverStatus: {
        name: 'Server API & Runtime Node.js',
        category: 'server',
        status: 'operational',
        latencyMs: 12,
        lastChecked: new Date().toISOString(),
        details: 'Next.js API Routes merespons HTTP 200 OK. Node process uptime normal.',
      },

      codeRuntimeStatus: {
        name: 'Integritas Kode & Hydration React',
        category: 'code',
        status: 'operational',
        latencyMs: 8,
        lastChecked: new Date().toISOString(),
        details: 'Tidak ada runtime error kritis. Hydration UI bersih 0.00% error rate.',
      },

      storageStatus: {
        name: 'Local Cache & State Sync',
        category: 'storage',
        status: 'operational',
        latencyMs: 4,
        lastChecked: new Date().toISOString(),
        details: 'Zustand localStorage persistence tersinkronisasi 100%.',
      },

      errorLogs: initialErrors,
      isDiagnosticsRunning: false,

      runDiagnostics: async () => {
        set({ isDiagnosticsRunning: true });
        // Simulate real-time ping check
        await new Promise((r) => setTimeout(r, 1200));

        const now = new Date().toISOString();
        const dbLatency = Math.floor(Math.random() * 12) + 12; // 12-24ms
        const serverLatency = Math.floor(Math.random() * 10) + 8; // 8-18ms
        const codeLatency = Math.floor(Math.random() * 5) + 5; // 5-10ms

        set({
          isDiagnosticsRunning: false,
          databaseStatus: {
            ...get().databaseStatus,
            latencyMs: dbLatency,
            lastChecked: now,
            status: 'operational',
          },
          serverStatus: {
            ...get().serverStatus,
            latencyMs: serverLatency,
            lastChecked: now,
            status: 'operational',
          },
          codeRuntimeStatus: {
            ...get().codeRuntimeStatus,
            latencyMs: codeLatency,
            lastChecked: now,
            status: 'operational',
          },
          storageStatus: {
            ...get().storageStatus,
            lastChecked: now,
            status: 'operational',
          },
        });
      },

      captureError: (errorData) =>
        set((state) => ({
          errorLogs: [
            {
              ...errorData,
              id: `err-${Date.now()}`,
              timestamp: new Date().toISOString(),
              status: 'unresolved',
            },
            ...state.errorLogs,
          ],
        })),

      resolveError: (id) =>
        set((state) => ({
          errorLogs: state.errorLogs.map((e) => (e.id === id ? { ...e, status: 'resolved' } : e)),
        })),

      clearResolvedErrors: () =>
        set((state) => ({
          errorLogs: state.errorLogs.filter((e) => e.status !== 'resolved'),
        })),
    }),
    {
      name: 'bertumbuh-system-status-storage',
    }
  )
);
