import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabaseDataService } from '@/lib/services/supabaseDataService';


export interface Overtime {
  id: string;
  userId: string;
  userName: string;
  projectId: string;
  date: string;
  durationHours: number;
  reason: string;
  status: 'pending' | 'approved' | 'declined' | 'returned';
}

export interface Leave {
  id: string;
  userId: string;
  userName: string;
  type: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  reason: string;
  status: 'pending' | 'approved_pm' | 'approved_hr' | 'rejected';
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  div: string;
  type: 'Full-Time' | 'Freelance' | 'Intern';
  baseSalary: number;
  status: 'active' | 'inactive';
}

export interface Attendance {
  id: string;
  userId: string;
  userName: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: 'present' | 'absent' | 'leave' | 'sick';
}

interface HRStoreState {
  overtimes: Overtime[];
  leaves: Leave[];
  employees: Employee[];
  attendances: Attendance[];
  
  fetchFromSupabase: () => Promise<void>;
  clearMockData: () => void;

  addOvertime: (overtime: Overtime) => void;
  updateOvertimeStatus: (id: string, status: Overtime['status']) => void;
  
  addLeave: (leave: Leave) => void;
  updateLeaveStatus: (id: string, status: Leave['status']) => void;
  
  addEmployee: (employee: Employee) => void;
  updateEmployeeStatus: (id: string, status: Employee['status']) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  
  clockIn: (userId: string, userName: string) => void;
  clockOut: (userId: string) => void;
}

const initialOvertimes: Overtime[] = [];
const initialLeaves: Leave[] = [];
const initialEmployees: Employee[] = [];
const initialAttendances: Attendance[] = [];

export const useHRStore = create<HRStoreState>()(
  persist(
    (set, get) => ({
      overtimes: [],
      leaves: [],
      employees: [],
      attendances: [],

      fetchFromSupabase: async () => {
        const [dbOvertimes, dbLeaves, dbAttendances] = await Promise.all([
          supabaseDataService.getOvertimes(),
          supabaseDataService.getLeaves(),
          supabaseDataService.getAttendances(),
        ]);

        if (dbOvertimes && dbOvertimes.length > 0) {
          set({
            overtimes: dbOvertimes.map((ot: any) => ({
              id: ot.id,
              userId: ot.user_id,
              userName: ot.user_name,
              projectId: ot.project_id || '',
              date: ot.date,
              durationHours: Number(ot.duration_hours) || 0,
              reason: ot.reason || '',
              status: ot.status || 'pending',
            })),
          });
        }

        if (dbLeaves && dbLeaves.length > 0) {
          set({
            leaves: dbLeaves.map((l: any) => ({
              id: l.id,
              userId: l.user_id,
              userName: l.user_name,
              type: l.type,
              startDate: l.start_date,
              endDate: l.end_date,
              durationDays: l.duration_days,
              reason: l.reason || '',
              status: l.status || 'pending',
            })),
          });
        }

        if (dbAttendances && dbAttendances.length > 0) {
          set({
            attendances: dbAttendances.map((a: any) => ({
              id: a.id,
              userId: a.user_id,
              userName: a.user_name,
              date: a.date,
              clockIn: a.clock_in,
              clockOut: a.clock_out,
              status: a.status || 'present',
            })),
          });
        }
      },

      clearMockData: () => {
        set({ overtimes: [], leaves: [], employees: [], attendances: [] });
      },


      addOvertime: (overtime) => set((state) => ({ overtimes: [overtime, ...state.overtimes] })),
      
      updateOvertimeStatus: (id, status) => set((state) => ({
        overtimes: state.overtimes.map(ot => ot.id === id ? { ...ot, status } : ot)
      })),

      addLeave: (leave) => set((state) => ({ leaves: [leave, ...state.leaves] })),
      
      updateLeaveStatus: (id, status) => set((state) => ({
        leaves: state.leaves.map(l => l.id === id ? { ...l, status } : l)
      })),

      addEmployee: (employee) => set((state) => ({ employees: [employee, ...state.employees] })),
      
      updateEmployeeStatus: (id, status) => set((state) => ({
        employees: state.employees.map(e => e.id === id ? { ...e, status } : e)
      })),
      
      updateEmployee: (id, updates) => set((state) => ({
        employees: state.employees.map(e => e.id === id ? { ...e, ...updates } : e)
      })),

      clockIn: (userId, userName) => {
        const today = new Date().toISOString().split('T')[0];
        const existing = get().attendances.find(a => a.userId === userId && a.date === today);
        if (!existing) {
          const newAtt: Attendance = {
            id: 'att_' + Date.now(),
            userId,
            userName,
            date: today,
            clockIn: new Date().toISOString(),
            clockOut: null,
            status: 'present'
          };
          set(state => ({ attendances: [newAtt, ...state.attendances] }));
        }
      },

      clockOut: (userId) => {
        const today = new Date().toISOString().split('T')[0];
        set(state => ({
          attendances: state.attendances.map(a => 
            (a.userId === userId && a.date === today && !a.clockOut) 
              ? { ...a, clockOut: new Date().toISOString() } 
              : a
          )
        }));
      },
    }),
    {
      name: 'bertumbuh-hr-storage',
    }
  )
);
