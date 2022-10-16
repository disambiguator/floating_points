module.exports = {
  root: true,
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'eslint:recommended',
    'next/core-web-vitals',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'problems',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
    project: ['./tsconfig.json'],
  },
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-unnecessary-condition': 'error',
    'prefer-destructuring': 2,
    'react/prop-types': 'off',
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
    'import/order': [
      'error',
      {
        alphabetize: { order: 'asc' },
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling']],
      },
    ],
    'react/react-in-jsx-scope': 'off', // NextJS handles babel transform for us
    '@typescript-eslint/no-unused-vars': [
      // Allow unused args/vars to be marked with an underscore
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
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
