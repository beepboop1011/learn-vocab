import { isWordUsedCorrectly } from '@/lib/ai/gemini'
import { getSession } from '@/lib/auth'
import { ZSentenceCheckSchema } from '@/lib/schemas'
import { NextResponse } from 'next/server'

export const POST = async (request: Request) => {
    try {
        const session = await getSession()

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { success, data, error } = ZSentenceCheckSchema.safeParse(body)

        if (!success) {
            console.error(error)
            return NextResponse.json(
                { error: error },
                { status: 400 }
            )
        }

        const analysisResult = await isWordUsedCorrectly(data.word, data.sentence)
        if (!analysisResult) {
            throw new Error('Error while trying to analzye sentence with gemini')
        }

        return NextResponse.json(analysisResult)
    } catch (error) {
        console.error('Words sentence check API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}