
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    // This is a placeholder for any future logic that needs the user's session.
    // For now, we can just return a NextResponse.next() to continue the request chain.
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // This callback determines if the user is authorized.
        // If there's a token, they are authorized.
        return !!token;
      },
    },
  }
);

// This config specifies which routes are protected by the middleware.
export const config = {
  // The matcher protects all routes except for the public ones specified.
  matcher: [
    // Protect all routes under these paths
    '/dashboard/:path*',
    '/import/:path*',
    '/customers/:path*',
    '/segments/:path*',
    '/analytics/:path*',
    '/export/:path*',
    '/settings/:path*',
    
    // Protect all API routes except for the auth ones
    '/api/((?!auth).*)',
  ],
};
