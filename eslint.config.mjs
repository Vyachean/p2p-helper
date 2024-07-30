import { config } from '@vyachean/eslint-config';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// to add TS support, specify the path to the tsconfig.json file
const tsConfigPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  './tsconfig.json',
);

export default [
  ...config({
    // parserOptions for ts
    tsParserOptions: {
      project: tsConfigPath,

      // recommended for ts files, but doesn't work with vue yet
      EXPERIMENTAL_useProjectService: true,
    },
  }),
  {
    rules: {
      'arrow-body-style': ['error', 'as-needed'],
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'prefer-arrow-callback': 'warn',
    },
  },
];
