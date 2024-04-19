const path = require('path');

module.exports = {
  root: true,
  env: { browser: true, es2020: true },
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

    'react/jsx-key': 'warn',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',

    '@typescript-eslint/no-unused-vars': 'off',

    'compat/compat': 'warn',

    'import/order': importOrderRule,
    'import/no-named-as-default-member': 'off',
  },
};
