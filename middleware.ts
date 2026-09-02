import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/', '/login', '/signup', '/onboard', '/join', '/sign-out', '/oauth/denied', '/oauth/consent'];
const authApiPath = '/api/auth';

function isPublic(pathname: string): boolean {
  if (publicPaths.includes(pathname)) return true;
  if (pathname === '/.well-known/openid-configuration' || pathname === '/.well-known/oauth-authorization-server') return true;
  if (pathname.startsWith(authApiPath)) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Lightweight cookie-based check at the edge layer.
  // Server pages and API routes still perform full session validation via Better Auth.
  const sessionToken = request.cookies.get('better-auth.session_token')
    ?? request.cookies.get('__Secure-better-auth.session_token');
  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
