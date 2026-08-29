import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isLoggedIn = request.cookies.get('is_admin_logged_in')?.value;
  const pathname = request.nextUrl.pathname;

  const isAdminPage = pathname.startsWith('/admin');

  // Jika mencoba akses halaman admin tanpa token & session admin
  if (isAdminPage && (!isLoggedIn || !token || token.trim().length < 10)) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
