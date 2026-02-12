import { NextResponse } from 'next/server'
import { verifyPassword, createSession, getCookieName } from '@/lib/auth'

export const DELETE = async () => {
    const response = NextResponse.json({ success: true })
    response.cookies.set(getCookieName(), '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    })
    return response
}

export const POST = async (request: Request) => {
    try {
        const { username, password } = await request.json()

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            )
        }

        const userId = await verifyPassword(username, password)

        if (!userId) {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            )
        }

        const token = await createSession(userId)

        const response = NextResponse.json({ success: true })
        response.cookies.set(getCookieName(), token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        })

        return response
    } catch (error) {
        console.error('Auth error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
