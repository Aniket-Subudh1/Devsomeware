import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/attendance-admin') || path.startsWith('/attendance-admin-dashboard')) {
    // Check for admin authentication in cookies or session
    const adminAuthenticated = request.cookies.get('adminAuthenticated')?.value === 'true';
    

    if (!adminAuthenticated && path === '/attendance-admin-dashboard') {
      return NextResponse.redirect(new URL('/attendance-admin', request.url));
    }
  }
  
  
  return NextResponse.next();
}


export const config = {
  matcher: ['/attendance-admin/:path*', '/attendance-admin-dashboard/:path*', '/attendance'],
};