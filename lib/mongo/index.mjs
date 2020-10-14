import * as Mongo from 'mongodb'
import path from 'path'
import { createReadStream, createWriteStream } from 'fs'
import { countFileLines } from '../fs.mjs'
import { chunksToLine, ndJsonToObject } from '../streams.mjs'
const { MongoClient } = Mongo.default
export { normalizeMongoResponses } from './normalize_mongo_responses.mjs'
import { NORMALIZED_MONGO_COLLECTION } from '../config.mjs'

const BATCH_SIZE = 200

export const getClient = () => {
    return new MongoClient(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 1000,
    })
}

export const getCollection = async (client, collectionName) => {
    await client.connect()
    const db = client.db(process.env.MONGO_DB_NAME)

    return db.collection(collectionName)
}

const saveResponses = async (collection, responseCount, responsesIterator) => {
    let currentBatch = []
    let savedCount = 0
    for await (const response of responsesIterator) {
        currentBatch.push(response)
        if (currentBatch.length === BATCH_SIZE) {
            await collection.insertMany(currentBatch)
            savedCount += currentBatch.length
            currentBatch = []
            console.log(`inserted ${savedCount}/${responseCount} responses`)
        }
    }
    if (currentBatch.length > 0) {
        await collection.insertMany(currentBatch)
        savedCount += currentBatch.length
        console.log(`inserted ${savedCount}/${responseCount} responses`)
    }
}

export const cleanupMongoResponses = async (filter = {}) => {
    const client = getClient()
    const collection = await getCollection(client, NORMALIZED_MONGO_COLLECTION)

    await collection.deleteMany(filter)

    await client.close()
}

export const saveResponsesToMongo = async (survey) => {
    const surveyName = `state_of_${survey.survey}_${survey.year}`
    const responsesFile = path.join(
        'data',
        'normalized_responses',
        `${surveyName}_normalized_responses.ndjson`
    )

    const responseCount = await countFileLines(responsesFile)

    console.log(
        `[${surveyName}] saving ${responseCount} responses to mongo from '${responsesFile}'`
    )

    const client = getClient()
    const collection = await getCollection(client, NORMALIZED_MONGO_COLLECTION)

    const responsesReader = createReadStream(responsesFile, { encoding: 'utf8' })

    await saveResponses(collection, responseCount, ndJsonToObject(chunksToLine(responsesReader)))

    await client.close()
}

export const fetchMongoResponses = async (survey) => {
    const surveyName = `state_of_${survey.survey}_${survey.year}`

    const client = getClient()
    const collection = await getCollection(client, 'responses')

    const filename = path.join('data', 'raw_responses', `${surveyName}_raw_responses.ndjson`)
    const output = createWriteStream(filename)

    let savedCount = 0

    const cursor = collection.find()
    for await (let response of cursor) {
        await output.write(`${JSON.stringify(response)}\n`)
        savedCount++

        if (savedCount % 1000 === 0) {
            console.log(`> saved ${savedCount} responses`)
        }
    }

    await output.end()

    const lineCount = await countFileLines(filename)
    console.log(surveyName, `saved ${lineCount} responses!`)

    await client.close()
}
