import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decryptSession } from './lib/auth';

export async function middleware(request: NextRequest) {
  const encryptedToken = request.cookies.get('session')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';
  
  // Validate the session by attempting to decrypt it
  let isValidSession = false;
  
  if (encryptedToken) {
    try {
      // Attempt to decrypt the session token (now async)
      const decryptedToken = await decryptSession(encryptedToken);
      isValidSession = !!decryptedToken;
    } catch (error) {
      // If decryption fails, session is invalid
      console.error('Session validation error:', error);
      isValidSession = false;
    }
  }
  
  // If user is not authenticated and trying to access a protected route, redirect to login
  if (!isValidSession && !isLoginPage) {
    const loginUrl = new URL('/login', request.url);
    // Add the redirectTo parameter to redirect back after login
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If user is authenticated and trying to access login page, redirect to home
  if (isValidSession && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Add the paths that should be protected
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /login 
     * 2. /_next (Next.js internals)
     * 3. /api/auth/* (authentication API routes)
     * 4. /static (static files)
     * 5. .*\\..* (files with extensions - e.g. favicon.ico)
     */
    '/((?!login|_next|api/auth|static|.*\\..*|favicon.ico).*)',
  ],
};