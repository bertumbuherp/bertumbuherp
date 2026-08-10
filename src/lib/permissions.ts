/**
 * RBAC Permission Map
 * -------------------
 * Defines which actions each role can perform on each resource.
 * This is the single source of truth for all permission checks.
 *
 * When integrating a real backend (e.g. Supabase), replicate these
 * rules in Row Level Security (RLS) policies.
 */

import { Role, Action } from './types';

export type Resource = 
  | 'dashboard'
  | 'crm'
  | 'clients'
  | 'projects'
  | 'finance'
  | 'accounting'
  | 'hr'
  | 'settings'
  | 'pm_dashboard'
  | 'tasks'
  | 'invoices'
  | 'employees'
  | 'reports'
  | 'overtime'
  | 'calendar'
  | 'reimbursement'
  | 'cuti';

export const ROLE_LABELS_MAP: Record<Role, string> = {
  owner:       'Owner / Direktur',
  super_admin: 'Super Admin',
  ae:          'Account Executive',
  pm:          'Project Manager',
  finance:     'Finance Manager',
  hr:          'HR Manager',
  team_member: 'Anggota Tim',
};

type PermissionMap = Record<Resource, Action[]>;

const ALL_ACTIONS: Action[] = ['read', 'write', 'delete', 'approve'];
const READ_WRITE: Action[] = ['read', 'write'];
const READ_ONLY: Action[] = ['read'];
const NONE: Action[] = [];

/** Full permission matrix per role */
export const ROLE_PERMISSIONS: Record<Role, PermissionMap> = {
  owner: {
    dashboard:    ALL_ACTIONS,
    crm:          ALL_ACTIONS,
    clients:      ALL_ACTIONS,
    projects:     ALL_ACTIONS,
    finance:      ALL_ACTIONS,
    accounting:   ALL_ACTIONS,
    hr:           ALL_ACTIONS,
    settings:     ALL_ACTIONS,
    pm_dashboard: ALL_ACTIONS,
    tasks:        ALL_ACTIONS,
    invoices:     ALL_ACTIONS,
    employees:    ALL_ACTIONS,
    reports:      ALL_ACTIONS,
    overtime:     ALL_ACTIONS,
    calendar:     ALL_ACTIONS,
    reimbursement:ALL_ACTIONS,
    cuti:         ALL_ACTIONS,
  },
  super_admin: {
    dashboard:    ALL_ACTIONS,
    crm:          ALL_ACTIONS,
    clients:      ALL_ACTIONS,
    projects:     ALL_ACTIONS,
    finance:      READ_WRITE,   // no delete
    accounting:   READ_WRITE,
    hr:           ALL_ACTIONS,
    settings:     READ_WRITE,   // no delete org
    pm_dashboard: ALL_ACTIONS,
    tasks:        ALL_ACTIONS,
    invoices:     READ_WRITE,
    employees:    ALL_ACTIONS,
    reports:      ALL_ACTIONS,
    overtime:     ALL_ACTIONS,
    calendar:     ALL_ACTIONS,
    reimbursement:ALL_ACTIONS,
    cuti:         ALL_ACTIONS,
  },
  ae: {
    dashboard:    READ_ONLY,
    crm:          READ_WRITE,
    clients:      READ_WRITE,
    projects:     READ_ONLY,
    finance:      NONE,
    accounting:   NONE,
    hr:           NONE,
    settings:     NONE,
    pm_dashboard: NONE,
    tasks:        READ_ONLY,
    invoices:     READ_ONLY,
    employees:    NONE,
    reports:      READ_ONLY,
    overtime:     NONE,
    calendar:     ALL_ACTIONS,
    reimbursement:NONE,
    cuti:         NONE,
  },
  pm: {
    dashboard:    READ_ONLY,
    crm:          NONE,
    clients:      ALL_ACTIONS,
    projects:     READ_WRITE,
    finance:      NONE,
    accounting:   NONE,
    hr:           READ_ONLY,
    settings:     NONE,
    pm_dashboard: ALL_ACTIONS,
    tasks:        ALL_ACTIONS,
    invoices:     READ_ONLY,
    employees:    READ_ONLY,
    reports:      READ_WRITE,
    overtime:     ['read', 'write', 'approve'],
    calendar:     ALL_ACTIONS,
    reimbursement:['read', 'approve'],
    cuti:         ['read', 'approve'],
  },
  finance: {
    dashboard:    READ_ONLY,
    crm:          NONE,
    clients:      READ_ONLY,
    projects:     READ_ONLY,
    finance:      ALL_ACTIONS,
    accounting:   ALL_ACTIONS,
    hr:           READ_ONLY,
    settings:     NONE,
    pm_dashboard: NONE,
    tasks:        NONE,
    invoices:     ALL_ACTIONS,
    employees:    READ_ONLY,
    reports:      ALL_ACTIONS,
    overtime:     READ_ONLY,
    calendar:     ALL_ACTIONS,
    reimbursement:ALL_ACTIONS,
    cuti:         READ_ONLY,
  },
  hr: {
    dashboard:    NONE,
    crm:          NONE,
    clients:      NONE,
    projects:     READ_ONLY,
    finance:      NONE,
    accounting:   NONE,
    hr:           ALL_ACTIONS,
    settings:     NONE,
    pm_dashboard: NONE,
    tasks:        NONE,
    invoices:     NONE,
    employees:    ALL_ACTIONS,
    reports:      READ_ONLY,
    overtime:     READ_WRITE,
    calendar:     ALL_ACTIONS,
    reimbursement:NONE,
    cuti:         ALL_ACTIONS,
  },
  team_member: {
    dashboard:    READ_ONLY,
    crm:          NONE,
    clients:      NONE,
    projects:     READ_ONLY,
    finance:      NONE,
    accounting:   NONE,
    hr:           NONE,
    settings:     READ_WRITE,
    pm_dashboard: NONE,
    tasks:        READ_WRITE,   // own tasks only — enforced in data-access
    invoices:     NONE,
    employees:    NONE,
    reports:      NONE,
    overtime:     READ_WRITE,   // own entries only
    calendar:     ALL_ACTIONS,
    reimbursement:READ_WRITE,
    cuti:         READ_WRITE,
  },
};

/** Sidebar nav items visible per role */
export const ROLE_NAV: Record<Role, string[]> = {
  owner:       ['/ceo', '/pm', '/crm', '/finance', '/hr', '/team_member'],
  super_admin: ['/pm', '/crm', '/finance', '/hr', '/team_member'],
  ae:          ['/crm'],
  pm:          ['/pm'],
  finance:     ['/finance'],
  hr:          ['/hr'],
  team_member: ['/team_member'],
};

/** Default redirect after login per role */
export const ROLE_DEFAULT_ROUTE: Record<Role, string> = {
  owner:       '/ceo/dashboard',
  super_admin: '/pm/dashboard',
  ae:          '/crm/dashboard',
  pm:          '/pm/dashboard',
  finance:     '/finance/dashboard',
  hr:          '/hr/dashboard',
  team_member: '/team_member/dashboard',
};

/**
 * Check if any of the given roles has permission to perform `action` on `resource`.
 */
export function can(
  roles: Role[],
  resource: Resource,
  action: Action,
): boolean {
  return roles.some(role => {
    const perms = ROLE_PERMISSIONS[role];
    return perms?.[resource]?.includes(action) ?? false;
  });
}

/**
 * Check if a route path is accessible by any of the given roles.
 */
export function canAccessRoute(roles: Role[], path: string): boolean {
  const baseRoute = '/' + path.split('/')[1]; // e.g. "/pm/something" → "/pm"
  return roles.some(role => ROLE_NAV[role]?.includes(baseRoute));
}
