import path from 'path'
import * as elastic from 'elasticsearch'
import { createReadStream } from 'fs'
import { writeIterableToFile, chunksToLine, ndJsonToObject, ndJsonFromAsyncIterator } from '../streams.mjs'
import { countFileLines } from '../fs.mjs'

const SURVEYS_INDEX = 'surveys'
const RESPONSE_TYPE = 'responses'
const BATCH_SIZE = 200

export const client = new elastic.default.Client({
    host: 'http://localhost:9200',
    log: 'warning'
})

export const createIndex = async () => client.indices.create({
    index: SURVEYS_INDEX,
})

export const deleteIndex = async () => client.indices.delete({
    index: SURVEYS_INDEX,
})

export const recreateIndex = async () => {
    try {
        await deleteIndex()
    } catch (err) {
        // error occurs if the index doesn't exist,
        // which is the case on init
    }
    await createIndex()
    /*
    await client.indices.putMapping({
        index: SURVEYS_INDEX,
        body: {
            properties: {
                year: {
                    type: 'integer'
                }
            }
        }
    })
    */
}

const bulkInsert = async (type, items) => {
    return client.bulk({
        body: items.reduce((acc, item) => {
            acc.push({
                index: {
                    _index: SURVEYS_INDEX,
                    _type: type,
                }
            })
            acc.push(item)

            return acc
        }, [])
    })
}

const indexResponses = async (responsesIterator, responseCount) => {
    let currentBatch = []
    let indexedCount = 0
    for await (const response of responsesIterator) {
        currentBatch.push(response)
        if (currentBatch.length === BATCH_SIZE) {
            await bulkInsert(RESPONSE_TYPE, currentBatch)
            indexedCount += currentBatch.length
            currentBatch = []
            console.log(`indexed ${indexedCount}/${responseCount} responses`)
        }
    }
    if (currentBatch.length > 0) {
        await bulkInsert('surveys', currentBatch)
        indexedCount += currentBatch.length
        console.log(`indexed ${indexedCount}/${responseCount} responses`)
    }
}

export const indexSurveyResponses = async (survey) => {
    const surveyName = `state_of_${survey.survey}_${survey.year}`
    const responsesFile = path.join('data', 'normalized_responses', `${surveyName}_normalized_responses.ndjson`)

    const responseCount = await countFileLines(responsesFile)

    console.log(`[${surveyName}] indexing ${responseCount} responses from '${responsesFile}'`)

    await indexResponses(
        ndJsonToObject(
            chunksToLine(responsesReader)
        ),
        responseCount
    )

    const responsesReader = createReadStream(responsesFile, { encoding: 'utf8' })
}