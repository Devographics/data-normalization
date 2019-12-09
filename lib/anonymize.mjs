import path from 'path'
import { createReadStream } from 'fs'
import crypto from 'crypto'
import assert from 'assert'
import _ from 'lodash'
import * as fieldTypes from './field_types.mjs'
import { countFileLines, unlink } from './fs.mjs'
import { chunksToLine, ndJsonFromAsyncIterator, ndJsonToObject, writeIterableToFile } from './streams.mjs'

export const encrypt = (text) => {
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(process.env.ENCRYPTION_KEY),
        'stateofjsstateof'
    )
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])

    return encrypted.toString('hex')
}

async function* anonymize(responseCount, responsesIterable) {
    let anonymizedCount = 0
    for await (const response of responsesIterable) {
        const anonymized = _.omit(response, [`user_info.${fieldTypes.FIELD_TYPE_EMAIL}`])
        if (response.user_info[fieldTypes.FIELD_TYPE_EMAIL]) {
            anonymized.user_info.hash = encrypt(response.user_info[fieldTypes.FIELD_TYPE_EMAIL])
        }
        yield anonymized

        anonymizedCount++
        if (anonymizedCount % 1000 === 0) {
            console.log(`> ${anonymizedCount}/${responseCount}`)
        }
    }
    console.log(`> ${anonymizedCount}/${responseCount}`)
}

/**
 * Anonymize survey responses, removing emails from results.
 */
export const anonymizeResponses = async (survey) => {
    const surveyName = `state_of_${survey.survey}_${survey.year}`
    const responsesFile = path.join('data', 'normalized_responses', `${surveyName}_normalized_responses.ndjson`)
    const anonResponsesFile = path.join('data', 'normalized_responses_anon', `${surveyName}_normalized_responses_anon.ndjson`)

    const responsesReader = createReadStream(responsesFile, { encoding: 'utf8' })
    const responseCount = await countFileLines(responsesFile)

    console.log(`[${surveyName}] anonymizing ${responseCount} responses from '${responsesFile}'`)

    try {
        await unlink(anonResponsesFile)
    } catch {}

    await writeIterableToFile(
        ndJsonFromAsyncIterator(
            anonymize(
                responseCount,
                ndJsonToObject(
                    chunksToLine(responsesReader)
                )
            )
        ),
        anonResponsesFile
    )

    const anonymizedCount = await countFileLines(anonResponsesFile)
    assert.strictEqual(anonymizedCount, responseCount)
    console.log(surveyName, `line count matches responses count (${anonymizedCount}), all good!`)
}