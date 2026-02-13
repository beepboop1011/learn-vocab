import { MongoClient, Db, WithId, Document } from 'mongodb'

class MongoManager {
    private static _instance: MongoManager
    private client: MongoClient
    db: Db

    private constructor() {
        const uri = process.env.MONGO_URI
        if (!uri) {
            throw new Error('Please define the MONGO_URI environment variable')
        }
        this.client = new MongoClient(uri)
        this.db = this.client.db('main')
    }

    static get instance(): MongoManager {
        if (!this._instance) {
            this._instance = new MongoManager()
        }
        return this._instance
    }

    public async getDocument(collName: string, query: Record<string, any>): Promise<WithId<Document> | null> {
        const collection = this.db.collection(collName)
        return collection.findOne(query)
    }

    public async getDocuments(
        collName: string,
        query: Record<string, any>,
        options?: { projection?: Record<string, number>, limit?: number },
    ): Promise<WithId<Document>[]> {
        const collection = this.db.collection(collName)
        let cursor = collection.find(query)
        if (options?.projection) {
            cursor = cursor.project(options.projection)
        }
        if (options?.limit) {
            cursor = cursor.limit(options.limit)
        }
        return cursor.toArray()
    }

    public async insertDocument(collName: string, document: Document): Promise<boolean> {
        const collection = this.db.collection(collName)
        const result = await collection.insertOne(document)
        return result.acknowledged
    }

    public async insertDocuments(
        collName: string,
        documents: Document[],
        options?: { ordered?: boolean },
    ): Promise<number> {
        const collection = this.db.collection(collName)
        const result = await collection.insertMany(documents, options)
        return result.insertedCount
    }

    public async updateDocument(collName: string, query: Record<string, any>, update: Record<string, any>): Promise<boolean> {
        const collection = this.db.collection(collName)
        const result = await collection.updateOne(query, { $set: update })
        return result.acknowledged
    }

    public async getRandomDocuments(
        collName: string,
        query: Record<string, any>,
        count: number,
    ): Promise<Document[]> {
        const collection = this.db.collection(collName)
        return collection.aggregate([
            { $match: query },
            { $sample: { size: count } },
        ]).toArray()
    }

    public async disconnect(): Promise<void> {
        await this.client.close()
    }
}

export default MongoManager
