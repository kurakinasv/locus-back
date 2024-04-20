const path = require('path');

module.exports = {
  root: true,
  env: {
    browser: false,
    node: true,
    es2020: true,
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    requireConfigFile: false,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: path.resolve('./tsconfig.json'),
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.js', '.ts'],
    },
  },
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  rules: {
    'prettier/prettier': 'warn',

    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-unused-vars': 'off',

    'object-curly-newline': ['error', { consistent: true }],
    'max-len': [1, { code: 120 }],
    'prefer-const': 'warn',

    '@typescript-eslint/no-unused-vars': 'warn',
  },
};
