import path from 'path'
import { createReadStream } from 'fs'
import assert from 'assert'
import { countFileLines, unlink } from '../fs.mjs'
import {
    writeIterableToFile,
    chunksToLine,
    ndJsonToObject,
    ndJsonFromAsyncIterator,
} from '../streams.mjs'
import { normalizeMongoResponse } from './normalize_mongo_response.mjs'

async function* normalize(survey, responseCount, rawResponseIterable) {
    let normalizedCount = 0
    for await (const rawResponse of rawResponseIterable) {
        const normalized = normalizeMongoResponse(survey, rawResponse)
        yield normalized

        normalizedCount++
        if (normalizedCount % 1000 === 0) {
            console.log(`> ${normalizedCount}/${responseCount}`)
        }
    }
    console.log(`> ${normalizedCount}/${responseCount}`)
}

/**
 * Normalize raw mongo responses.
 */
export const normalizeMongoResponses = async (survey) => {
    const surveyName = `state_of_${survey.survey}_${survey.year}`

    const sourceFilePath = path.join('data', 'raw_responses', `${surveyName}_raw_responses.ndjson`)
    const destFilePath = path.join(
        'data',
        'normalized_responses',
        `${surveyName}_normalized_responses.ndjson`
    )

    try {
        await unlink(destFilePath)
    } catch {}

    const rawResponsesReader = createReadStream(sourceFilePath, { encoding: 'utf8' })
    const responseCount = await countFileLines(sourceFilePath)

    await writeIterableToFile(
        ndJsonFromAsyncIterator(
            normalize(survey, responseCount, ndJsonToObject(chunksToLine(rawResponsesReader)))
        ),
        destFilePath
    )

    const normalizedCount = await countFileLines(destFilePath)
    assert.strictEqual(normalizedCount, responseCount)
    console.log(surveyName, `line count matches responses count (${normalizedCount}), all good!`)
}
