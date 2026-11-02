import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirect root to default locale (ne)
  const url = request.nextUrl.clone();
  if (url.pathname === '/' ) {
    url.pathname = '/ne';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};

