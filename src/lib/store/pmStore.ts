import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { projects as initialProjects, tasks as initialTasks } from '@/backend/repositories/mockRepository';
import { Project, Task } from '@/lib/types';
import { supabaseDataService } from '@/lib/services/supabaseDataService';

interface PMStoreState {
  projects: Project[];
  tasks: Task[];
  fetchFromSupabase: () => Promise<void>;
  clearMockData: () => void;
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
    (set, get) => ({
      projects: [],
      tasks: [],

      fetchFromSupabase: async () => {
        const [dbProjects, dbTasks] = await Promise.all([
          supabaseDataService.getProjects(),
          supabaseDataService.getTasks(),
        ]);

        if (dbProjects && dbProjects.length > 0) {
          const mappedProjects: Project[] = dbProjects.map((p: any) => ({
            id: p.id,
            organizationId: p.organization_id || 'org_bertumbuh',
            name: p.name,
            clientId: p.client_id || 'c1',
            clientName: p.client_name,
            pmId: p.pm_id || 'u4',
            pmName: p.pm_name || 'Project Manager',
            status: p.status || 'on_track',
            billingType: p.billing_type || 'project',
            packageTier: p.package_tier || 'TIER_B',
            packageServices: p.package_services || [],
            monthlyRetainerFee: Number(p.monthly_retainer_fee) || 0,
            contractValue: Number(p.contract_value) || 0,
            budget: Number(p.budget) || 0,
            actualCost: Number(p.actual_cost) || 0,
            startDate: p.start_date || '2026-01-01',
            endDate: p.end_date || '2026-12-31',
            subTeams: p.sub_teams || ['Production', 'Design'],
            addOns: [],
            members: p.members || [],
            milestones: p.milestones || [],
            reports: p.reports || [],
            activities: p.activities || [],
            createdAt: p.created_at || new Date().toISOString(),
          }));
          set({ projects: mappedProjects });
        }

        if (dbTasks && dbTasks.length > 0) {
          const mappedTasks: Task[] = dbTasks.map((t: any) => ({
            id: t.id,
            projectId: t.project_id,
            title: t.title,
            assigneeId: t.assignee_id || 'u6',
            assigneeName: t.assignee_name || 'Team Member',
            subTeam: t.sub_team || 'Design',
            status: t.status || 'todo',
            priority: t.priority || 'medium',
            estimatedHours: t.estimated_hours || 0,
            loggedHours: t.logged_hours || 0,
            dueDate: t.due_date || '2026-06-30',
            evidenceLink: t.evidence_link || undefined,
            phase: t.phase || 'ongoing',
            createdAt: t.created_at || new Date().toISOString(),
          }));
          set({ tasks: mappedTasks });
        }

      },

      clearMockData: () => {
        set({ projects: [], tasks: [] });
      },

      addProject: (project) => {
        set((state) => ({ projects: [project, ...state.projects] }));
        supabaseDataService.upsertProject({
          id: project.id.startsWith('p_') ? undefined : project.id,
          name: project.name,
          client_id: project.clientId.startsWith('c_') ? null : project.clientId,
          client_name: project.clientName,
          pm_id: project.pmId,
          pm_name: project.pmName,
          status: project.status,
          billing_type: project.billingType,
          package_tier: project.packageTier,
          package_services: project.packageServices,
          monthly_retainer_fee: project.monthlyRetainerFee,
          contract_value: project.contractValue,
          budget: project.budget,
          actual_cost: project.actualCost,
          start_date: project.startDate,
          end_date: project.endDate,
          sub_teams: project.subTeams,
          members: project.members,
          milestones: project.milestones,
        });
      },

      addProjectAddOn: (projectId, addOn) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, addOns: [addOn, ...(p.addOns || [])] } : p
          ),
        })),

      addTask: (task) => {
        set((state) => ({ tasks: [...state.tasks, task] }));
        supabaseDataService.upsertTask({
          title: task.title,
          project_id: task.projectId,
          assignee_id: task.assigneeId,
          assignee_name: task.assigneeName,
          sub_team: task.subTeam,
          status: task.status,
          priority: task.priority,
          estimated_hours: task.estimatedHours,
          logged_hours: task.loggedHours,
          due_date: task.dueDate,
          evidence_link: task.evidenceLink,
        });
      },

      updateTask: (updatedTask) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          ),
        }));
        supabaseDataService.upsertTask({
          id: updatedTask.id,
          title: updatedTask.title,
          status: updatedTask.status,
          evidence_link: updatedTask.evidenceLink,
        });
      },

      updateTaskStatus: (taskId, newStatus) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          ),
        }));
        supabaseDataService.upsertTask({ id: taskId, status: newStatus });
      },

      updateTaskEvidence: (taskId, link) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, evidenceLink: link } : task
          ),
        }));
        supabaseDataService.upsertTask({ id: taskId, evidence_link: link });
      },

      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        }));
        supabaseDataService.deleteTask(taskId);
      },
    }),
    {
      name: 'bertumbuh-pm-storage',
    }
  )
);

