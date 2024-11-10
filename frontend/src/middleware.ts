import { NextRequest, NextResponse } from 'next/server';
import Cookies from 'js-cookie';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Define the paths that require authentication
  const protectedPaths = ['/', '/blocks/', '/tx/', '/address/'];

  // Check if email and access_token cookies exist
  const email = req.cookies.get('email')?.value;
  const accessToken = req.cookies.get('access_token')?.value;

  // If cookies are missing, restrict access to only /login and /registration
  if (!email || !accessToken) {
    if (pathname !== '/login' && pathname !== '/registration') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  } else {
    // Check if the request path is not allowed for authenticated users
    const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));
    if (!isProtectedRoute && pathname !== '/login' && pathname !== '/registration') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

// Define the routes where the middleware should run
export const config = {
  matcher: [
    '/',
    '/blocks/:blockId*',
    '/tx/:transactionHash*',
    '/address/:addressId*',
    '/login',
    '/registration',
  ],
};
