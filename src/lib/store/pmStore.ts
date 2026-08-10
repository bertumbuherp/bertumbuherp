import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { projects as initialProjects, tasks as initialTasks } from '@/backend/repositories/mockRepository';
import { Project, Task, ProjectStatus } from '@/lib/types';

interface PMStoreState {
  projects: Project[];
  tasks: Task[];
  addProject: (project: Project) => void;
  addProjectAddOn: (projectId: string, addOn: Project['addOns'][0]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, newStatus: Task['status']) => void;
  updateTaskEvidence: (taskId: string, link: string) => void;
  deleteTask: (taskId: string) => void;
}

export const usePMStore = create<PMStoreState>()(
  persist(
    (set) => ({
      projects: initialProjects,
      tasks: initialTasks,

      addProject: (project) =>
        set((state) => ({ projects: [project, ...state.projects] })),

      addProjectAddOn: (projectId, addOn) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, addOns: [addOn, ...p.addOns] } : p
          ),
        })),

      addTask: (task) =>
        set((state) => ({ tasks: [...state.tasks, task] })),

      updateTask: (updatedTask) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          ),
        })),

      updateTaskStatus: (taskId, newStatus) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          ),
        })),

      updateTaskEvidence: (taskId, link) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, evidenceLink: link } : task
          ),
        })),

      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        })),
    }),
    {
      name: 'bertumbuh-pm-storage',
    }
  )
);
