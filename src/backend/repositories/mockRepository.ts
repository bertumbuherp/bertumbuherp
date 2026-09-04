import { Client, Deal, Project, Task, Invoice, Employee, TimeEntry, Expense, DashboardMetrics, RevenueDataPoint, ProjectProfitability, Organization } from '../../lib/types';

export const org: Organization = {
  id: 'org_bertumbuh',
  name: 'Bertumbuh Creative',
  slug: 'bertumbuh',
  revenueTarget: 150000000,
  utilizationTarget: 80,
  createdAt: '2023-01-01',
};

export const dashboardMetrics: DashboardMetrics = {
  revenueMtd: 0,
  revenueYtd: 0,
  revenueTarget: 150000000,
  grossMarginPercent: 0,
  arOutstanding: 0,
  utilizationRate: 0,
  activeProjects: 0,
  activeClients: 0,
  totalClients: 0,
  wip: 0,
};

export const revenueData: RevenueDataPoint[] = [];
export const projectProfitability: ProjectProfitability[] = [];
export const clients: Client[] = [];
export const deals: Deal[] = [];
export const projects: Project[] = [];
export const tasks: Task[] = [];
export const invoices: Invoice[] = [];

export const employees: Employee[] = [
  { id: 'u1', organizationId: 'org_bertumbuh', name: 'Owner / Direktur Utama', email: 'owner@bertumbuh.id', department: 'Brand', position: 'Owner / Creative Director', roles: ['owner'], monthlySalary: 25000000, standardHoursPerMonth: 160, costRate: 156250, billableRate: 350000, joinDate: '2021-01-01', isActive: true },
  { id: 'u2', organizationId: 'org_bertumbuh', name: 'Super Admin Operasional', email: 'admin@bertumbuh.id', department: 'Brand', position: 'Super Admin / Ops Manager', roles: ['super_admin'], monthlySalary: 15000000, standardHoursPerMonth: 160, costRate: 93750, billableRate: 250000, joinDate: '2021-03-01', isActive: true },
  { id: 'u3', organizationId: 'org_bertumbuh', name: 'Account Executive', email: 'ae@bertumbuh.id', department: 'Brand', position: 'Account Executive', roles: ['ae'], monthlySalary: 12000000, standardHoursPerMonth: 160, costRate: 75000, billableRate: 200000, joinDate: '2022-02-01', isActive: true },
  { id: 'u4', organizationId: 'org_bertumbuh', name: 'Project Manager', email: 'pm@bertumbuh.id', department: 'Brand', position: 'Project Manager', roles: ['pm'], monthlySalary: 13000000, standardHoursPerMonth: 160, costRate: 81250, billableRate: 220000, joinDate: '2022-05-01', isActive: true },
  { id: 'u5', organizationId: 'org_bertumbuh', name: 'Finance Manager', email: 'finance@bertumbuh.id', department: 'Brand', position: 'Finance Manager', roles: ['finance'], monthlySalary: 13000000, standardHoursPerMonth: 160, costRate: 81250, billableRate: 0, joinDate: '2022-06-01', isActive: true },
  { id: 'u6', organizationId: 'org_bertumbuh', name: 'Anggota Tim / Content Lead', email: 'team@bertumbuh.id', department: 'Sosmed/CC', position: 'Content Creator Lead', roles: ['team_member'], monthlySalary: 9000000, standardHoursPerMonth: 160, costRate: 56250, billableRate: 150000, joinDate: '2022-09-01', isActive: true },
  { id: 'u7', organizationId: 'org_bertumbuh', name: 'Designer Specialist', email: 'designer@bertumbuh.id', department: 'Design', position: 'Senior Designer', roles: ['team_member'], monthlySalary: 10000000, standardHoursPerMonth: 160, costRate: 62500, billableRate: 175000, joinDate: '2023-01-01', isActive: true },
  { id: 'u8', organizationId: 'org_bertumbuh', name: 'Performance Marketer', email: 'performance@bertumbuh.id', department: 'Performance', position: 'Performance Marketer', roles: ['team_member'], monthlySalary: 10500000, standardHoursPerMonth: 160, costRate: 65625, billableRate: 180000, joinDate: '2023-04-01', isActive: true },
  { id: 'u9', organizationId: 'org_bertumbuh', name: 'HR Manager', email: 'hr@bertumbuh.id', department: 'Brand', position: 'HR Manager', roles: ['hr'], monthlySalary: 11000000, standardHoursPerMonth: 160, costRate: 68750, billableRate: 0, joinDate: '2022-08-01', isActive: true },
];

export const expenses: Expense[] = [];
export const atRiskAlerts: Array<{ id: string; type: string; message: string; projectId?: string; severity: 'high' | 'medium' | 'low' }> = [];
export const currentUser = employees[3]; // PM — Project Manager

export const overtimeEntries: any[] = [];
export const clientReports: any[] = [];
export const teamWorkload: any[] = [];
