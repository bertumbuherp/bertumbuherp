'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Resource, Action } from '@/lib/types';
import AccessDenied from './AccessDenied';

interface RouteGuardProps {
  children: React.ReactNode;
  /** If specified, user must have this permission to view children */
  resource?: Resource;
  action?: Action;
  /** Custom denied message */
  deniedMessage?: string;
}

/**
 * RouteGuard — wrap any page or section to enforce:
 * 1. Auth: redirect to /login if not authenticated
 * 2. RBAC: show <AccessDenied> if missing required permission
 *
 * Usage:
 *   <RouteGuard resource="finance" action="read">
 *     <FinancePage />
 *   </RouteGuard>
 */
export default function RouteGuard({
  children,
  resource,
  action = 'read',
  deniedMessage,
}: RouteGuardProps) {
  const { session, loading, can } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/login');
    }
  }, [loading, session, router]);

  // While loading session
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-page)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--red)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Memuat...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) return null; // redirect handled in useEffect

  // Permission check
  if (resource && !can(resource, action)) {
    return <AccessDenied message={deniedMessage} />;
  }

  return <>{children}</>;
}
