import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import bcrypt from 'bcryptjs'
import MongoManager from '../lib/mongodb'
import { USERS_COLLECTION } from '../lib/interfaces'

interface Args {
    username: string
    password: string
}

const main = async () => {
    const argv = await yargs(hideBin(process.argv))
        .option('username', {
            alias: 'u',
            type: 'string',
            description: 'Username for the new user',
            demandOption: true,
        })
        .option('password', {
            alias: 'p',
            type: 'string',
            description: 'Password for the new user',
            demandOption: true,
        })
        .help()
        .parse() as Args

    const { username, password } = argv

    try {
        const existing = await MongoManager.instance.getDocument(USERS_COLLECTION, { username })
        if (existing) {
            console.error(`User "${username}" already exists`)
            process.exit(1)
        }

        const passwordHash = await bcrypt.hash(password, 10) // TODO better salt?
        const result = await MongoManager.instance.insertDocument(USERS_COLLECTION, { username, passwordHash, createdAt: new Date() })

        if (result) {
            console.log(`Created user "${username}"`)
        } else {
            console.log('Something went wrong trying to create the user, please try again')
        }
    } catch (error) {
        console.error('Error creating user:', error)
        process.exit(1)
    } finally {
        await MongoManager.instance.disconnect()
    }
}

main()
