import dotenv from 'dotenv'
dotenv.config()
import program from 'commander'
import {
    extractTypeformConfig,
    fetchTypeformResponses,
    normalizeTypeformResponses,
} from './lib/typeform/index.mjs'
import {
    recreateIndex,
    indexSurveyResponses,
} from './lib/elastic/index.mjs'
import { anonymizeResponses } from './lib/anonymize.mjs'
import  {
    cleanupMongoResponses,
    saveResponsesToMongo,
    fetchMongoResponses,
    normalizeMongoResponses,
} from './lib/mongo/index.mjs'
import surveys from './conf/surveys.mjs'

const getSurveyConfig = (survey, year) => {
    const surveyConfig = surveys.find(s => {
        return s.survey === survey && s.year === Number(year)
    })
    if (!surveyConfig) {
        console.log(`no config found matching survey: ${survey}, for year: ${year}`)
        process.exit(1)
    }

    return surveyConfig
}

//
// TYPEFORM
//
program
    .command('tf-config <survey> <year>')
    .description('prepare config for a typeform survey and store it in yaml')
    .action(async (survey, year) => {
        const surveyConfig = getSurveyConfig(survey, year)
        if (surveyConfig.source === 'typeform') {
            await extractTypeformConfig(surveyConfig)
        } else {
            console.log(`survey ${surveyConfig.survey} ${surveyConfig.year} source is not typeform (found: ${surveyConfig.source})`)
            process.exit(1)
        }
    })

program
    .command('tf-fetch <survey> <year>')
    .description('fetch raw responses from typeform and store them locally in ndjson')
    .action(async (survey, year) => {
        const surveyConfig = getSurveyConfig(survey, year)
        if (surveyConfig.source === 'typeform') {
            await fetchTypeformResponses(surveyConfig)
        } else {
            console.log(`survey ${surveyConfig.survey} ${surveyConfig.year} source is not typeform (found: ${surveyConfig.source})`)
            process.exit(1)
        }
    })

program
    .command('tf-norm <survey> <year>')
    .description('normalize typeform raw responses and store the result locally in ndjson')
    .action(async (survey, year) => {
        const surveyConfig = getSurveyConfig(survey, year)
        if (surveyConfig.source === 'typeform') {
            await normalizeTypeformResponses(surveyConfig)
        } else {
            console.log(`survey ${surveyConfig.survey} ${surveyConfig.year} source is not typeform (found: ${surveyConfig.source})`)
            process.exit(1)
        }
    })

//
// ELASTIC
//
program
    .command('es-setup')
    .description('setup elasticsearch, recreate indices, this operation will remove existing indices')
    .action(async () => {
        await recreateIndex()
    })

program
    .command('es-index <survey> <year>')
    .description('index survey normalized responses in elasticsearch')
    .action(async (survey, year) => {
        const surveyConfig = getSurveyConfig(survey, year)
        await indexSurveyResponses(surveyConfig)
    })

//
// MONGO
//
program
    .command('mongo-save <survey> <year>')
    .description('save normalized responses to mongo')
    .action(async (survey, year) => {
        const surveyConfig = getSurveyConfig(survey, year)
        await saveResponsesToMongo(surveyConfig)
    })

program
    .command('mongo-fetch <survey> <year>')
    .description('fetch non normalized mongo responses, and store them locally in ndjson')
    .action(async (survey, year) => {
        const surveyConfig = getSurveyConfig(survey, year)
        if (surveyConfig.source === 'mongo') {
            await fetchMongoResponses(surveyConfig)
        } else {
            console.log(`survey ${surveyConfig.survey} ${surveyConfig.year} source is not mongo (found: ${surveyConfig.source})`)
            process.exit(1)
        }
    })

program
    .command('mongo-reset')
    .description('reset normalized mongo collection')
    .action(async () => {
        await cleanupMongoResponses()
    })

program
    .command('mongo-reset-year <survey> <year>')
    .description('reset normalized mongo collection for a given year and survey')
    .action(async (survey, year) => {
        await cleanupMongoResponses({ survey, year: Number(year) })
    })

program
    .command('mongo-norm <survey> <year>')
    .description('normalize mongo responses, and store them locally in ndjson')
    .action(async (survey, year) => {
        const surveyConfig = getSurveyConfig(survey, year)
        if (surveyConfig.source === 'mongo') {
            await normalizeMongoResponses(surveyConfig)
        } else {
            console.log(`survey ${surveyConfig.survey} ${surveyConfig.year} source is not mongo (found: ${surveyConfig.source})`)
            process.exit(1)
        }
    })

//
// UTILS
//
program
    .command('anon <survey> <year>')
    .description('make normalized responses anonymous, and store the result locally in ndjson')
    .action(async (survey, year) => {
        const surveyConfig = getSurveyConfig(survey, year)
        await anonymizeResponses(surveyConfig)
    })

program
    .command('transform-load')
    .description('transform and load data for all js surveys')
    .action(async () => {
        const jsSurveys = surveys.filter(s => s.survey === 'js')

        const tfSurveys = jsSurveys.filter(s => s.source === 'typeform')
        const mongoSurveys = jsSurveys.filter(s => s.source === 'mongo')

        console.log('—————————————————————————————————————————————————')
        console.log(' extract typeform configs')
        console.log('—————————————————————————————————————————————————')
        for (const survey of tfSurveys) {
            await extractTypeformConfig(survey)
        }

        console.log('—————————————————————————————————————————————————')
        console.log(' normalize typeform based surveys')
        console.log('—————————————————————————————————————————————————')
        for (const survey of tfSurveys) {
            await normalizeTypeformResponses(survey)
        }

        console.log('—————————————————————————————————————————————————')
        console.log(' re-fetch mongo surveys raw responses')
        console.log('—————————————————————————————————————————————————')
        for (const survey of mongoSurveys) {
            await fetchMongoResponses(survey)
        }

        console.log('—————————————————————————————————————————————————')
        console.log(' normalize mongo based surveys')
        console.log('—————————————————————————————————————————————————')
        for (const survey of mongoSurveys) {
            await normalizeMongoResponses(survey)
        }

        console.log('—————————————————————————————————————————————————')
        console.log(' empty normalized responses mongo collection')
        console.log('—————————————————————————————————————————————————')
        await cleanupMongoResponses()

        console.log('—————————————————————————————————————————————————')
        console.log(' save normalized responses in mongo')
        console.log('—————————————————————————————————————————————————')
        for (const survey of jsSurveys) {
            await saveResponsesToMongo(survey)
        }

        console.log('—————————————————————————————————————————————————')
        console.log(' generate anonymized responses')
        console.log('—————————————————————————————————————————————————')
        for (const survey of jsSurveys) {
            await anonymizeResponses(survey)
        }
    })

program.parse(process.argv)