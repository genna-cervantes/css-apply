import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const pathname = request.nextUrl.pathname

  if (!token && (pathname.startsWith('/user') || pathname.startsWith('/admin'))) {
    const url = new URL('/auth/signin', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  if (token && pathname.startsWith('/admin')) {
    if (pathname.startsWith('/admin/super-admin')) {
      const isSuperAdmin = token.role === 'super_admin'
      
      if (!isSuperAdmin) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }
    else {
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
    '/user/:path*',
    '/admin/:path*',
    '/apply/:path*',
    '/dashboard/:path*',
  ],
}