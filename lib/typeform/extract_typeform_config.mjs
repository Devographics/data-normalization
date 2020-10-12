import path from 'path'
import _ from 'lodash'
import axios from 'axios'
import YAML from 'yamljs'
import * as fieldTypes from '../field_types.mjs'
import { sections, SECTION_TYPE_OTHER_FEATURES } from '../constants.mjs'
import {
    globalOpinionsSubjectNormalizers,
    normalizeTool,
    normalizeFeatureId,
    normalizeResourceId,
} from '../normalize.mjs'
import { writeFile } from '../fs.mjs'

const TYPEFORM_FIELD_TYPE_MULTI_CHOICE = 'multiple_choice'
const TYPEFORM_FIELD_TYPE_RATING = 'rating'

const slugifyField = (str) => _.snakeCase(_.deburr(str))

const extractFields = (fields, registry = {}, { path = '' } = {}) => {
    fields.forEach((field) => {
        if (field.type === 'statement') return

        const slug = slugifyField(field.title)
        registry[field.id] = {
            slug: `${path}${path !== '' ? '_' : ''}${slug}`,
            typeform_type: field.type,
        }
        if (field.type === 'group') {
            extractFields(field.properties.fields, registry, {
                path: `${path}${path !== '' ? '_' : ''}${slug}`,
            })
            return
        }
    })

    return registry
}

const generateIsExperienceField = (experienceLabels) => (field) => {
    return (
        field.type === TYPEFORM_FIELD_TYPE_MULTI_CHOICE &&
        field.properties.choices.every((choice) => {
            return experienceLabels.includes(choice.label)
        })
    )
}

const generateIsFeatureExperienceField = (featureExperienceLabels) => (field) => {
    return (
        field.type === TYPEFORM_FIELD_TYPE_MULTI_CHOICE &&
        field.properties.choices.every((choice) => {
            return featureExperienceLabels.includes(choice.label)
        })
    )
}

const isLikeReasonsField = (field) => {
    return field.type === TYPEFORM_FIELD_TYPE_MULTI_CHOICE && field.ref.endsWith('_love')
}

const isDislikeReasonsField = (field) => {
    return field.type === TYPEFORM_FIELD_TYPE_MULTI_CHOICE && field.ref.endsWith('_hate')
}

export const extractTypeformConfig = async (survey) => {
    const surveyName = `state_of_${survey.survey}_${survey.year}`

    const opts = {
        url: `https://api.typeform.com/forms/${survey.typeformId}`,
        headers: {
            authorization: `bearer ${process.env.TYPEFORM_TOKEN}`,
        },
    }
    const form = (await axios.request(opts)).data

    const experienceLabels = Object.keys(survey.experience)
    const isExperienceField = generateIsExperienceField(experienceLabels)

    const featureExperienceLabels = Object.keys(survey.feature)
    const isFeatureExperienceField = generateIsFeatureExperienceField(featureExperienceLabels)

    const config = {
        ..._.cloneDeep(survey),
        tools: [],
        tools_others: [],
        features: [],
        features_others: [],
        user_info: [],
        fields: extractFields(form.fields),
    }

    //
    // Compute "Other Tools"
    //
    // the "Other tools" section does not exist for 2016 js survey
    const otherToolsField = form.fields.find((field) => field.title === 'Other Tools')
    if (otherToolsField !== undefined) {
        otherToolsField.properties.fields.forEach((field) => {
            const topic = field.title.toLowerCase().replace(/ /g, '_')
            config.tools_others.push(topic)
            config.fields[field.id] = {
                ...config.fields[field.id],
                type: fieldTypes.FIELD_TYPE_OTHER_TOOLS,
                topic,
            }
        })
    }

    //
    // Compute "Opinion Questions"
    //
    const globalOpinionsField = form.fields.find((field) => field.title === 'Opinion Questions')
    if (globalOpinionsField === undefined) {
        throw new Error('unable to find global opinions field')
    }
    globalOpinionsField.properties.fields.forEach((field) => {
        const subject = globalOpinionsSubjectNormalizers[field.title]
        if (subject === undefined) {
            throw new Error(
                `unable to find global opinion subject from field title: ${field.title}`
            )
        }

        config.fields[field.id] = {
            ...config.fields[field.id],
            type: fieldTypes.FIELD_TYPE_GLOBAL_OPINION,
            subject,
        }
    })

    //
    // Compute sections
    //
    Object.keys(config.sections).forEach((sectionId) => {
        const sectionConfig = config.sections[sectionId]
        const sectionField = form.fields.find((field) => field.title === sectionConfig.title)
        if (sectionField === undefined) {
            throw new Error(`no field found for section ${sectionId} (${sectionConfig.title})`)
        }

        const sectionTools = []
        const sectionToolsOthers = []
        const sectionFeatures = []
        const sectionFeaturesOthers = []
        const sectionResources = []

        sectionField.properties.fields.forEach((field) => {
            if (sectionId === sections.RESOURCES) {
                if (field.type === TYPEFORM_FIELD_TYPE_MULTI_CHOICE) {
                    const resourceId = normalizeResourceId(field.title)
                    config.fields[field.id] = {
                        ...config.fields[field.id],
                        type: fieldTypes.FIELD_TYPE_RESOURCE,
                        resource: resourceId,
                    }
                    sectionResources.push(resourceId)
                    return
                }

                console.warn(`unknown resource field:`, field)
                return
            }

            if (isExperienceField(field)) {
                const toolId = normalizeTool(field.title)
                config.fields[field.id] = {
                    ...config.fields[field.id],
                    type: fieldTypes.FIELD_TYPE_TOOL,
                    tool: toolId,
                    section: sectionId,
                }
                sectionTools.push(toolId)
                config.tools.push(toolId)
                return
            }

            if (isFeatureExperienceField(field)) {
                const featureId = normalizeFeatureId(field.title)
                config.fields[field.id] = {
                    ...config.fields[field.id],
                    type: fieldTypes.FIELD_TYPE_FEATURE_EXPERIENCE,
                    feature: featureId,
                    section: sectionId,
                }
                sectionFeatures.push(featureId)
                config.features.push(featureId)
                return
            }

            if (sectionConfig.type === SECTION_TYPE_OTHER_FEATURES) {
                if (field.type === TYPEFORM_FIELD_TYPE_MULTI_CHOICE) {
                    const featureId = normalizeFeatureId(field.title)
                    config.fields[field.id] = {
                        ...config.fields[field.id],
                        type: fieldTypes.FIELD_TYPE_OTHER_FEATURE,
                        feature: featureId,
                        section: sectionId,
                    }
                    sectionFeaturesOthers.push(featureId)
                    config.features_others.push(featureId)
                    return
                }
            }

            if (field.type === TYPEFORM_FIELD_TYPE_RATING) {
                config.fields[field.id] = {
                    ...config.fields[field.id],
                    type: fieldTypes.FIELD_TYPE_HAPPINESS,
                    section: sectionId,
                }
                return
            }

            if (field.title === sectionConfig.freeform) {
                config.fields[field.id] = {
                    ...config.fields[field.id],
                    type: fieldTypes.FIELD_TYPE_SECTION_OTHER_TOOLS,
                    section: sectionId,
                }
                sectionToolsOthers.push(sectionId)
                return
            }

            if (isLikeReasonsField(field)) {
                config.fields[field.id] = {
                    ...config.fields[field.id],
                    type: fieldTypes.FIELD_TYPE_TOOL_LIKE_REASONS,
                    tool: normalizeTool(field.ref.slice(0, -5)),
                    section: sectionId,
                }
                return
            }

            if (isDislikeReasonsField(field)) {
                config.fields[field.id] = {
                    ...config.fields[field.id],
                    type: fieldTypes.FIELD_TYPE_TOOL_DISLIKE_REASONS,
                    tool: normalizeTool(field.ref.slice(0, -5)),
                    section: sectionId,
                }
                return
            }

            console.warn(`unknown field for section: ${sectionConfig.title}`, field)
        })

        if (sectionTools.length > 0) {
            sectionConfig.tools = sectionTools
        }
        if (sectionToolsOthers.length > 0) {
            sectionConfig.tools_others = sectionToolsOthers
            config.tools_others = [...config.tools_others, ...sectionToolsOthers]
        }
        if (sectionFeatures.length > 0) {
            sectionConfig.features = sectionFeatures
        }
        if (sectionFeaturesOthers.length > 0) {
            sectionConfig.features_others = sectionFeaturesOthers
        }
        if (sectionResources.length > 0) {
            sectionConfig.resources = sectionResources
        }
    })

    //
    // Compute user info
    //
    const aboutField = form.fields.find((field) => field.title === 'About You')
    if (aboutField === undefined) {
        throw new Error('Unable to find "About You" field')
    }

    // Compute user years of experience
    const yearsOfExperienceField = aboutField.properties.fields.find(
        (field) => field.title === 'Years of Experience'
    )
    if (yearsOfExperienceField === undefined) {
        throw new Error('Unable to find years of experience field')
    }
    config.user_info.push(fieldTypes.FIELD_TYPE_YEARS_OF_EXPERIENCE)
    config.fields[yearsOfExperienceField.id] = {
        ...config.fields[yearsOfExperienceField.id],
        type: fieldTypes.FIELD_TYPE_YEARS_OF_EXPERIENCE,
    }

    // Compute user company size
    const companySizeField = aboutField.properties.fields.find(
        (field) => field.title === 'Company Size'
    )
    if (companySizeField === undefined) {
        throw new Error('Unable to find company size field')
    }
    config.user_info.push(fieldTypes.FIELD_TYPE_COMPANY_SIZE)
    config.fields[companySizeField.id] = {
        ...config.fields[companySizeField.id],
        type: fieldTypes.FIELD_TYPE_COMPANY_SIZE,
    }

    // compute salary range
    const salaryField = aboutField.properties.fields.find(
        (field) => field.title === 'Yearly Salary'
    )
    if (salaryField === undefined) {
        throw new Error('Unable to find salary field')
    }
    config.user_info.push(fieldTypes.FIELD_TYPE_SALARY)
    config.fields[salaryField.id] = {
        ...config.fields[salaryField.id],
        type: fieldTypes.FIELD_TYPE_SALARY,
    }

    // compute user email
    const emailField = aboutField.properties.fields.find((field) => field.title === 'Your Email')
    if (emailField === undefined) {
        throw new Error('Unable to find email field')
    }
    config.user_info.push(fieldTypes.FIELD_TYPE_EMAIL)
    config.fields[emailField.id] = {
        ...config.fields[emailField.id],
        type: fieldTypes.FIELD_TYPE_EMAIL,
    }

    // compute survey source
    const sourceField = aboutField.properties.fields.find(
        (field) => field.title === 'How did you find out about this survey?'
    )
    if (sourceField !== undefined) {
        config.user_info.push(fieldTypes.FIELD_TYPE_SOURCE)
        config.fields[sourceField.id] = {
            ...config.fields[sourceField.id],
            type: fieldTypes.FIELD_TYPE_SOURCE,
        }
    }

    // compute user gender
    const genderField = aboutField.properties.fields.find((field) => field.title === 'Your Gender')
    if (genderField !== undefined) {
        config.user_info.push(fieldTypes.FIELD_TYPE_GENDER)
        config.fields[genderField.id] = {
            ...config.fields[genderField.id],
            type: fieldTypes.FIELD_TYPE_GENDER,
        }
    }

    // compute country
    const countryField = aboutField.properties.fields.find(
        (field) => field.title === 'Your Country'
    )
    if (countryField !== undefined) {
        config.user_info.push(fieldTypes.FIELD_TYPE_COUNTRY)
        config.fields[countryField.id] = {
            ...config.fields[countryField.id],
            type: fieldTypes.FIELD_TYPE_COUNTRY,
        }
    }

    // compute city
    const cityField = aboutField.properties.fields.find((field) => field.title === 'Your City')
    if (cityField !== undefined) {
        config.user_info.push(fieldTypes.FIELD_TYPE_CITY)
        config.fields[cityField.id] = {
            ...config.fields[cityField.id],
            type: fieldTypes.FIELD_TYPE_CITY,
        }
    }

    await writeFile(path.join('conf', `${surveyName}.yml`), YAML.stringify(config, 10))
    console.log(`extracted typeform config for survey: ${surveyName}`)
}
