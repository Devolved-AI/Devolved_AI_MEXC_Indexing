import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const protectedPaths = [
    '/myaccount', 
    '/myverify_address', 
    '/verifycontract', 
    '/verifyContract-solc-multiple'
  ];

  // Check if email and access_token cookies exist
  const accessToken = req.cookies.get('access_token')?.value;

  // If cookies are missing, restrict access to only /login and /registration
  if (!accessToken) {
    if (pathname !== '/registration') {
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
    '/myaccount',
    '/myverify_address',
    '/verifycontract',
    // '/verifyContract-solc-multiple/:addressId*',
    '/verifyContract-solc-multiple',
    // '/contract-address/:id',
  ],
};