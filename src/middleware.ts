import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    // This middleware is now primarily for augmenting the request.
    // The authorization logic is handled by the `authorized` callback and the matcher.
    return NextResponse.next();
  },
  {
    callbacks: {
      // The `authorized` callback determines if a user is allowed to access the matched routes.
      // If a token exists, they are authorized.
      authorized: ({ token }) => !!token,
    },
  }
);

// The `config` object specifies which routes the middleware will run on.
export const config = {
  // This matcher protects all routes EXCEPT for the ones specified in the negative lookahead.
  // It protects all application pages and API endpoints by default.
  matcher: [
    '/dashboard/:path*',
    '/import/:path*',
    '/customers/:path*',
    '/segments/:path*',
    '/analytics/:path*',
    '/export/:path*',
    '/settings/:path*',
    '/api/((?!auth|qloo).*)', // Protect all API routes except auth and qloo
  ],
};
