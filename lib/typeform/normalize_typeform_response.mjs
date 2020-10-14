import * as fieldTypes from '../field_types.mjs'
import * as userInfo from '../user_info.mjs'
import {
    normalizeTool,
    normalizeOtherTools,
    cleanupValue,
    normalizeSource,
    normalizeResources,
    normalizeResource,
    normalizeFeatureId,
    normalizeEnvironment,
    normalizeEnvironments,
    normalizeJobTitle,
    normalizeOtherOpinion,
} from '../normalize.mjs'
import { encrypt } from '../anonymize.mjs'
import * as geo from '../geo.mjs'

export const normalizeTypeformResponse = async (survey, { answers, ...response }) => {
    const normalized = {
        survey: `state_of_${survey.survey}`,
        year: survey.year,
        createdAt: response.landed_at,
        updatedAt: response.submitted_at,
        user_info: {
            browser_type: response.metadata.browser,
            user_agent: response.metadata.user_agent,
            platform: response.metadata.platform,
        },
        tools: {},
        tools_others: {},
        features: {},
        features_others: {},
        opinions: {},
        opinions_others: {},
        happiness: {},
        resources: {},
        environments: {},
    }

    if (response.hidden !== undefined) {
        normalized.user_info = {
            ...normalized.user_info,
            ...response.hidden,
        }
    }

    let country
    answers.forEach((answer) => {
        const fieldConfig = survey.fields[answer.field.id]
        if (fieldConfig === undefined) {
            console.warn('UNKNOWN ANSWER', answer)
            return
        }

        if (fieldConfig.type === fieldTypes.FIELD_TYPE_OTHER_TOOLS) {
            let otherToolsChoices = []
            let otherToolsOthers = null
            if (answer.choice !== undefined) {
                if (answer.choice.label !== undefined) {
                    otherToolsChoices.push(answer.choice.label)
                }
                if (answer.choice.other !== undefined) {
                    otherToolsOthers = answer.choice.other
                }
            } else if (answer.choices !== undefined) {
                if (answer.choices.labels !== undefined) {
                    otherToolsChoices = answer.choices.labels
                } else if (answer.choices.label) {
                    otherToolsChoices = [answer.choices.label]
                }
                if (answer.choices.other !== undefined) {
                    otherToolsOthers = answer.choices.other
                }
            }

            normalized.tools_others[fieldConfig.topic] = {
                choices: otherToolsChoices.map((tool) => normalizeTool(tool)),
            }
            if (otherToolsOthers !== null) {
                normalized.tools_others[fieldConfig.topic].others = {
                    raw: otherToolsOthers,
                }

                const otherToolsOthersNormalization = normalizeOtherTools(otherToolsOthers)
                if (otherToolsOthersNormalization.hasMatch) {
                    normalized.tools_others[fieldConfig.topic].others.patterns =
                        otherToolsOthersNormalization.patterns
                    normalized.tools_others[fieldConfig.topic].others.normalized =
                        otherToolsOthersNormalization.normalized
                }
            }
        }

        switch (fieldConfig.type) {
            //
            // Tool
            //
            case fieldTypes.FIELD_TYPE_TOOL:
                const experience = survey.experience[answer.choice.label]
                if (experience === undefined) {
                    throw new Error(
                        `Unable to convert answer to experience id: ${answer.choice.label}`
                    )
                }
                if (normalized.tools[fieldConfig.tool] === undefined) {
                    normalized.tools[fieldConfig.tool] = {}
                }
                normalized.tools[fieldConfig.tool].experience = experience
                break

            case fieldTypes.FIELD_TYPE_TOOL_LIKE_REASONS:
                const likeReasons = answer.choices.labels
                if (normalized.tools[fieldConfig.tool] === undefined) {
                    normalized.tools[fieldConfig.tool] = {}
                }
                normalized.tools[fieldConfig.tool][
                    fieldTypes.FIELD_TYPE_TOOL_LIKE_REASONS
                ] = likeReasons
                break

            case fieldTypes.FIELD_TYPE_TOOL_DISLIKE_REASONS:
                const dislikeReasons = answer.choices.labels
                if (normalized.tools[fieldConfig.tool] === undefined) {
                    normalized.tools[fieldConfig.tool] = {}
                }
                normalized.tools[fieldConfig.tool][
                    fieldTypes.FIELD_TYPE_TOOL_DISLIKE_REASONS
                ] = dislikeReasons
                break

            //
            // Feature
            //
            case fieldTypes.FIELD_TYPE_FEATURE_EXPERIENCE:
                const featureExperience = survey.feature[answer.choice.label]
                if (featureExperience === undefined) {
                    throw new Error(
                        `Unable to convert answer to feature experience id: ${answer.choice.label}`
                    )
                }
                if (normalized.features[fieldConfig.feature] === undefined) {
                    normalized.features[fieldConfig.feature] = {}
                }
                normalized.features[fieldConfig.feature].experience = featureExperience
                break

            case fieldTypes.FIELD_TYPE_OTHER_FEATURE:
                if (normalized.features_others[fieldConfig.feature] === undefined) {
                    normalized.features_others[fieldConfig.feature] = {}
                }
                normalized.features_others[
                    fieldConfig.feature
                ].choices = answer.choices.labels.map((label) => normalizeFeatureId(label))
                break

            //
            // Environments
            //
            case fieldTypes.FIELD_TYPE_ENVIRONMENT_RATING:
                if (answer.choice && answer.choice.label) {
                    normalized.environments[
                        fieldConfig.environment
                    ] = fieldConfig.rating_mapping.find(
                        (m) => m.label === answer.choice.label
                    ).rating
                }
                break

            case fieldTypes.FIELD_TYPE_ENVIRONMENT_CHOICES:
                if (answer.choices) {
                    normalized.environments[fieldConfig.environment] = {}
                    if (answer.choices.labels && answer.choices.labels.length > 0) {
                        normalized.environments[
                            fieldConfig.environment
                        ].choices = answer.choices.labels.map((label) =>
                            normalizeEnvironment(label)
                        )
                    }
                    if (answer.choices.other) {
                        normalized.environments[fieldConfig.environment].others = {
                            raw: answer.choices.other,
                        }

                        const otherEnvironmentsNormalization = normalizeEnvironments(
                            answer.choices.other
                        )
                        if (otherEnvironmentsNormalization.hasMatch) {
                            normalized.environments[fieldConfig.environment].others.patterns =
                                otherEnvironmentsNormalization.patterns
                            normalized.environments[fieldConfig.environment].others.normalized =
                                otherEnvironmentsNormalization.normalized
                        }
                    }
                }
                break

            //
            // Happiness
            //
            case fieldTypes.FIELD_TYPE_HAPPINESS:
                // starts at 1, make it starts at 0
                const happiness = Number(answer.number) - 1
                normalized.happiness[fieldConfig.section] = happiness
                break

            case fieldTypes.FIELD_TYPE_SECTION_OTHER_TOOLS:
                const value = cleanupValue(answer.text)
                if (value !== null) {
                    const sectionOtherTools = normalizeOtherTools(value)
                    if (sectionOtherTools.hasMatch) {
                        if (normalized.tools_others[fieldConfig.section] == undefined) {
                            normalized.tools_others[fieldConfig.section] = {}
                        }

                        normalized.tools_others[fieldConfig.section].others = {
                            raw: value,
                            patterns: sectionOtherTools.patterns,
                            normalized: sectionOtherTools.normalized,
                        }
                    }
                }
                break

            //
            // Resources
            //
            case fieldTypes.FIELD_TYPE_RESOURCE:
                normalized.resources[fieldConfig.resource] = {
                    choices: [],
                }
                if (answer.choices.labels && answer.choices.labels.length > 0) {
                    normalized.resources[
                        fieldConfig.resource
                    ].choices = answer.choices.labels.map((label) => normalizeResource(label))
                }
                let otherResources = answer.choices.other
                if (otherResources !== undefined) {
                    otherResources = cleanupValue(otherResources)
                    if (otherResources !== null) {
                        normalized.resources[fieldConfig.resource].others = {
                            raw: otherResources,
                        }

                        const otherResourcesNormalization = normalizeResources(otherResources)
                        if (otherResourcesNormalization.hasMatch) {
                            normalized.resources[fieldConfig.resource].others.patterns =
                                otherResourcesNormalization.patterns
                            normalized.resources[fieldConfig.resource].others.normalized =
                                otherResourcesNormalization.normalized
                        }
                    }
                }
                break

            //
            // About you
            //
            case fieldTypes.FIELD_TYPE_YEARS_OF_EXPERIENCE:
                const yearsExperienceRange =
                    userInfo.yearsOfExperienceRangeByLabel[answer.choice.label]
                if (yearsExperienceRange === undefined) {
                    throw new Error(`Unknown years of experience range ${answer.choice.label}`)
                }
                normalized.user_info[fieldTypes.FIELD_TYPE_YEARS_OF_EXPERIENCE] =
                    yearsExperienceRange.id
                break

            case fieldTypes.FIELD_TYPE_COMPANY_SIZE:
                const companySize = userInfo.companySizeByLabel[answer.choice.label]
                if (companySize === undefined) {
                    throw new Error(`Unknown company size ${answer.choice.label}`)
                }
                normalized.user_info[fieldTypes.FIELD_TYPE_COMPANY_SIZE] = companySize.id
                return

            case fieldTypes.FIELD_TYPE_SALARY:
                const salaryRange = userInfo.salaryRangeByLabel[answer.choice.label]
                if (salaryRange === undefined) {
                    throw new Error(`Unknown salary range ${answer.choice.label}`)
                }
                normalized.user_info[fieldTypes.FIELD_TYPE_SALARY] = salaryRange.id
                break

            case fieldTypes.FIELD_TYPE_EMAIL:
                // normalized.user_info[fieldTypes.FIELD_TYPE_EMAIL] = answer.email
                normalized.user_info.hash = encrypt(answer.email)
                break

            case fieldTypes.FIELD_TYPE_SOURCE:
                const sourceText = cleanupValue(answer.text.trim().toLowerCase())
                if (sourceText) {
                    normalized.user_info[fieldTypes.FIELD_TYPE_SOURCE] = {
                        raw: sourceText,
                    }

                    const normalizedSource = normalizeSource(sourceText)
                    if (normalizedSource !== sourceText) {
                        normalized.user_info[
                            fieldTypes.FIELD_TYPE_SOURCE
                        ].normalized = normalizedSource
                    }
                }
                break

            case fieldTypes.FIELD_TYPE_PROFICIENCY:
                if (answer.choice && answer.choice.label) {
                    normalized.user_info[
                        fieldConfig.proficiency
                    ] = fieldConfig.proficiency_mapping.find(
                        (m) => m.label === answer.choice.label
                    ).rating
                }
                break

            case fieldTypes.FIELD_TYPE_GENDER:
                let gender
                if (answer.choice.label !== undefined) {
                    gender = answer.choice.label
                        .toLowerCase()
                        .replace(/ |-/g, '_')
                        .replace(/\/.*/, '')
                    normalized.user_info[fieldTypes.FIELD_TYPE_GENDER] = gender
                }
                break

            case fieldTypes.FIELD_TYPE_COUNTRY:
                country = answer.text.trim().toLowerCase()
                break

            case fieldTypes.FIELD_TYPE_JOB_TITLE:
                if (answer.choice && answer.choice.label) {
                    normalized.user_info[fieldTypes.FIELD_TYPE_JOB_TITLE] = normalizeJobTitle(
                        answer.choice.label
                    )
                }
                break

            //
            // Opinions
            //
            case fieldTypes.FIELD_TYPE_GLOBAL_OPINION:
                normalized.opinions[fieldConfig.subject] = answer.number
                break

            case fieldTypes.FIELD_TYPE_OTHER_OPINION:
                if (answer.text) {
                    const opinionText = cleanupValue(answer.text)
                    if (opinionText) {
                        normalized.opinions_others[fieldConfig.subject] = {
                            raw: opinionText,
                        }

                        const otherOpinionNormalization = normalizeOtherOpinion(opinionText)
                        if (otherOpinionNormalization.hasMatch) {
                            normalized.opinions_others[fieldConfig.subject].patterns =
                                otherOpinionNormalization.patterns
                            normalized.opinions_others[fieldConfig.subject].normalized =
                                otherOpinionNormalization.normalized
                        }
                    }
                }
                break
        }
    })

    let countryInfo
    if (country) {
        countryInfo = await geo.getCountryInfo(country)
    }
    if (!countryInfo && response.hidden && response.hidden.location) {
        countryInfo = await geo.getCountryInfo(response.hidden.location)
    }
    if (countryInfo) {
        normalized.user_info.country_name = countryInfo.country
        normalized.user_info.country_alpha3 = countryInfo.country_alpha3
        normalized.user_info.continent = countryInfo.continent
    }

    return normalized
}
