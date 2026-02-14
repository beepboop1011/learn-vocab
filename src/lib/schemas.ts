import z from 'zod'

export const ZSentenceAnalysisSchema = z.object({
    result: z.boolean().describe('Whether or not the word was used correctly'),
    reason: z.string().describe('If the word was not used correctly, what was wrong about the use of the word. Speak in simple words and limit to 2 sentences maximum'),
    fixedSentence: z.string().describe('A revised sentence using the word correctly, retaining as much meaning of the original as possible')
})

export type ZSentenceAnalysis = z.infer<typeof ZSentenceAnalysisSchema>

export const ZSentenceCheckSchema = z.object({
    word: z.string(),
    sentence: z.string(),
    language: z.string().default('en')
})

export type ZSentenceCheck = z.infer<typeof ZSentenceCheckSchema>
