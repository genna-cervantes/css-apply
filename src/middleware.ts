import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { authRateLimit } from '@/lib/rate-limit'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Apply rate limiting to auth endpoints
  if (pathname.startsWith('/api/auth')) {
    const rateLimitResult = authRateLimit(request);
    
    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({
          error: "Too many authentication attempts. Please try again later.",
          retryAfter: Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime!.toString(),
          },
        }
      );
    }
  }

  const token = await getToken({
    req: request,
    // Match custom cookie name set in auth options to ensure middleware reads it in production
    cookieName: 'next-auth.session-token',
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Skip middleware for auth-related paths (after rate limiting)
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // If user is authenticated and trying to access home page, redirect to appropriate dashboard
  if (token && (pathname === '/' || pathname === '')) {
    // Redirect based on role
    if (token.role === 'super_admin') {
      return NextResponse.redirect(new URL('/admin/super-admin', request.url))
    } else if (token.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    } else {
      return NextResponse.redirect(new URL('/user', request.url))
    }
  }

  // If user is authenticated and trying to access signin page, redirect to appropriate dashboard
  if (token && pathname.startsWith('/auth/signin')) {
    // Redirect based on role
    if (token.role === 'super_admin') {
      return NextResponse.redirect(new URL('/admin/super-admin', request.url))
    } else if (token.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    } else {
      return NextResponse.redirect(new URL('/user', request.url))
    }
  }

  // Check if user is trying to access protected routes without authentication
  if (!token && (pathname.startsWith('/user') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Admin route protection
  if (token && pathname.startsWith('/admin')) {
    // Super admin routes
    if (pathname.startsWith('/admin/super-admin')) {
      const isSuperAdmin = token.role === 'super_admin'
      // If not super admin, redirect to regular admin or user dashboard based on role
      if (!isSuperAdmin) {
        const redirectUrl = token.role === 'admin' ? '/admin' : '/user'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    } else { // Regular admin routes
      const hasAdminAccess = token.role === 'admin' || token.role === 'super_admin'
      
      if (!hasAdminAccess) {
        return NextResponse.redirect(new URL('/user', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/user/:path*',
    '/admin/:path*',
  ],
}