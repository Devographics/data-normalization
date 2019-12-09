import { createWriteStream } from 'fs'
import { once } from 'events'
import { promisify } from 'util'
import * as stream from 'stream'

const finished = promisify(stream.finished)

export async function writeIterableToFile(iterable, filepath) {
    const writable = createWriteStream(filepath, { encoding: 'utf8' })

    for await (const chunk of iterable) {
        if (!writable.write(chunk)) {
            // Handle backpressure
            await once(writable, 'drain')
        }
    }

    writable.end()
    // Wait until done. Throws if there are errors.
    await finished(writable)
}


export async function* chunksToLine(chunkIterable) {
    let previous = ''
    for await (const chunk of chunkIterable) {
        previous += chunk
        while (true) {
            const eolIndex = previous.indexOf('\n')
            if (eolIndex < 0) break

            // line includes the EOL
            const line = previous.slice(0, eolIndex + 1)
            yield line

            previous = previous.slice(eolIndex+1)
        }
    }
    if (previous.length > 0) {
        yield previous
    }
}

export async function* ndJsonToObject(lineIterable) {
    for await (const line of lineIterable) {
        const json = JSON.parse(line)
        yield json
    }
}

export async function* ndJsonFromAsyncIterator(jsonIterable) {
    for await (const json of jsonIterable) {
        yield `${JSON.stringify(json)}\n`
    }
}
