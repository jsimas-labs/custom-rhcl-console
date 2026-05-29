// ESLint v9 flat config. Replaces the legacy .eslintrc.* that this project
// never had — the `eslint` dep was bumped to ^9 in package.json without a
// matching config, so `npm run lint` was failing with "eslint.config.(js|mjs|cjs)
// not found" since the bump landed.
//
// Goal: keep the lint pipeline minimal but real — recommended rules for
// TypeScript and React, no project-wide opinions beyond what the upstream
// recommended configs already enforce. Anything noisier (style, import order,
// import sorting, JSX-a11y, etc.) should be added intentionally in a follow-up
// once we agree on the style baseline.

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    // Same scope as the npm script ("eslint src ..."). Anything outside src/
    // (config files, locales/, dist/, node_modules/) is ignored automatically
    // because ESLint flat config only lints what it is asked to.
    ignores: ['node_modules/**', 'dist/**', 'locales/**', '*.config.*'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // OCP Console plugins run with the modern React JSX transform (17+) —
      // React does not need to be in scope.
      'react/react-in-jsx-scope': 'off',
      // We type props through TypeScript interfaces, not runtime PropTypes.
      'react/prop-types': 'off',
      // `_foo` and `_unused` are accepted convention for intentionally-unused
      // bindings (e.g. destructuring with rest, switch-case fall-through).
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // The SDK exposes several `any` types in its public surface; we re-cast
      // them locally where typing them more strictly would not pay off. Keep
      // the rule as a warning so it shows up in CI but does not block.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
);
