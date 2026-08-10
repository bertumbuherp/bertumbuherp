/**
 * Auth Session Management
 * -----------------------
 * Manages the client-side session using localStorage + a cookie
 * so Next.js middleware can also read the session for SSR route protection.
 *
 * SWAP POINT: Replace `mockLogin()` and session storage with a real
 * auth provider (e.g. Supabase Auth) when moving to production.
 * The AuthSession interface stays the same — only this file changes.
 */

import { AuthSession, Role } from './types';
import { ROLE_DEFAULT_ROUTE } from './permissions';
import { employees, org } from './mock-data';

const SESSION_KEY = 'erp_session';
const SESSION_DURATION_HOURS = 8;

// ── Session helpers ───────────────────────────────────────────────────────────

function buildSession(employee: typeof employees[0]): AuthSession {
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000
  ).toISOString();

  return {
    userId: employee.id,
    organizationId: employee.organizationId,
    name: employee.name,
    email: employee.email,
    roles: employee.roles as Role[],
    avatarInitials: employee.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
    expiresAt,
  };
}

function setCookie(value: string) {
  if (typeof document === 'undefined') return;
  // httpOnly is not settable from JS; in production this would be set server-side.
  document.cookie = `${SESSION_KEY}=${encodeURIComponent(value)}; path=/; max-age=${SESSION_DURATION_HOURS * 3600}; SameSite=Strict`;
}

function clearCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_KEY}=; path=/; max-age=0`;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Read the current session from localStorage.
 * Returns null if no session or session is expired.
 */
export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (new Date(session.expiresAt) <= new Date()) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/**
 * Persist session to localStorage + cookie (for middleware).
 */
export function setSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  const serialized = JSON.stringify(session);
  localStorage.setItem(SESSION_KEY, serialized);
  setCookie(serialized);
}

/**
 * Clear session from both stores.
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  clearCookie();
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  session?: AuthSession;
  error?: string;
  redirectTo?: string;
}

import { AuthService } from '../backend/services/AuthService';

/**
 * Attempt login.
 * SWAP POINT: Replace body with `fetch('/api/v1/auth')` in future phase.
 */
export async function mockLogin(credentials: LoginCredentials): Promise<LoginResult> {
  const result = await AuthService.verifyCredentials(credentials.email, credentials.password);
  
  if (!result.success || !result.user) {
    return { success: false, error: result.error || 'Login gagal.' };
  }

  const session = buildSession(result.user);
  setSession(session);

  const primaryRole = session.roles[0];
  const redirectTo = ROLE_DEFAULT_ROUTE[primaryRole] || '/dashboard';

  return { success: true, session, redirectTo };
}

/**
 * Logout — clear session and redirect to login.
 */
export function logout(): void {
  clearSession();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
