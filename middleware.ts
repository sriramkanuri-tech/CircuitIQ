import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = request.cookies.get('circuitiq_session_token')?.value;
  const userRole = request.cookies.get('circuitiq_role')?.value;

  const isAuth = Boolean(sessionToken);

  // Student protected routes
  const protectedStudentRoutes = [
    '/dashboard',
    '/my-courses',
    '/quiz',
    '/final-assessment',
    '/results',
    '/profile',
    '/settings',
  ];

  const isStudentRoute = protectedStudentRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Special case: /certificates is student protected, but /certificates/[id] or public /verify is open
  const isCertificatesList = pathname === '/certificates';

  // Admin protected routes
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  // If user is trying to access protected routes without a session, redirect to /login
  if ((isStudentRoute || isCertificatesList || isAdminRoute) && !isAuth) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is trying to access admin routes but does not have ADMIN or SUPER_ADMIN role
  if (isAdminRoute && isAuth && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If already authenticated and visiting login or register, redirect to appropriate portal
  if (isAuth && (pathname === '/login' || pathname === '/register')) {
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/my-courses/:path*',
    '/quiz/:path*',
    '/final-assessment/:path*',
    '/results/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/certificates',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
