import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'public', '*.config.js']),

  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // ── React ────────────────────────────────────────────────────────────
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',    // Catches stale closure bugs

      // ── Code Quality ─────────────────────────────────────────────────────
      'no-unused-vars': ['warn', {
        varsIgnorePattern: '^_',                // Allow _unused convention
        argsIgnorePattern: '^_',
        caughtErrors: 'none',                   // Don't warn on catch(e)
      }],
      'no-console': ['warn', {
        allow: ['warn', 'error'],               // Allow console.warn and .error, block console.log
      }],
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',

      // ── Best Practices ───────────────────────────────────────────────────
      'eqeqeq': ['error', 'always'],            // No == comparisons
      'no-var': 'error',                        // Only let/const
      'prefer-const': 'warn',                   // Prefer const where possible
      'object-shorthand': 'warn',               // { x: x } → { x }
      'no-throw-literal': 'error',              // Always throw Error objects

      // ── Imports ──────────────────────────────────────────────────────────
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['../../*', '../../../*', '../../../../*'],
            message: 'Use path aliases (@/, @components/, etc.) instead of deep relative imports.',
          },
        ],
      }],
    },
  },
]);
