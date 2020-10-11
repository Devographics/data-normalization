import { salary, companySize, workExperience } from './constants.mjs'

export const salaryRanges = [
    {
        id: salary.FREE,
        label: 'I work for free :(',
        average: 0
    },
    {
        id: salary.RANGE_0_10,
        label: '$0-$10k',
        average: 5
    },
    {
        id: salary.RANGE_10_30,
        label: '$10k-$30k',
        aliases: ['$10-$30k'],
        average: 20
    },
    {
        id: salary.RANGE_30_50,
        label: '$30k-$50k',
        aliases: ['$30-50k'],
        average: 40
    },
    {
        id: salary.RANGE_50_100,
        label: '$50k-$100k',
        aliases: ['$50-$100k'],
        average: 75
    },
    {
        id: salary.RANGE_100_200,
        label: '$100k-$200k',
        average: 150
    },
    {
        id: salary.MORE_THAN_200,
        label: '$200k+',
        average: 250
    }
]

export const salaryRangeByLabel = salaryRanges.reduce((acc, salaryRange) => {
    const mapping = {
        ...acc,
        [salaryRange.label]: salaryRange
    }

    if (salaryRange.aliases !== undefined) {
        salaryRange.aliases.forEach(alias => {
            mapping[alias] = salaryRange
        })
    }

    return mapping
}, {})

export const companySizes = [
    {
        id: companySize.ONE,
        label: 'Just me'
    },
    {
        id: companySize.RANGE_1_5,
        label: '1-5 people'
    },
    {
        id: companySize.RANGE_5_10,
        label: '5-10 people'
    },
    {
        id: companySize.RANGE_10_20,
        label: '10-20 people'
    },
    {
        id: companySize.RANGE_20_50,
        label: '20-50 people'
    },
    {
        id: companySize.RANGE_50_100,
        label: '50-100 people'
    },
    {
        id: companySize.RANGE_100_1000,
        label: '100-1000 people'
    },
    {
        id: companySize.RANGE_MORE_THAN_1000,
        label: '1000+ people'
    }
]

export const companySizeByLabel = companySizes.reduce(
    (acc, companySize) => ({
        ...acc,
        [companySize.label]: companySize
    }),
    {}
)

export const yearsOfExperienceRanges = [
    {
        id: workExperience.LESS_THAN_1,
        label: 'Less than one year'
    },
    {
        id: workExperience.RANGE_1_2,
        label: '1-2 years'
    },
    {
        id: workExperience.RANGE_2_5,
        label: '2-5 years'
    },
    {
        id: workExperience.RANGE_5_10,
        label: '5-10 years'
    },
    {
        id: workExperience.RANGE_10_20,
        label: '10-20 years'
    },
    {
        id: workExperience.MORE_THAN_20,
        label: '20+ years'
    }
]

export const yearsOfExperienceRangeByLabel = yearsOfExperienceRanges.reduce(
    (acc, yearsOfExperienceRange) => ({
        ...acc,
        [yearsOfExperienceRange.label]: yearsOfExperienceRange
    }),
    {}
)
