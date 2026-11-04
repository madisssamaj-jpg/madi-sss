import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // 1. Root redirect to default locale (/ne)
  if (pathname === '/') {
    url.pathname = '/ne';
    return NextResponse.redirect(url);
  }

  // 2. Admin Route Protection
  const adminMatch = pathname.match(/^\/(ne|en)\/admin(?:\/(.*))?$/);
  if (adminMatch) {
    const lang = adminMatch[1];
    const subpath = adminMatch[2] || '';

    // Allow login page publicly
    if (subpath === 'login' || subpath.startsWith('login/')) {
      return NextResponse.next();
    }

    // Require session cookie for all other admin routes
    const sessionCookie = request.cookies.get('madi_admin_session')?.value;
    if (!sessionCookie) {
      url.pathname = `/${lang}/admin/login`;
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  // 3. Security Headers for all responses
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: ['/', '/:lang/admin/:path*'],
};
