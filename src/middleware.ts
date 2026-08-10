/**
 * Next.js Middleware — Tenant & Auth Guard
 * ----------------------------------------
 * Runs on every matching request BEFORE the page renders.
 * Reads the `erp_session` cookie, validates it, and:
 *   - Redirects unauthenticated users to /login
 *   - Redirects authenticated users away from /login
 *   - Enforces role-based route access
 *
 * SWAP POINT: Replace cookie-based session reading with
 * `createServerClient(supabase)` session check for Supabase Auth.
 */

import { NextRequest, NextResponse } from 'next/server';
import { canAccessRoute } from '@/lib/permissions';
import { AuthSession, Role } from '@/lib/types';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

// Routes that require authentication
const PROTECTED_PREFIXES = [
  '/ceo', '/pm', '/team_member', '/finance', '/hr', '/crm'
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(prefix =>
    pathname === prefix || pathname.startsWith(prefix + '/')
  );
}

function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
}

function parseSession(cookie: string | undefined): AuthSession | null {
  if (!cookie) return null;
  try {
    const session: AuthSession = JSON.parse(decodeURIComponent(cookie));
    // Validate expiry
    if (!session.userId || !session.organizationId || !session.expiresAt) return null;
    if (new Date(session.expiresAt) <= new Date()) return null;
    return session;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('erp_session')?.value;
  const session = parseSession(sessionCookie);

  // 1. Redirect root to appropriate page
  if (pathname === '/') {
    if (session) {
      const defaultRoute = session.roles[0] === 'owner' ? '/ceo/dashboard'
        : session.roles[0] === 'pm' ? '/pm/dashboard'
        : session.roles[0] === 'ae' ? '/crm/dashboard'
        : session.roles[0] === 'finance' ? '/finance/dashboard'
        : session.roles[0] === 'hr' ? '/hr/dashboard'
        : session.roles[0] === 'team_member' ? '/team_member/dashboard'
        : '/ceo/dashboard'; // fallback for owner/admin
      return NextResponse.redirect(new URL(defaultRoute, request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Already logged in → redirect away from public routes
  if (isPublic(pathname) && session) {
    const defaultRoute = session.roles[0] === 'owner' ? '/ceo/dashboard'
      : session.roles[0] === 'pm' ? '/pm/dashboard'
      : session.roles[0] === 'ae' ? '/crm/dashboard'
      : session.roles[0] === 'finance' ? '/finance/dashboard'
      : session.roles[0] === 'hr' ? '/hr/dashboard'
      : session.roles[0] === 'team_member' ? '/team_member/dashboard'
      : '/ceo/dashboard';
    return NextResponse.redirect(new URL(defaultRoute, request.url));
  }

  // 3. Not logged in → redirect to login
  if (isProtected(pathname) && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Logged in — check role-based route access
  if (isProtected(pathname) && session) {
    const roles = session.roles as Role[];
    if (!canAccessRoute(roles, pathname)) {
      // Redirect to their default page instead of showing 403
      const primaryRole = roles[0];
      const fallback = primaryRole === 'owner' ? '/ceo/dashboard'
        : primaryRole === 'pm' ? '/pm/dashboard'
        : primaryRole === 'ae' ? '/crm/dashboard'
        : primaryRole === 'finance' ? '/finance/dashboard'
        : primaryRole === 'hr' ? '/hr/dashboard'
        : primaryRole === 'team_member' ? '/team_member/dashboard'
        : '/ceo/dashboard';
      return NextResponse.redirect(new URL(fallback, request.url));
    }

    // Inject organizationId as a request header for server components
    const response = NextResponse.next();
    response.headers.set('x-organization-id', session.organizationId);
    response.headers.set('x-user-id', session.userId);
    response.headers.set('x-user-roles', session.roles.join(','));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
