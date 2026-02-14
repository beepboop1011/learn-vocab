import { GoogleGenAI } from "@google/genai"
import z from "zod"
import { ZSentenceAnalysis, ZSentenceAnalysisSchema } from "@/lib/schemas"

export const isWordUsedCorrectly = async (word: string, sentence: string, model: string = 'gemini-2.5-flash'): Promise<ZSentenceAnalysis | undefined> => {
    const genAi = new GoogleGenAI({}) // API key read from env var

    const resp = await genAi.models.generateContent({
        model: model,
        contents: `Is the word "${word}" used correctly in this sentence: "${sentence}"? Do not be strict, if it is fairly close just return correct`,
        config: {
            responseMimeType: 'application/json',
            responseJsonSchema: z.toJSONSchema(ZSentenceAnalysisSchema)
        }
    })

    const { success, data, error } = ZSentenceAnalysisSchema.safeParse(JSON.parse(resp.text!))

    if (!success) {
        console.error(error)
        return
    }

    return data
}
