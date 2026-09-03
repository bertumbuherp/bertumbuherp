'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthSession, Role, Resource, Action } from '@/lib/types';
import { getSession, clearSession, LoginCredentials, LoginResult, mockLogin } from '@/lib/auth';
import { can as checkPermission, canAccessRoute, ROLE_DEFAULT_ROUTE } from '@/lib/permissions';
import { employees, org } from '@/lib/mock-data';
import { Organization } from '@/lib/types';

// ── Context shape ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Current authenticated session — null if not logged in */
  session: AuthSession | null;
  /** The organization the current user belongs to */
  organization: Organization | null;
  /** True while session is being loaded from storage */
  loading: boolean;
  /** Check if current user can perform an action on a resource */
  can: (resource: Resource, action: Action) => boolean;
  /** Check if current user can access a route path */
  canRoute: (path: string) => boolean;
  /** Attempt login */
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  /** Logout and clear session */
  logout: () => void;
  /** Primary role of the current user */
  primaryRole: Role | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session from storage on mount
  useEffect(() => {
    const stored = getSession();
    setSession(stored);
    setLoading(false);
  }, []);

  // Derive organization from session
  const organization: Organization | null = session
    ? {
        id: session.organizationId,
        name: org.name,
        slug: org.slug,
        revenueTarget: org.revenueTarget,
        utilizationTarget: org.utilizationTarget,
        createdAt: org.createdAt,
      }
    : null;

  const primaryRole: Role | null = session?.roles?.[0] ?? null;

  const can = useCallback(
    (resource: Resource, action: Action): boolean => {
      if (!session) return false;
      return checkPermission(session.roles as Role[], resource, action);
    },
    [session],
  );

  const canRoute = useCallback(
    (path: string): boolean => {
      if (!session) return false;
      return canAccessRoute(session.roles as Role[], path);
    },
    [session],
  );

  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResult> => {
    const result = await mockLogin(credentials);
    if (result.success && result.session) {
      setSession(result.session);
      try {
        const { useActivityLogStore } = require('@/lib/store/activityLogStore');
        useActivityLogStore.getState().addLog({
          userId: result.session.userId,
          userName: result.session.name,
          userRole: result.session.roles[0],
          module: 'AUTH',
          action: 'LOGIN',
          details: `Pengguna ${result.session.name} (${result.session.email}) berhasil masuk ke sistem.`,
        });
      } catch (e) {}
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    if (session) {
      try {
        const { useActivityLogStore } = require('@/lib/store/activityLogStore');
        useActivityLogStore.getState().addLog({
          userId: session.userId,
          userName: session.name,
          userRole: session.roles[0],
          module: 'AUTH',
          action: 'LOGOUT',
          details: `Pengguna ${session.name} telah keluar dari sistem (Logout).`,
        });
      } catch (e) {}
    }

    try {
      const { supabase, isSupabaseConfigured } = require('@/lib/supabaseClient');
      if (isSupabaseConfigured()) {
        supabase.auth.signOut().catch(() => {});
      }
    } catch (e) {}

    clearSession();
    setSession(null);
    router.push('/login');
  }, [session, router]);

  const value: AuthContextValue = {
    session,
    organization,
    loading,
    can,
    canRoute,
    login,
    logout,
    primaryRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

/** Convenience hook — throws if not authenticated */
export function useRequiredAuth(): AuthContextValue & { session: AuthSession } {
  const auth = useAuth();
  if (!auth.session && !auth.loading) {
    throw new Error('useRequiredAuth: no session');
  }
  return auth as AuthContextValue & { session: AuthSession };
}
