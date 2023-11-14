module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'next/core-web-vitals',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:@typescript-eslint/strict-type-checked',
    'problems',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true,
    },
    project: ['./tsconfig.json'],
  },
  rules: {
    'no-unused-vars': 'off', // Conflicts with TypeScript
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'error',
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    'prefer-destructuring': 2,
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
    'import/order': [
      'error',
      {
        alphabetize: { order: 'asc' },
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling']],
      },
    ],
    'object-shorthand': ['error', 'always'],
    'prefer-arrow-callback': 'off', // configs with react/display-name
  },
  env: {
    browser: true,
    node: true,
  },
  globals: {
    JSX: true,
  },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
};
