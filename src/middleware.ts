import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: any) {
  const token = await getToken({ req: request })
  
  // Only protect application routes for authenticated users
  if (token && request.nextUrl.pathname.startsWith('/apply')) {
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/user/:path*",
    "/dashboard/:path*",
  ],
};