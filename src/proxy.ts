import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { isVtiEmail } from '@/lib/auth';

const publicRoutes = ['/login', '/auth/callback'];

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  // Allow static assets, favicon, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/audio') ||
    pathname.startsWith('/physics') ||
    pathname === '/favicon.ico'
  ) {
    return supabaseResponse;
  }

  const hasVtiEmail = user && isVtiEmail(user.email);

  // Redirect unauthenticated users or users with invalid email domains to login
  if ((!user || !hasVtiEmail) && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    if (pathname !== '/') {
      url.searchParams.set('redirectTo', pathname);
    }
    // If user is logged in but has an invalid domain, show the invalid_domain error
    if (user && !hasVtiEmail) {
      url.searchParams.set('error', 'invalid_domain');
    }
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login or root to game page
  if (hasVtiEmail && (pathname === '/login' || pathname === '/')) {
    return NextResponse.redirect(new URL('/game', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
