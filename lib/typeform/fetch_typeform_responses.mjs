import { createWriteStream } from 'fs'
import assert from 'assert'
import * as path from 'path'
import axios from 'axios'
import _ from 'lodash'
import { countFileLines } from '../fs.mjs'

export const fetchTypeformResponses = async (survey) => {
    const surveyName = `state_of_${survey.survey}_${survey.year}`

    const filename = path.join('data', 'raw_responses', `${surveyName}_raw_responses.ndjson`)
    const output = createWriteStream(filename)

    const opts = {
        url: `https://api.typeform.com/forms/${survey.typeformId}/responses?page_size=1000&completed=true&before`,
        headers: {
            authorization: `bearer ${process.env.TYPEFORM_TOKEN}`,
        },
    }

    const fetchedResponseIds = []

    let results = (await axios.request(opts)).data
    let currentCount = 0

    const totalResponseCount = results.total_items

    console.log(surveyName, 'fetched initial responses')
    console.log(surveyName, 'total response count', totalResponseCount)

    for (const response of results.items) {
        // skipping duplicated response
        if (fetchedResponseIds.includes(response.response_id)) {
            continue
        }

        await output.write(`${JSON.stringify(response)}\n`)
        fetchedResponseIds.push(response.response_id)
        currentCount++
    }

    while (results.items.length > 0) {
        const lastToken = _.last(results.items).token
        results = (await axios.request({ ...opts, url: opts.url + `=${lastToken}` })).data
        console.log(surveyName, 'fetched', currentCount, 'responses on', totalResponseCount)

        for (const response of results.items) {
            // skipping duplicated response
            if (fetchedResponseIds.includes(response.response_id)) {
                continue
            }

            await output.write(`${JSON.stringify(response)}\n`)
            fetchedResponseIds.push(response.response_id)
            currentCount++
        }
    }

    await output.end()

    const lineCount = await countFileLines(filename)
    assert.strictEqual(currentCount, lineCount)
    console.log(surveyName, 'line count matches collected responses, all good!')
}
