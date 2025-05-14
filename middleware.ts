import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/attendance-admin') || path.startsWith('/attendance-admin-dashboard')) {
    const adminAuthenticated = request.cookies.get('adminAuthenticated')?.value === 'true';
    
    if (!adminAuthenticated && path === '/attendance-admin-dashboard') {
      return NextResponse.redirect(new URL('/attendance-admin', request.url));
    }
  }
  
  if (path.startsWith('/attendance')) {
    const response = NextResponse.next();
    
    response.headers.set('X-Frame-Options', 'DENY');  
    response.headers.set('X-Content-Type-Options', 'nosniff');  
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');  
    response.headers.set('X-XSS-Protection', '1; mode=block');  
    
    response.headers.set('Content-Security-Policy', 
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://*.yourapi.com;"
    );
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/attendance-admin/:path*', '/attendance-admin-dashboard/:path*', '/attendance', '/attendance/:path*'],
};