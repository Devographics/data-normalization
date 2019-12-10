import { sections, experience } from '../lib/constants.mjs'

export default [
    {
        survey: 'js',
        year: 2016,
        source: 'typeform',
        typeformId: 'Mulmxw',
        sections: {
            [sections.JAVASCRIPT_FLAVORS]: {
                title: 'JavaScript Flavor'
            },
            [sections.FRONTEND_FRAMEWORKS]: {
                title: 'Front-End',
                freeform: 'Other Front-End Frameworks'
            },
            [sections.STATE_MANAGEMENT]: {
                title: 'State Management',
                freeform: 'Other State Management Libraries'
            },
            [sections.DATA_LAYER]: {
                title: 'API Layer',
                freeform: 'Other API layer solutions'
            },
            [sections.BACKEND_FRAMEWORKS]: {
                title: 'Stacks',
                freeform: 'Other stacks'
            },
            [sections.TESTING]: {
                title: 'Testing',
                freeform: 'Other testing frameworks'
            },
            [sections.CSS]: {
                title: 'CSS',
                freeform: 'Other CSS solutions'
            },
            [sections.BUILD_TOOLS]: {
                title: 'Build Tools',
                freeform: 'Other build tools'
            },
            [sections.MOBILE_DESKTOP]: {
                title: 'Mobile',
                freeform: 'Other mobile apps solutions'
            }
        },
        experience: {
            [`I've used it before, and would use it again`]: experience.WOULD_USE,
            [`I've used it before, and would not use it again`]: experience.WOULD_NOT_USE,
            [`I've heard of it, and would like to learn it`]: experience.INTERESTED,
            [`I've heard of it, and am not interested`]: experience.NOT_INTERESTED,
            [`I've never heard of it`]: experience.NEVER_HEARD
        },
    },
    {
        survey: 'js',
        year: 2017,
        source: 'typeform',
        typeformId: 'S5iLk9',
        sections: {
            [sections.JAVASCRIPT_FLAVORS]: {
                title: 'JavaScript Flavor'
            },
            [sections.FRONTEND_FRAMEWORKS]: {
                title: 'Front-End',
                freeform: 'Other Front-End Frameworks'
            },
            [sections.DATA_LAYER]: {
                title: 'Data Layer',
                freeform: 'Other Data Management Solutions'
            },
            [sections.BACKEND_FRAMEWORKS]: {
                title: 'Back-End',
                freeform: 'Other Back-End Tools'
            },
            [sections.TESTING]: {
                title: 'Testing',
                freeform: 'Other testing frameworks'
            },
            [sections.CSS]: {
                title: 'CSS',
                freeform: 'Other CSS solutions'
            },
            [sections.BUILD_TOOLS]: {
                title: 'Build Tools',
                freeform: 'Other build tools'
            },
            [sections.MOBILE_DESKTOP]: {
                title: 'Mobile & Desktop',
                freeform: 'Other mobile/desktop apps solutions'
            }
        },
        experience: {
            [`I've USED it before, and WOULD use it again`]: experience.WOULD_USE,
            [`I've USED it before, and would NOT use it again`]: experience.WOULD_NOT_USE,
            [`I've HEARD of it, and WOULD like to learn it`]: experience.INTERESTED,
            [`I've HEARD of it, and am NOT interested`]: experience.NOT_INTERESTED,
            [`I've never heard of it`]: experience.NEVER_HEARD
        }
    },
    {
        survey: 'js',
        year: 2018,
        source: 'typeform',
        typeformId: 'J9gRJf',
        sections: {
            [sections.JAVASCRIPT_FLAVORS]: {
                title: 'JavaScript Flavors',
                freeform: 'Other JavaScript Flavors options'
            },
            [sections.FRONTEND_FRAMEWORKS]: {
                title: 'Front-End',
                freeform: 'Other Front-End options'
            },
            [sections.DATA_LAYER]: {
                title: 'Data Layer',
                freeform: 'Other Data Layer options'
            },
            [sections.BACKEND_FRAMEWORKS]: {
                title: 'Back-end',
                freeform: 'Other Back-end options'
            },
            [sections.TESTING]: {
                title: 'Testing',
                freeform: 'Other Testing options'
            },
            [sections.MOBILE_DESKTOP]: {
                title: 'Mobile & Desktop',
                freeform: 'Other Mobile & Desktop options'
            }
        },
        experience: {
            [`👍 Used it > Would use again`]: experience.WOULD_USE,
            [`👎 Used it > Would avoid`]: experience.WOULD_NOT_USE,
            [`✅ Heard of it > Would like to learn`]: experience.INTERESTED,
            [`🚫 Heard of it > Not interested`]: experience.NOT_INTERESTED,
            [`🤷 Never heard of it/Not sure what it is`]: experience.NEVER_HEARD
        }
    },
    {
        survey: 'js',
        year: 2019,
        source: 'mongo',
        mapping: {
            _id: '!ignore',
            surveyId: '!ignore',
            userId: '!ignore',
            year: '=',
            completion: '=',
            device: 'user_info.device',
            referrer: 'user_info.referrer',
            os: '=',
            browser: '=',
            version: '=',
            source: '=',
            createdAt: '=',
            updatedAt: '=',

            syntax_arrowfunctions: 'features.arrow_functions',
            syntax_destructuring: 'features.destructuring',
            syntax_spreadoperator: 'features.spread_operator',

            language_asyncawait: 'features.async_await',
            language_decorators: 'features.decorators',
            language_promises: 'features.promises',
            language_proxies: 'features.proxies',

            datastructures_arrayprototypeflat: 'features.array_prototype_flat',
            datastructures_maps: 'features.maps',
            datastructures_sets: 'features.sets',
            datastructures_typedarrays: 'features.typed_arrays',

            browserapis_fetchapi: 'features.fetch',
            browserapis_i18n: 'features.i18n',
            browserapis_localstorage: 'features.local_storage',
            browserapis_serviceworkers: 'features.service_workers',
            browserapis_webanimationsapi: 'features.web_animations',
            browserapis_webaudioapi: 'features.web_audio',
            browserapis_webcomponents: 'features.web_components',
            browserapis_webgl: 'features.webgl',
            browserapis_webrtc: 'features.webrtc',
            browserapis_websocket: 'features.websocket',
            browserapis_webspeechapi: 'features.web_speech',
            browserapis_webvr: 'features.webvr',

            otherfeatures_progressivewebappspwa: 'features.pwa',
            otherfeatures_webassemblywasm: 'features.wasm',

            patterns_functionalprogramming: 'patterns.functional_programming',
            patterns_objectorientedprogramming: 'patterns.object_oriented_programming',
            patterns_reactiveprogramming: 'patterns.reactive_programming',

            javascriptflavors_clojurescript: 'tools.clojurescript.experience',
            javascriptflavors_elm: 'tools.elm.experience',
            javascriptflavors_purescript: 'tools.purescript.experience',
            javascriptflavors_reason: 'tools.reason.experience',
            javascriptflavors_typescript: 'tools.typescript.experience',
            javascriptflavors_overallhappiness: `happiness.${sections.JAVASCRIPT_FLAVORS}`,
            javascriptflavors_otherjavascriptflavors: `sections_other_tools.${sections.JAVASCRIPT_FLAVORS}`,

            frontendframeworks_angular: 'tools.angular.experience',
            frontendframeworks_ember: 'tools.ember.experience',
            frontendframeworks_preact: 'tools.preact.experience',
            frontendframeworks_react: 'tools.react.experience',
            frontendframeworks_svelte: 'tools.svelte.experience',
            frontendframeworks_vue: 'tools.vuejs.experience',
            frontendframeworks_overallhappiness: `happiness.${sections.FRONTEND_FRAMEWORKS}`,
            frontendframeworks_otherfrontendframeworks: `sections_other_tools.${sections.FRONTEND_FRAMEWORKS}`,

            datalayer_apollo: 'tools.apollo.experience',
            datalayer_graphql: 'tools.graphql.experience',
            datalayer_mobx: 'tools.mobx.experience',
            datalayer_redux: 'tools.redux.experience',
            datalayer_relay: 'tools.relay.experience',
            datalayer_overallhappiness: `happiness.${sections.DATA_LAYER}`,
            datalayer_otherdatalayertools: `sections_other_tools.${sections.DATA_LAYER}`,

            backendframeworks_express: 'tools.express.experience',
            backendframeworks_feathersjs: 'tools.feathers.experience',
            backendframeworks_gatsbyjs: 'tools.gatsbyjs.experience',
            backendframeworks_koa: 'tools.koa.experience',
            backendframeworks_meteor: 'tools.meteor.experience',
            backendframeworks_nextjs: 'tools.nextjs.experience',
            backendframeworks_nuxtjs: 'tools.nuxtjs.experience',
            backendframeworks_sails: 'tools.sails.experience',
            backendframeworks_overallhappiness: `happiness.${sections.BACKEND_FRAMEWORKS}`,
            backendframeworks_otherbackendframeworks: `sections_other_tools.${sections.BACKEND_FRAMEWORKS}`,

            testing_ava: 'tools.ava.experience',
            testing_cypress: 'tools.cypress.experience',
            testing_enzyme: 'tools.enzyme.experience',
            testing_jasmine: 'tools.jasmine.experience',
            testing_jest: 'tools.jest.experience',
            testing_mocha: 'tools.mocha.experience',
            testing_puppeteer: 'tools.puppeteer.experience',
            testing_storybook: 'tools.storybook.experience',
            testing_overallhappiness: `happiness.${sections.TESTING}`,
            testing_othertestingtools: `sections_other_tools.${sections.TESTING}`,

            mobiledesktop_cordova: 'tools.cordova.experience',
            mobiledesktop_electron: 'tools.electron.experience',
            mobiledesktop_expo: 'tools.expo.experience',
            mobiledesktop_ionic: 'tools.ionic.experience',
            mobiledesktop_nativeapps: 'tools.nativeapps.experience',
            mobiledesktop_nwjs: 'tools.nwjs.experience',
            mobiledesktop_reactnative: 'tools.reactnative.experience',
            mobiledesktop_overallhappiness: `happiness.${sections.MOBILE_DESKTOP}`,
            mobiledesktop_othermobiledesktoptools: `sections_other_tools.${sections.MOBILE_DESKTOP}`,

            othertools_browsers: 'other_tools.browsers.choices',
            othertools_otherbrowsers: 'other_tools.browsers.others',
            othertools_buildtools: 'other_tools.build_tools.choices',
            othertools_otherbuildtools: 'other_tools.build_tools.others',
            othertools_nonjslanguages: 'other_tools.non_js_languages.choices',
            othertools_otherlanguages: 'other_tools.non_js_languages.others',
            othertools_texteditors: 'other_tools.text_editors.choices',
            othertools_othereditors: 'other_tools.text_editors.others',
            othertools_utilities: 'other_tools.utilities.choices',
            othertools_otherutilities: 'other_tools.utilities.others',

            resources_blogsnewsmagazines: 'resources.blogs_news_magazines.choices',
            resources_otherblogs: 'resources.blogs_news_magazines.others',
            resources_podcasts: 'resources.podcasts.choices',
            resources_otherpodcasts: 'resources.podcasts.others',
            resources_sitescourses: 'resources.sites_courses.choices',
            resources_othercourses: 'resources.sites_courses.others',

            opinionquestions_buildingjavascriptappsisoverlycomplexrightnow: 'opinions.building_js_apps_overly_complex',
            opinionquestions_ienjoybuildingjavascriptapps: 'opinions.enjoy_building_js_apps',
            opinionquestions_iwouldlikejavascripttobemymainprogramminglanguage: 'opinions.would_like_js_to_be_main_lang',
            opinionquestions_javascriptismovingintherightdirection: 'opinions.js_moving_in_right_direction',
            opinionquestions_javascriptisoverusedonline: 'opinions.js_over_used_online',
            opinionquestions_thejavascriptecosystemischangingtoofast: 'opinions.js_ecosystem_changing_to_fast',
            opinionquestions_whatdoyoufeeliscurrentlymissingfromjavascript: 'opinions.missing_from_js',

            aboutyou_youremail: 'user_info.email',
            aboutyou_backendproficiency: 'user_info.backend_proficiency',
            aboutyou_cssproficiency: 'user_info.css_proficiency',
            aboutyou_companysize: 'user_info.company_size',
            aboutyou_jobtitle: 'user_info.job_title',
            aboutyou_otherjobtitle: 'user_info.job_title',
            aboutyou_yearlysalary: 'user_info.yearly_salary',
            aboutyou_yearsofexperience: 'user_info.years_of_experience',
            aboutyou_yourcountry: 'user_info.country',
            aboutyou_yourgender: 'user_info.gender',
            aboutyou_othergender: 'user_info.gender',
            aboutyou_howdidyoufindoutaboutthissurvey: 'user_info.how_did_user_find_out_about_the_survey',
        },
        experience: {
            would_use_again: experience.WOULD_USE,
            would_not_use_again: experience.WOULD_NOT_USE,
            interested: experience.INTERESTED,
            not_interested: experience.NOT_INTERESTED,
            neverheard: experience.NEVER_HEARD
        }
    },
    {
        survey: 'css',
        year: 2019,
        source: 'typeform',
        typeformId: 'TxDuh6',
    },
]
