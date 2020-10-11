import _ from 'lodash'
import {
    cleanupValue,
    normalizeResponseSource,
    normalizeTool,
    normalizeOtherTools,
    normalizeResources,
} from '../normalize.mjs'

export const normalizeMongoResponse = (survey, response) => {
    const normalized = {
        survey: survey.survey,
        year: survey.year,
    }

    for (const key in response) {
        const mappedKey = survey.mapping[key]
        if (mappedKey === undefined) {
            console.log(response[key])
            throw new Error(`No mapping defined for property: ${key}`)
        }

        if (mappedKey === '!ignore') {
            continue
        }

        let value = response[key]
        if (mappedKey.startsWith('tools.') && mappedKey.endsWith('.experience')) {
            value = survey.experience[value]
        }

        // demographics normalization
        if (mappedKey.endsWith('.gender')) {
            value = value.toLowerCase()
        }
        if (mappedKey.endsWith('yearly_salary')) {
            value = survey.salary[value]
        }
        if (mappedKey.endsWith('years_of_experience')) {
            value = survey.workExperience[value]
        }
        if (mappedKey.endsWith('company_size')) {
            value = survey.companySize[value]
        }
        if (mappedKey.endsWith('css_proficiency')) {
            value = survey.cssProficiency[value]
        }
        if (mappedKey.endsWith('backend_proficiency')) {
            value = survey.backendProficiency[value]
        }

        if (mappedKey === '=') {
            _.set(normalized, key, value)
            continue
        }

        _.set(normalized, mappedKey, value)
    }

    const [normalizedSource, sourcePattern] = normalizeResponseSource(response)
    if (normalizedSource) {
        _.set(normalized, 'user_info.normalized_source', normalizedSource)
        if (sourcePattern) {
            _.set(normalized, 'user_info.normalized_source_pattern', sourcePattern.toString())
        }
    }

    // normalization
    const keysToNormalize = [
        {
            category: 'tools',
            normalizationFunction: normalizeOtherTools,
            keys: [
                'sections_other_tools.javascript_flavors',
                'sections_other_tools.front_end_frameworks',
                'sections_other_tools.data_layer',
                'sections_other_tools.back_end_frameworks',
                'sections_other_tools.testing',
                'sections_other_tools.mobile_desktop',
            ],
        },
        {
            category: 'otherTools',
            normalizationFunction: normalizeOtherTools,
            keys: [
                'other_tools.browsers.others',
                'other_tools.build_tools.others',
                'other_tools.text_editors.others',
                'other_tools.utilities.others',
                'other_tools.non_js_languages.others',
            ],
        },
        {
            category: 'resources',
            normalizationFunction: normalizeResources,
            keys: [
                'resources.blogs_news_magazines.others',
                'resources.podcasts.others',
                'resources.sites_courses.others',
            ],
        },
    ]

    keysToNormalize.forEach((section) => {
        const { category, normalizationFunction, keys } = section
        keys.forEach((key) => {
            const value = cleanupValue(_.get(normalized, key))
            if (value) {
                const normalizedValues = normalizationFunction(value)
                _.set(
                    normalized,
                    `${key}_normalized`,
                    normalizedValues.map((v) => v[0])
                )
                _.set(
                    normalized,
                    `${key}_patterns`,
                    normalizedValues.map((v) => v[1].toString())
                )
            }
        })
    })

    return normalized
}
