import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

const initialOvertimes: Overtime[] = [
  { id: 'ot1', userId: 'e6', userName: 'Dimas Prasetyo', projectId: 'p1', date: '2024-06-15T18:00', durationHours: 3, reason: 'Lembur kejar deadline pitch', status: 'pending' },
  { id: 'ot2', userId: 'e7', userName: 'Sarah Wijaya', projectId: 'p2', date: '2024-06-12T19:00', durationHours: 2, reason: 'Revisi desain mendadak', status: 'approved' },
  { id: 'ot3', userId: 'e6', userName: 'Dimas Prasetyo', projectId: 'p3', date: '2024-05-20T17:30', durationHours: 4, reason: 'Maintenance server', status: 'declined' },
];

const initialLeaves: Leave[] = [
  { id: 'c1', userId: 'e1', userName: 'Ghani Affan', type: 'Tahunan', startDate: '2024-06-10', endDate: '2024-06-12', reason: 'Liburan keluarga', status: 'approved_hr', durationDays: 3 },
  { id: 'c2', userId: 'e2', userName: 'Amalia', type: 'Sakit', startDate: '2024-05-02', endDate: '2024-05-02', reason: 'Demam', status: 'approved_hr', durationDays: 1 },
];

const initialEmployees: Employee[] = [
  { id: 'e1', name: 'Ghani Affan', role: 'Graphic Designer', div: 'Design', type: 'Full-Time', baseSalary: 3000000, status: 'active' },
  { id: 'e2', name: 'Amalia', role: 'Social Media Specialist', div: 'Social Media', type: 'Full-Time', baseSalary: 2800000, status: 'active' },
  { id: 'e3', name: 'Pipit Widyawati', role: 'Content Creator', div: 'Social Media', type: 'Freelance', baseSalary: 1500000, status: 'active' },
  { id: 'e4', name: 'Rafi', role: 'Copywriter', div: 'Social Media', type: 'Freelance', baseSalary: 1000000, status: 'active' },
  { id: 'e5', name: 'Bayu', role: 'Videographer', div: 'Production', type: 'Full-Time', baseSalary: 3500000, status: 'active' },
];

const initialAttendances: Attendance[] = [
  { id: 'a1', userId: 'e1', userName: 'Ghani Affan', date: new Date().toISOString().split('T')[0], clockIn: new Date(new Date().setHours(8, 30, 0, 0)).toISOString(), clockOut: null, status: 'present' },
  { id: 'a2', userId: 'e2', userName: 'Amalia', date: new Date().toISOString().split('T')[0], clockIn: new Date(new Date().setHours(8, 45, 0, 0)).toISOString(), clockOut: null, status: 'present' },
];

export const useHRStore = create<HRStoreState>()(
  persist(
    (set, get) => ({
      overtimes: initialOvertimes,
      leaves: initialLeaves,
      employees: initialEmployees,
      attendances: initialAttendances,

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
