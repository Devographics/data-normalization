import _ from 'lodash'

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

        if (mappedKey === '=') {
            _.set(normalized, key, value)
            continue
        }

        _.set(normalized, mappedKey, value)
    }

    return normalized
}
