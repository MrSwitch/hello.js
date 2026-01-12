import globals from 'globals';
import fiveapp from 'eslint-config-5app';

export default [
    {
        ignores: [
            '**/dist',
            '**/demos',
            '**/assets',
            'tests/specs/libs/',
            'tests/specs/bundle.js',
            'tests/headless.js',
        ],
    },
    ...fiveapp,
    {

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.amd,
                ...globals.commonjs,
                ...globals.webextensions,
                hello: 'writable',
            },
        },

        rules: {

            'brace-style': 0,

            'dot-notation': [2, {
                allowKeywords: false,
            }],

            eqeqeq: 0,

            'func-style': 0,
            indent: 0,

            'jsdoc/check-tag-names': 0,

            'max-params': [2, {
                max: 6,
            }],

            'no-console': 0,
            'no-empty': 0,
            'no-multi-spaces': 0,
            'no-trailing-spaces': 0,
            'no-param-reassign': 0,
            'no-prototype-builtins': 0,
            'no-redeclare': 0,
            'no-throw-literal': 0,
            'no-unused-vars': 0,
            'no-use-before-define': 0,
            'no-useless-call': 0,
            'no-useless-escape': 0,
            'no-useless-return': 0,
            'no-var': 0,
            'object-shorthand': 0,
            'prefer-arrow-callback': 0,
            'prefer-rest-params': 0,
            'prefer-spread': 0,
            'prefer-template': 0,
            'prefer-object-has-own': 0,


            'quote-props': [2, 'as-needed', {
                keywords: true,
            }],

            radix: 0,
            'spaced-comment': 0,

            'unicorn/better-regex': 0,
            'unicorn/numeric-separators-style': 0,
            'unicorn/prefer-date-now': 0,

        },
    },
    // Configuration for ES modules
    {
        files: ['**/*.mjs', '**/tests/**/*.js', '**/src/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.amd,
                ...globals.commonjs,
                ...globals.webextensions,
                hello: 'writable',
            },
        },
    },
    // Configuration for test files
    {
        files: ['**/tests/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.mocha,
                sinon: 'readonly',
                supportsBlob: 'readonly',
                expect: 'readonly', // Chai expect
                hello: 'readonly',  // Your library global
            },
        },
    },
    // Configuration for Node.js files
    {
        files: ['**/*.mjs', '**/headless.mjs', '**/tests/headless.mjs'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {
            'dot-notation': 0, // Allow .goto syntax in headless tests
        },
    },
];
