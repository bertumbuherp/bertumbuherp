import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role } from '@/lib/types';
import { employees as initialEmployees } from '@/backend/repositories/mockRepository';
import { useActivityLogStore } from '@/lib/store/activityLogStore';

export interface UserAccount {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  roles: Role[];
  monthlySalary: number;
  standardHoursPerMonth: number;
  costRate: number;
  billableRate: number;
  joinDate: string;
  isActive: boolean;
}

interface UserStoreState {
  users: UserAccount[];
  addUser: (userData: Omit<UserAccount, 'id' | 'organizationId' | 'costRate' | 'joinDate'>, actorName: string, actorRole: Role) => void;
  updateUser: (id: string, updates: Partial<UserAccount>, actorName: string, actorRole: Role) => void;
  deleteUser: (id: string, actorName: string, actorRole: Role) => void;
  toggleUserStatus: (id: string, actorName: string, actorRole: Role) => void;
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      users: initialEmployees as UserAccount[],

      addUser: (userData, actorName, actorRole) => {
        const id = `u_${Date.now()}`;
        const newUser: UserAccount = {
          ...userData,
          id,
          organizationId: 'org_bertumbuh',
          costRate: Math.round(userData.monthlySalary / (userData.standardHoursPerMonth || 160)),
          joinDate: new Date().toISOString().split('T')[0],
        };

        set((state) => ({ users: [newUser, ...state.users] }));

        useActivityLogStore.getState().addLog({
          userId: 'admin',
          userName: actorName,
          userRole: actorRole,
          module: 'USER_MGMT',
          action: 'CREATE_USER',
          details: `Menambahkan user baru: ${newUser.name} (${newUser.email}) - Role: ${newUser.roles.join(', ')}`,
        });
      },

      updateUser: (id, updates, actorName, actorRole) => {
        const target = get().users.find((u) => u.id === id);
        if (!target) return;

        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        }));

        useActivityLogStore.getState().addLog({
          userId: 'admin',
          userName: actorName,
          userRole: actorRole,
          module: 'USER_MGMT',
          action: 'UPDATE_USER',
          details: `Mengubah data user: ${target.name} (${target.email})`,
        });
      },

      deleteUser: (id, actorName, actorRole) => {
        const target = get().users.find((u) => u.id === id);
        if (!target) return;

        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));

        useActivityLogStore.getState().addLog({
          userId: 'admin',
          userName: actorName,
          userRole: actorRole,
          module: 'USER_MGMT',
          action: 'DELETE_USER',
          details: `Menghapus user permanen: ${target.name} (${target.email})`,
        });
      },

      toggleUserStatus: (id, actorName, actorRole) => {
        const target = get().users.find((u) => u.id === id);
        if (!target) return;

        const newStatus = !target.isActive;

        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, isActive: newStatus } : u)),
        }));

        useActivityLogStore.getState().addLog({
          userId: 'admin',
          userName: actorName,
          userRole: actorRole,
          module: 'USER_MGMT',
          action: 'TOGGLE_USER_STATUS',
          details: `Mengubah status user ${target.name} menjadi ${newStatus ? 'Aktif' : 'Non-Aktif'}`,
        });
      },
    }),
    {
      name: 'bertumbuh-user-mgmt-storage',
    }
  )
);
