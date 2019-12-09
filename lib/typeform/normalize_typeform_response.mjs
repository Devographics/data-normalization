import * as fieldTypes from '../field_types.mjs'
import * as userInfo from '../user_info.mjs'
import { normalizeTool, normalizeOtherTools, cleanupValue, normalizeSource } from '../normalize.mjs'
import * as geo from '../geo.mjs'

export const normalizeTypeformResponse = async (survey, { answers, ...response }) => {
    const normalized = {
        survey: survey.survey,
        year: survey.year,
        browser_type: response.metadata.browser,
        user_agent: response.metadata.user_agent,
        platform: response.metadata.platform,
        createdAt: response.landed_at,
        updatedAt: response.submitted_at,
        tools: {},
        sections_other_tools: {},
        other_tools: {},
        opinions: {},
        user_info: {
            browser_type: response.metadata.browser,
            user_agent: response.metadata.user_agent,
            platform: response.metadata.platform,
        },
        happiness: {},
    }

    if (response.hidden !== undefined) {
        normalized.user_info.referrer = normalized.referrer = response.hidden.referrer
        normalized.user_info.device = normalized.device = response.hidden.device
        normalized.os = response.hidden.os
        normalized.browser = response.hidden.browser
        normalized.version = response.hidden.version
        normalized.location = response.hidden.location
    }

    let country
    answers.forEach(answer => {
        const fieldConfig = survey.fields[answer.field.id]
        if (fieldConfig === undefined) {
            console.log('UNKNOWN ANSWER', answer)
            return
        }

        if (fieldConfig.type === fieldTypes.FIELD_TYPE_OTHER_TOOLS) {
            let otherToolsChoices = []
            let otherToolsOthers = []
            if (answer.choice !== undefined) {
                if (answer.choice.label !== undefined) {
                    otherToolsChoices.push(normalizeTool(answer.choice.label))
                }
                if (answer.choice.other !== undefined) {
                    otherToolsOthers = normalizeOtherTools(answer.choice.other)
                }
            } else if (answer.choices !== undefined) {
                if (answer.choices.labels !== undefined) {
                    otherToolsChoices = answer.choices.labels.map(tool => normalizeTool(tool))
                } else if (answer.choices.label) {
                    otherToolsChoices = [normalizeTool(answer.choices.label)]
                }
                if (answer.choices.other !== undefined) {
                    otherToolsOthers = normalizeOtherTools(answer.choices.other)
                }
            }

            normalized.other_tools[fieldConfig.topic] = {
                choices: otherToolsChoices,
            }
            if (otherToolsOthers.length > 0) {
                normalized.other_tools[fieldConfig.topic].others = otherToolsOthers
            }
        }

        switch (fieldConfig.type) {
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
                normalized.tools[fieldConfig.tool][fieldTypes.FIELD_TYPE_TOOL_LIKE_REASONS] = likeReasons
                break

            case fieldTypes.FIELD_TYPE_TOOL_DISLIKE_REASONS:
                const dislikeReasons = answer.choices.labels
                if (normalized.tools[fieldConfig.tool] === undefined) {
                    normalized.tools[fieldConfig.tool] = {}
                }
                normalized.tools[fieldConfig.tool][fieldTypes.FIELD_TYPE_TOOL_DISLIKE_REASONS] = dislikeReasons
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
                    normalized.sections_other_tools[fieldConfig.section] = sectionOtherTools
                }
                break

            //
            // About you
            //
            case fieldTypes.FIELD_TYPE_YEARS_OF_EXPERIENCE:
                const yearsExperienceRange = userInfo.yearsOfExperienceRangeByLabel[answer.choice.label]
                if (yearsExperienceRange === undefined) {
                    throw new Error(`Unknown years of experience range ${answer.choice.label}`)
                }
                normalized.user_info[fieldTypes.FIELD_TYPE_YEARS_OF_EXPERIENCE] = yearsExperienceRange.id
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
                normalized.user_info[fieldTypes.FIELD_TYPE_EMAIL] = answer.email
                break

            case fieldTypes.FIELD_TYPE_SOURCE:
                const source = normalizeSource(answer.text.trim().toLowerCase())
                normalized.user_info[fieldTypes.FIELD_TYPE_SOURCE] = source
                break

            case fieldTypes.FIELD_TYPE_GENDER:
                let gender
                if (answer.choice.label !== undefined) {
                    gender = answer.choice.label.toLowerCase()
                    normalized.user_info[fieldTypes.FIELD_TYPE_GENDER] = gender
                }
                break

            case fieldTypes.FIELD_TYPE_COUNTRY:
                country = answer.text.trim().toLowerCase()
                break

            //
            // Opinions
            //
            case fieldTypes.FIELD_TYPE_GLOBAL_OPINION:
                normalized.opinions[fieldConfig.subject] = answer.number
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
        normalized.user_info[fieldTypes.FIELD_TYPE_COUNTRY] = countryInfo.country
        normalized.user_info.continent = countryInfo.continent
    }

    return normalized
}