import { jwtVerify } from 'jose'
import { SessionPayload } from './interfaces'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')
const COOKIE_NAME = 'vocab-session'

export type { SessionPayload }

export const verifyToken = async (token: string): Promise<SessionPayload | null> => {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        return payload as unknown as SessionPayload
    } catch {
        return null
    }
}

export const getCookieName = (): string => {
    return COOKIE_NAME
}
