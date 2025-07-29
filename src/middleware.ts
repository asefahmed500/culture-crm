
// src/middleware.ts
export { default } from "next-auth/middleware"

export const config = { 
    // The following routes are defined as public routes.
    // Please note that this is a simplified regex and may need to be updated.
    // For more information, see: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ['/((?!api/auth|login|signup|_next/static|_next/image|favicon.ico|$).*)']
};
