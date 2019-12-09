/**
 * Generates a normalizer from an array of rules.
 * The normalizer will return the first matching
 * rule normalized value.
 *
 * @see multiNormalizer
 */
export const uniNormalizer = rules => value => {
    for (let rule of rules) {
        const [pattern, normalized] = rule
        if (value.match(pattern) !== null) {
            return normalized
        }
    }

    return value
}

/**
 * Generates a normalizer from an array of rules.
 * The normalizer will return all matching
 * rules normalized value.
 *
 * @see uniNormalizer
 */
export const multiNormalizer = rules => value => {
    const normalizedItems = []

    for (let rule of rules) {
        const [pattern, normalized] = rule
        if (value.match(pattern) !== null) {
            normalizedItems.push(normalized)
        }
    }

    return normalizedItems
}

export const globalOpinionsSubjectNormalizers = {
    'JavaScript is moving in the right direction': 'js_moving_in_right_direction',
    'Building JavaScript apps is overly complex right now': 'building_js_apps_overly_complex',
    'JavaScript is over-used online': 'js_over_used_online',
    'I enjoy building JavaScript apps': 'enjoy_building_js_apps',
    'I would like JavaScript to be my main programming language': 'would_like_js_to_be_main_lang',
    'The JavaScript ecosystem is changing too fast': 'js_ecosystem_changing_to_fast',
    'This survey is too damn long!': 'survey_too_long'
}

const sourceNormalizationRules = [
    // twitter
    [/twii?t/i, 'twitter'],
    [/twee?t/i, 'twitter'],

    // email
    [/e?mail/i, 'email'],
    [/e-mail/i, 'email'],
    [/subscribed/i, 'email'],
    [/subscription/i, 'email'],
    // assuming people who did it before fall into the 'email' category
    [/(previous|last|every) (year|survey)/i, 'email'],
    [/it before/i, 'email'],

    // stateofjs
    [/state ?of ?js/i, 'stateofjs'],

    // bestofjs
    [/best ?of ?\.?js/i, 'bestofjs'],

    // js weekly
    [/javascript ?weekly/i, 'js_weekly'],
    [/js ?weekly/i, 'js_weekly'],

    // ionic newsletter
    [/ionic/i, 'ionic_newsletter'],

    // freecodecamp
    [/free ?code ?camp/i, 'freecodecamp'],

    // newsletter
    [/newsletter/i, 'newsletter'],

    // reddit
    [/redd?it/i, 'reddit'],
    [/r3dd1t/i, 'reddit'],
    [/\/?r\/(javascript|clojure|reactjs|angular|webdev|programming)/i, 'reddit'],
    [/\/?r\/clojure/i, 'reddit'],

    // hacker news
    [/hacker ?news/i, 'hn'],
    [/hacknews/i, 'hn'],
    [/hckrnews/i, 'hn'],
    [/hn/i, 'hn'],
    [/ycombinator/i, 'hn'],

    // medium
    [/med(iu|ui)m/i, 'medium'],

    // work
    [/work/i, 'work'],
    [/cto/i, 'work'],
    [/coworkers?/i, 'work'],
    [/co workers?/i, 'work'],
    [/co-workers?/i, 'work'],
    [/coll?ea?gu?a?es?/i, 'work'],
    [/fellow/i, 'work'],
    [/company/i, 'work'],

    // post
    [/post/i, 'post'],
    [/blog/i, 'post'],
    [/article/i, 'post'],

    // wesbos
    [/we(s|b) ?br?o(s|z)/i, 'wesbos'],
    [/wes the bos/i, 'wesbos'],
    [/^wes$/i, 'wesbos'],

    // codrops
    [/codrops/i, 'codrops'],
    [/codedrops/i, 'codrops'],
    [/tympanus/i, 'codrops'],

    // elm slack
    [/elm/i, 'elm_slack'],

    // facebook
    [/facebook/i, 'facebook'],
    [/fb/i, 'facebook'],

    [/slack/i, 'slack'],
    [/telegram/i, 'telegram'],
    [/friends?/i, 'friend'],
    [/slashdot/i, 'slashdot']
]

export const normalizeSource = uniNormalizer(sourceNormalizationRules)

/**
 * Defines a set of rules which can be applied
 * in order to standardize tool names, it's mostly involved
 * to extract things from the "other tools" questions.
 *
 * ⚠️ ORDER MATTERS
 */
const toolNormalizationRules = [
    [/(Good Old Plain JavaScript|"Plain" JavaScript \(ES5\)|vanilla)/i, 'vanillajs'],
    [/es6/i, 'es6'],
    [/coffeescript/i, 'coffeescript'],
    [/typescript/i, 'typescript'],
    [/flow/i, 'flow'],
    [/elm-test/i, 'elm-test'],
    [/elm( |-)?native/i, 'elm-native'],
    [/elm/i, 'elm'],
    [/reason/i, 'reason'],
    [/clojure/i, 'clojurescript'],
    [/No Front-End Framework/i, 'nofrontendframework'],
    [/preact/i, 'preact'],
    [/^react$/i, 'react'],
    [/aurelia/i, 'aurelia'],
    [/polymer/i, 'polymer'],
    [/^angular$/i, 'angular'],
    [/angular ?2/i, 'angular'],
    [/angular ?1/i, 'angular-1'],
    [/angular( |-)?native/i, 'angular-native'],
    [/ember/i, 'ember'],
    [/ember( |-|\.)?data/i, 'ember-data'],
    [/^vue(\.js)?$/i, 'vuejs'],
    [/backbone/i, 'backbone'],
    [/redux/i, 'redux'],
    [/mobx/i, 'mobx'],
    [/rest( |-)?api/i, 'rest'],
    [/restify/i, 'restify'],
    [/firebase/i, 'firebase'],
    [/graphql/i, 'graphql'],
    [/apollo/i, 'apollo'],
    [/falcor/i, 'falcor'],
    [/horizon/i, 'horizon'],
    [/(meteor|blaze)/i, 'meteor'],
    [/feathers/i, 'feathers'],
    [/donejs/i, 'donejs'],
    [/mern/i, 'mern'],
    [/mean/i, 'mean'],
    [/mocha/i, 'mocha'],
    [/jasmine/i, 'jasmine'],
    [/enzyme/i, 'enzyme'],
    [/jest/i, 'jest'],
    [/cucumber/i, 'cucumberjs'],
    [/^ava$/i, 'ava'],
    [/^java$/i, 'java'],
    [/tape/i, 'tape'],
    [/karma/i, 'karma'],
    [/plain( |-|\.)css/i, 'plaincss'],
    [/css( |-|_|\.)?modules/i, 'cssmodules'],
    [/css( |-|_|\.)?next/i, 'cssnext'],
    [/pure( |-|_|\.)?css/i, 'purecss'],
    [/post( |-|_|\.)?css/i, 'postcss'],
    [/css( |-|_)?in( |-|_)?js/i, 'css-in-js'],
    [/s(a|c)ss/i, 'sass'],
    [/^less$/i, 'less'],
    [/stylus/i, 'stylus'],
    [/aphrodite/i, 'aphrodite'],
    [/webpack/i, 'webpack'],
    [/grunt/i, 'grunt'],
    [/gulp/i, 'gulp'],
    [/browserify/i, 'browserify'],
    [/bower/i, 'bower'],
    [/native( |-|_)?apps/i, 'nativeapps'],
    [/react( |-|_)?native/i, 'reactnative'],
    [/phonegap\/cordova/i, 'cordova'],
    [/cordova/i, 'cordova'],
    [/phonegap/i, 'phonegap'],
    [/native( |-|_)?script/i, 'nativescript'],
    [/express/i, 'express'],
    [/koa/i, 'koa'],
    [/hapi/i, 'hapi'],
    [/relay/i, 'relay'],
    [/sails/i, 'sails'],
    [/loopback/i, 'loopback'],
    [/keystone/i, 'keystone'],
    [/electron/i, 'electron'],
    [/ionic/i, 'ionic'],
    [/bootstrap/i, 'bootstrap'],
    [/foundation/i, 'foundation'],
    [/npm/i, 'npm'],
    [/rollup/i, 'rollup'],
    [/next(\.| |-|_)?js/i, 'nextjs'],
    [/storybook/i, 'storybook'],
    [/cycle( |-|_|\.)js/i, 'cyclejs'],
    [/knockout/i, 'knockout'],
    [/jquery/i, 'jquery'],
    [/mithril/i, 'mithril'],
    [/inferno/i, 'inferno'],
    [/riot/i, 'riotjs'],
    [/^ext\.?(js)?$/i, 'extjs'],
    [/svelte/i, 'svelte'],
    [/^om$/i, 'om'],
    [/choo/i, 'choo'],
    [/hyperapp/i, 'hyperapp'],
    [/dojo/i, 'dojo'],
    [/alkali/i, 'alkali'],
    [/marionette/i, 'marionette'],
    [/kendo/i, 'kendo'],
    [/marko/i, 'marko'],
    [/reagent/i, 'reagent'],
    [/haxe/i, 'haxe'],
    [/ampersand/i, 'ampersand'],
    [/rxjs/i, 'rxjs'],
    [/canjs/i, 'canjs'],
    [/prototype/i, 'prototype'],
    [/mootools/i, 'mootools'],
    [/glimmer/i, 'glimmerjs'],
    [/durandal/i, 'durandal'],
    [/moon/i, 'moon'],
    [/batman/i, 'batman'],
    [/flight/i, 'flight'],
    [/scala/i, 'scala'],
    [/webix/i, 'webix'],
    [/enyo/i, 'enyo'],
    [/quasar/i, 'quasar'],
    [/d3/i, 'd3'],
    [/three/i, 'threejs'],
    [/cerebral/i, 'cerebral'],
    [/underscore/i, 'underscore'],
    [/vuex/i, 'vuex'],
    [/flux/i, 'flux'],
    [/pouch/i, 'pouchdb'],
    [/ngrx/i, 'ngrx'],
    [/graph\.?cool/i, 'graph.cool'],
    [/parse/i, 'parse'],
    [/realm/i, 'realm'],
    [/gun/i, 'gunjs'],
    [/couchbase/i, 'couchbase'],
    [/datomic/i, 'datomic'],
    [/deployd/i, 'deployd'],
    [/hood\.?ie/i, 'hoodie'],
    [/kinvey/i, 'kinvey'],
    [/kinto/i, 'kinto'],
    [/mongo/i, 'mongodb'],
    [/contentful/i, 'contentful'],
    [/mysql/i, 'mysql'],
    [/redis/i, 'redis'],
    [/rethink/i, 'rethinkdb'],
    [/^node$|node\.?js|node js/i, 'nodejs'],
    [/asp\. ?net|\.net|dotnet/i, 'dotnet'],
    [/c#/i, 'C#'],
    [/django/i, 'django'],
    [/ror|rails|ruby on rails/i, 'rails'],
    [/php/i, 'php'],
    [/adonis/i, 'adonis'],
    [/python/i, 'python'],
    [/^go$|golang/i, 'golang'],
    [/laravel/i, 'laravel'],
    [/elixir/i, 'elixir'],
    [/couchdb/i, 'couchdb'],
    [/trails/i, 'trails'],
    [/kraken/i, 'kraken'],
    [/serverless/i, 'serverless'],
    [/socket\.?io/i, 'socketio'],
    [/micro/i, 'micro'],
    [/haskell/i, 'haskell'],
    [/qunit/i, 'qunit'],
    [/chai/i, 'chai'],
    [/protractor/i, 'protractor'],
    [/selenium/i, 'selenium'],
    [/nightwatch/i, 'nightwatch'],
    [/^tap$/i, 'node-tap'],
    [/sinon/i, 'sinonjs'],
    [/^intern$/i, 'intern'],
    [/^lab$/i, 'lab'],
    [/testcafe/i, 'testcafe'],
    [/junit/i, 'junit'],
    [/cypress/i, 'cypress'],
    [/phantom/i, 'phantomjs'],
    [/^atomic/i, 'atomic design'],
    [/bem/i, 'bem'],
    [/bulma/i, 'bulma'],
    [/semantic/i, 'semanticui'],
    [/tach\.+on/i, 'tachyons'],
    [/material design/i, 'material design'],
    [/skeleton/i, 'skeleton'],
    [/material(\.| |-|_)?ui/i, 'material-ui'],
    [/styled(\.| |-|_)?components/i, 'styled components'],
    [/bourbon/i, 'bourbon'],
    [/mill?igram/i, 'milligram'],
    [/uikit/i, 'uikit'],
    [/flexbox/i, 'flexbox'],
    [/topocoat/i, 'topocoat'],
    [/glamor/i, 'glamor'],
    [/radium/i, 'radium'],
    [/styletron/i, 'styletron'],
    [/jss/i, 'jss'],
    [/mdl/i, 'mdl'],
    [/vuetify/i, 'vuetify'],
    [/materiali(z|s)e/i, 'materialize'],
    [/brunch/i, 'brunch'],
    [/make/i, 'make'],
    [/broccoli|brocolli/i, 'broccoli'],
    [/fusebox/i, 'fusebox'],
    [/systemjs/i, 'systemjs'],
    [/gradle/i, 'gradle'],
    [/stealjs/i, 'stealjs'],
    [/babel/i, 'babel'],
    [/weex/i, 'weex'],
    [/xamarin/i, 'xamarin'],
    [/pwa/i, 'pwa'],
    [/progressive( |-|_)?web( |-|_)?app/i, 'pwa'],
    [/^nw(js)$/i, 'nwjs'],
    [/expo/i, 'expo'],
    [/flutter/i, 'flutter'],
    [/(appcelerator|titanium)/i, 'appcelerator'],
    [/fuse/i, 'fuse'],
    [/^cef$/i, 'cef'],
    [/chromium embedded framework/i, 'cef'],
    [/swift/i, 'swift'],
    [/yarn/i, 'yarn'],
    [/nuget/i, 'nuget'],
    [/composer/i, 'composer'],
    [/jspm/i, 'jspm'],
    [/pnpm/i, 'pnpm'],
    [/homebrew|brew/i, 'homebrew'],
    [/leiningen/i, 'leiningen'],
    [/maven/i, 'maven'],
    [/immutable/i, 'immutable'],
    [/lodash/i, 'lodash'],
    [/moment/i, 'moment'],
    [/ramda/i, 'ramda'],
    [/axios/i, 'axios'],
    [/recompose/i, 'recompose'],
    [/zepto/i, 'zepto'],
    [/async/i, 'async'],
    [/atom/i, 'atom'],
    [/webstorm/i, 'webstorm'],
    [/phpstorm/i, 'phpstorm'],
    [/intellij/i, 'intellij'],
    [/sublime/i, 'sublime-text'],
    [/vim/i, 'vim'],
    [/emacs/i, 'emacs'],
    [/brackets/i, 'brackets'],
    [/(visual studio|vs code|vscode|visualstudio)/i, 'visual-studio'],
    [/notepad/i, 'notepad++'],
    [/netbeans/i, 'netbeans'],
    [/coda/i, 'coda'],
    [/prettier/i, 'prettier'],
    [/eslint/i, 'eslint'],
    [/tslint/i, 'tslint'],
    [/stylelint/i, 'stylelint'],
    [/jshint/i, 'jshint'],
    [/standardjs/i, 'standardjs'],
    [/jscs/i, 'jscs'],
    [/jslint/i, 'jslint'],
    [/^xo$/i, 'xo'],
    [/date(-|_)?fns/i, 'date-fns'],
    [/objective(-|_)?c/i, 'objective-c'],
    [/parcel/i, 'parcel'],
    [/rust/i, 'rust'],
    [/service(-|_)?workers/i, 'service-workers'],
    [/ocaml/i, 'ocaml'],
    [/nano/i, 'nano'],
    [/kotlin/i, 'kotlin'],
    [/^r$/i, 'r'],
    [/pycharm/i, 'pycharm'],
    [/erlang/i, 'erlang'],
    [/bash/i, 'bash'],
    [/delphi/i, 'delphi'],
    [/perl/i, 'perl'],
    [/lisp/i, 'lisp'],
    [/purescript/i, 'purescript'],
    [/websockets/i, 'websockets'],
    [/luxon/i, 'luxon'],
    [/fbelt/i, 'fbelt'],
    [/bbedit/i, 'bbedit'],
    [/dart/i, 'dart'],
    [/lua/i, 'lua'],
    [/webgl/i, 'webgl'],
    [/webrtc/i, 'webrtc'],
    [/webvr/i, 'webvr'],
    [/web( )?audio( )?api/i, 'web-audio-api'],
    [/web( )?speech( )?api/i, 'web-speech-api'],
    [/web( )?components/i, 'web-components'],
    [/web( )?animation(s)?( )?api/i, 'web-animations-api'],
    [/web( )?assembly/i, 'web-assembly'],
    [/service( )?workers/i, 'service-workers'],
    [/C\/C\+\+/i, 'c-cplusplus'],
    [/ruby/i, 'ruby'],
    [/LitElement/i, 'litelement'],
]

export const normalizeTool = uniNormalizer(toolNormalizationRules)
export const normalizeOtherTools = multiNormalizer(toolNormalizationRules)

const ignoreValues = [
    ' ',
    '\n',
    '\n\n',
    '/',
    '\\',
    '*',
    '+',
    '-',
    '—',
    'n/a',
    'N/A',
    'NA',
    'None',
    'none',
    'no',
    'No',
    '.',
    '?'
]

export const cleanupValue = value => (ignoreValues.includes(value) ? null : value)
