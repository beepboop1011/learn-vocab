import { ObjectId } from 'mongodb'

export type LangCode =  'en' | 'ru' | 'kk'

export type TranslatedText = {
    [key in LangCode]: string
}

export interface Word {
    _id: ObjectId
    word: string
    definition: string
    pronunciation: string
    examples: TranslatedText[]
    translations: TranslatedText
    createdAt: Date
}

export interface WordWithLearnedDate extends Word {
    learnedAt: Date | string
}

export interface LearnedWord {
    _id: ObjectId
    userId: ObjectId
    wordId: ObjectId
    learnedAt: Date
}

export interface User {
    _id: ObjectId
    passwordHash: string
    username: string
    createdAt: Date
}

export interface SessionPayload {
    sessionId: string
    userId: string
    exp: number
}

export const WORDS_COLLECTION = 'words'
export const LEARNED_WORDS_COLLECTION = 'learned_words'
export const USERS_COLLECTION = 'users'
