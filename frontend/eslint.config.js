import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        files: ['*.js'],
        ignores: ['vitest.config.js', 'eslint.config.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.es2021
            }
        },
        rules: {
            'no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_'
            }],
            'no-console': 'off',
            'semi': ['error', 'always'],
            'quotes': ['error', 'single', { avoidEscape: true }],
            'no-trailing-spaces': 'error',
            'eol-last': ['error', 'always'],
            'no-multiple-empty-lines': ['error', { max: 1 }],
            'brace-style': ['error', '1tbs'],
            'comma-dangle': ['error', 'never'],
            'indent': ['error', 4, { SwitchCase: 1 }],
            'no-undef': 'error',
            'no-unreachable': 'error',
            'no-dupe-keys': 'error'
        }
    },
    {
        files: ['*.test.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.es2021,
                ...globals.node
            }
        },
        rules: {
            'no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_'
            }],
            'no-console': 'off',
            'semi': ['error', 'always'],
            'quotes': ['error', 'single', { avoidEscape: true }],
            'no-trailing-spaces': 'error',
            'eol-last': ['error', 'always'],
            'no-multiple-empty-lines': ['error', { max: 1 }],
            'brace-style': ['error', '1tbs'],
            'comma-dangle': ['error', 'never'],
            'indent': ['error', 4, { SwitchCase: 1 }],
            'no-undef': 'off',
            'no-unreachable': 'error',
            'no-dupe-keys': 'error'
        }
    }
];
