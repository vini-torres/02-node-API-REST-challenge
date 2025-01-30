import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat()

const eslintConfig = [
  ...compat.extends('@rocketseat/eslint-config/node'),
  ...compat.plugins('simple-import-sort'),
  {
    files: ['**/*.ts'],
    rules: {
      'simple-import-sort/imports': 'error',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
]

export default eslintConfig
