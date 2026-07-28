import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'dist/**',
      '.astro/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Sets the Astro parser for .astro files, and TypeScript for the frontmatter
  // inside them.
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-strict'],

  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        URL: 'readonly',
      },
    },
  },

  {
    files: ['**/*.astro'],
    languageOptions: {
      globals: {
        // Ambient types Astro provides to component frontmatter. `no-undef`
        // cannot see them because they are declared, not imported.
        ImageMetadata: 'readonly',
        Astro: 'readonly',
      },
    },
  },

  {
    files: ['**/*.{js,mjs,ts,astro}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Astro components read `Astro.props` into typed locals; the non-null
      // assertion after an explicit guard is the idiomatic form there.
      '@typescript-eslint/no-non-null-assertion': 'off',
      eqeqeq: ['error', 'always'],
      'no-console': 'off',
    },
  },
];
