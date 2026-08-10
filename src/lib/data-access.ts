/**
 * Data Access Layer — Tenant-Scoped Queries
 * ------------------------------------------
 * ALL data access MUST go through this layer.
 * Every function takes `organizationId` and optional `userContext`
 * to enforce both tenant isolation and role-based data filtering.
 *
 * SWAP POINT: Replace the mock filter implementations with
 * real database queries (e.g. Supabase client calls with RLS).
 * The function signatures stay identical.
 */

import {
  projects as _projects,
  clients as _clients,
  deals as _deals,
  tasks as _tasks,
  invoices as _invoices,
  expenses as _expenses,
  employees as _employees,
  dashboardMetrics as _metrics,
  revenueData as _revenueData,
  projectProfitability as _profitability,
  atRiskAlerts as _alerts,
  overtimeEntries as _overtime,
  clientReports as _clientReports,
  teamWorkload as _teamWorkload,
  org,
} from './mock-data';
import { Role } from './types';

/** Caller context injected into every query */
export interface UserContext {
  userId: string;
  organizationId: string;
  roles: Role[];
}

function isPrimaryRole(ctx: UserContext, role: Role): boolean {
  return ctx.roles.includes(role);
}

// ── Projects ──────────────────────────────────────────────────────────────────

export function getProjects(ctx: UserContext) {
  const scoped = _projects.filter(p => p.organizationId === ctx.organizationId);

  // PM only sees projects they manage
  if (
    isPrimaryRole(ctx, 'pm') &&
    !isPrimaryRole(ctx, 'owner') &&
    !isPrimaryRole(ctx, 'super_admin')
  ) {
    return scoped.filter(p => p.pmId === ctx.userId);
  }

  // Team member only sees projects they're assigned to
  if (isPrimaryRole(ctx, 'team_member') && !isPrimaryRole(ctx, 'pm')) {
    const myProjectIds = _tasks
      .filter(t => t.assigneeId === ctx.userId)
      .map(t => t.projectId);
    return scoped.filter(p => myProjectIds.includes(p.id));
  }

  return scoped;
}

export function getProjectById(ctx: UserContext, projectId: string) {
  return getProjects(ctx).find(p => p.id === projectId) ?? null;
}

// ── Clients ───────────────────────────────────────────────────────────────────

export function getClients(ctx: UserContext) {
  const scoped = _clients.filter(c => c.organizationId === ctx.organizationId);

  // AE only sees their own clients
  if (
    isPrimaryRole(ctx, 'ae') &&
    !isPrimaryRole(ctx, 'owner') &&
    !isPrimaryRole(ctx, 'super_admin')
  ) {
    return scoped.filter(c => c.ownedByAe === ctx.userId);
  }

  return scoped;
}

// ── Deals / CRM ───────────────────────────────────────────────────────────────

export function getDeals(ctx: UserContext) {
  const scoped = _deals.filter(d => d.organizationId === ctx.organizationId);

  // AE only sees their own deals
  if (
    isPrimaryRole(ctx, 'ae') &&
    !isPrimaryRole(ctx, 'owner') &&
    !isPrimaryRole(ctx, 'super_admin')
  ) {
    return scoped.filter(d => d.aeId === ctx.userId);
  }

  return scoped;
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export function getTasks(ctx: UserContext, projectId?: string) {
  let scoped = _tasks.filter(t => {
    // Scope by project which is scoped by org
    const proj = _projects.find(p => p.id === t.projectId);
    return proj?.organizationId === ctx.organizationId;
  });

  if (projectId) {
    scoped = scoped.filter(t => t.projectId === projectId);
  }

  // Team member only sees their own tasks
  if (
    isPrimaryRole(ctx, 'team_member') &&
    !isPrimaryRole(ctx, 'pm') &&
    !isPrimaryRole(ctx, 'owner')
  ) {
    return scoped.filter(t => t.assigneeId === ctx.userId);
  }

  // PM only sees tasks in their projects
  if (
    isPrimaryRole(ctx, 'pm') &&
    !isPrimaryRole(ctx, 'owner') &&
    !isPrimaryRole(ctx, 'super_admin')
  ) {
    const myProjectIds = _projects
      .filter(p => p.pmId === ctx.userId && p.organizationId === ctx.organizationId)
      .map(p => p.id);
    return scoped.filter(t => myProjectIds.includes(t.projectId));
  }

  return scoped;
}

// ── Invoices ──────────────────────────────────────────────────────────────────

export function getInvoices(ctx: UserContext) {
  return _invoices.filter(inv => inv.organizationId === ctx.organizationId);
}

// ── Expenses ──────────────────────────────────────────────────────────────────

export function getExpenses(ctx: UserContext) {
  return _expenses.filter(ex => ex.organizationId === ctx.organizationId);
}

// ── Employees ─────────────────────────────────────────────────────────────────

export function getEmployees(ctx: UserContext) {
  return _employees.filter(e => e.organizationId === ctx.organizationId);
}

export function getEmployeeById(ctx: UserContext, userId: string) {
  return getEmployees(ctx).find(e => e.id === userId) ?? null;
}

// ── Dashboard Metrics ─────────────────────────────────────────────────────────

export function getDashboardMetrics(ctx: UserContext) {
  // In production: compute from real transactions scoped to ctx.organizationId
  // For now: return mock data (already org-scoped in practice)
  return _metrics;
}

export function getRevenueData(ctx: UserContext) {
  return _revenueData;
}

export function getProjectProfitability(ctx: UserContext) {
  const myProjects = getProjects(ctx).map(p => p.id);
  return _profitability.filter(pp => myProjects.includes(pp.projectId));
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export function getAlerts(ctx: UserContext) {
  // Scope alerts to org's projects
  const myProjectIds = getProjects(ctx).map(p => p.id);
  return _alerts.filter(a => !a.projectId || myProjectIds.includes(a.projectId));
}

// ── PM-specific ───────────────────────────────────────────────────────────────

export function getOvertimeEntries(ctx: UserContext) {
  const myProjectIds = getProjects(ctx).map(p => p.id);
  return _overtime.filter(ot => myProjectIds.includes(ot.projectId));
}

export function getClientReports(ctx: UserContext) {
  const myProjectIds = getProjects(ctx).map(p => p.id);
  return _clientReports.filter(cr => myProjectIds.includes(cr.projectId));
}

export function getTeamWorkload(ctx: UserContext) {
  // Return workload for team members in this org
  const orgEmployeeIds = getEmployees(ctx).map(e => e.id);
  return _teamWorkload.filter(w => orgEmployeeIds.includes(w.employeeId));
}

// ── Organization ──────────────────────────────────────────────────────────────

export function getOrganization(ctx: UserContext) {
  if (org.id !== ctx.organizationId) return null;
  return org;
}
