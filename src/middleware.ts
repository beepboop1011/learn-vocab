import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, getCookieName } from '@/lib/auth-edge'

export const middleware = async (request: NextRequest) => {
    const { pathname } = request.nextUrl

    // Allow access to login page and API routes for auth
    if (pathname === '/login' || pathname === '/api/auth') {
        return NextResponse.next()
    }

    // Check for valid session
    const token = request.cookies.get(getCookieName())?.value

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    const session = await verifyToken(token)

    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/', '/api/words/:path*']
}
