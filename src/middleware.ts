import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('sat_session_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Proteksi Halaman Dashboard
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/structure') || pathname.startsWith('/events') || pathname.startsWith('/tools')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', encodeURIComponent(pathname));
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Redireksi Pengguna Berotentikasi dari Halaman Auth
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Tambahkan Security Headers pada Response
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/structure/:path*',
    '/events/:path*',
    '/tools/:path*',
    '/reports/:path*',
    '/login',
    '/register',
  ],
};
