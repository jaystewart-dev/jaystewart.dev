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
      // A scrolling box must be a tab stop, or a keyboard user cannot reach
      // the content it hides — WCAG 2.1.1, and what axe's
      // `scrollable-region-focusable` rule checks for. The rule's default
      // allowance is `tabpanel` only, so the one role this site uses that way
      // is added rather than the rule switched off.
      'astro/jsx-a11y/no-noninteractive-tabindex': [
        'error',
        { tags: [], roles: ['tabpanel', 'region'], allowExpressionValues: true },
      ],
      eqeqeq: ['error', 'always'],
      'no-console': 'off',
    },
  },
];
