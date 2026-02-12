import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { readFileSync } from 'fs'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import MongoManager from '../lib/mongodb'
import { Word, WORDS_COLLECTION } from '../lib/interfaces'

interface Args {
    file: string
}

const main = async () => {
    const argv = await yargs(hideBin(process.argv))
        .option('file', {
            alias: 'f',
            type: 'string',
            description: 'Path to a JSON file containing words',
            demandOption: true,
        })
        .help()
        .parse() as Args

    const { file } = argv

    let rawWords: Omit<Word, '_id' | 'createdAt'>[]
    try {
        const content = readFileSync(file, 'utf-8')
        rawWords = JSON.parse(content)
    } catch (error) {
        console.error(`Failed to read or parse "${file}":`, error)
        process.exit(1)
    }

    if (!Array.isArray(rawWords) || rawWords.length === 0) {
        console.error('File must contain a non-empty JSON array of words')
        process.exit(1)
    }

    try {
        const incomingWords = rawWords.map(w => w.word)
        const existing = await MongoManager.instance.getDocuments(WORDS_COLLECTION, { word: { $in: incomingWords } })
        const existingWords = new Set(existing.map(doc => doc.word))

        const newWords = rawWords.filter(w => !existingWords.has(w.word))

        if (existingWords.size > 0) {
            console.log(`Skipping ${existingWords.size} words that already exist`)
        }

        if (newWords.length === 0) {
            console.log('No new words to import')
            return
        }

        const docs = newWords.map(w => ({
            ...w,
            createdAt: new Date(),
        }))

        const insertedCount = await MongoManager.instance.insertDocuments(WORDS_COLLECTION, docs)
        console.log(`Inserted ${insertedCount} of ${rawWords.length} words`)
    } catch (error) {
        console.error('Error importing words:', error)
        process.exit(1)
    } finally {
        await MongoManager.instance.disconnect()
    }
}

main()
