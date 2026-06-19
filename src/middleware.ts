import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { isVtiEmail } from '@/lib/auth';

const publicRoutes = ['/login', '/auth/callback'];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/audio') ||
    pathname.startsWith('/physics') ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.png'
  ) {
    return supabaseResponse;
  }

  const hasVtiEmail = user && isVtiEmail(user.email);

  if ((!user || !hasVtiEmail) && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';

    if (pathname !== '/') {
      url.searchParams.set('redirectTo', pathname);
    }

    if (user && !hasVtiEmail) {
      url.searchParams.set('error', 'invalid_domain');
    }

    return NextResponse.redirect(url);
  }

  if (hasVtiEmail && (pathname === '/login' || pathname === '/')) {
    return NextResponse.redirect(new URL('/game', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|icon.png|.*\\..*).*)',
  ],
};