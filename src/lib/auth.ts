import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import MongoManager from './mongodb'
import { User, SessionPayload, USERS_COLLECTION } from './interfaces'

export { verifyToken, getCookieName } from './auth-edge'
export type { SessionPayload }

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')

export const verifyPassword = async (username: string, password: string): Promise<string | null> => {
    const user = await MongoManager.instance.getDocument(USERS_COLLECTION, { username })

    if (!user) {
        return null
    }

    const isValid = await bcrypt.compare(password, user.passwordHash as string)
    return isValid ? user._id.toString() : null
}

export const createSession = async (userId: string): Promise<string> => {
    const sessionId = crypto.randomUUID()

    const token = await new SignJWT({ sessionId, userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('30d')
        .sign(JWT_SECRET)

    return token
}

export const getSession = async (): Promise<SessionPayload | null> => {
    const cookieStore = await cookies()
    const token = cookieStore.get('vocab-session')?.value

    if (!token) {
        return null
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        return payload as unknown as SessionPayload
    } catch {
        return null
    }
}
