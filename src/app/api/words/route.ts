import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import MongoManager from '@/lib/mongodb'
import { WORDS_COLLECTION, LEARNED_WORDS_COLLECTION, LearnedWord } from '@/lib/interfaces'

const getTodayRangeET = (): { start: Date, end: Date } => {
    const now = new Date()
    const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
    const start = new Date(et)
    start.setHours(0, 0, 0, 0)
    const end = new Date(et)
    end.setHours(23, 59, 59, 999)

    // Convert back to UTC by applying the offset
    const offsetMs = et.getTime() - now.getTime()
    return {
        start: new Date(start.getTime() - offsetMs),
        end: new Date(end.getTime() - offsetMs),
    }
}

export const GET = async () => {
    try {
        const session = await getSession()

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { start, end } = getTodayRangeET()

        // Get all word IDs the user has ever learned
        const allLearned = await MongoManager.instance.getDocuments(
            LEARNED_WORDS_COLLECTION,
            { userId: session.userId }
        ) as LearnedWord[]
        const learnedWordIds = allLearned.map((lw) => lw.wordId)

        // Check if the user already has words learned today
        const todayLearned = allLearned.filter(lw => lw.learnedAt >= start && lw.learnedAt <= end)
        const previousLearned = allLearned.filter(lw => lw.learnedAt < start)

        let words
        if (todayLearned.length > 0) {
            const todayWordIds = todayLearned.map((lw) => lw.wordId)
            words = await MongoManager.instance.getDocuments(
                WORDS_COLLECTION,
                { _id: { $in: todayWordIds } },
            )
        } else {
            // Pick 2 random new words the user hasn't learned yet
            words = await MongoManager.instance.getRandomDocuments(
                WORDS_COLLECTION,
                { _id: { $nin: learnedWordIds } },
                2,
            )

            // Mark these words as learned today
            if (words.length > 0) {
                const learnedEntries = words.map((word) => ({
                    userId: session.userId,
                    wordId: word._id,
                    learnedAt: new Date(),
                }))

                try {
                    await MongoManager.instance.insertDocuments(LEARNED_WORDS_COLLECTION, learnedEntries, { ordered: false })
                } catch {
                    // Ignore duplicate key errors (in case of race conditions)
                }
            }
        }

        // Get previously learned words (before today)
        const previousWordIds = previousLearned.map((lw) => lw.wordId)
        let previousWords: any[] = []
        if (previousLearned.length > 0) {
            const learnedAtMap = new Map(previousLearned.map((lw) => [lw.wordId.toString(), lw.learnedAt]))
            const docs = await MongoManager.instance.getDocuments(WORDS_COLLECTION, { _id: { $in: previousWordIds } })
            previousWords = docs.map((doc) => ({
                ...doc,
                learnedAt: learnedAtMap.get(doc._id.toString()),
            }))
        }

        return NextResponse.json({ words, previousWords })
    } catch (error) {
        console.error('Words API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
