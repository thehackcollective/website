import { createRequire } from 'node:module'

import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import stylex from '@stylexjs/eslint-plugin'
import tseslint from 'typescript-eslint'

const require = createRequire(import.meta.url)

const { propLimits } = require('./eslint.prop-limits.json')

const GENERATED_TOKEN_SCALE = ['src/tokens/token-consts.stylex.ts', 'src/tokens/website-token-consts.stylex.ts']

const WEBAPP_STYLE_SOURCES = [
  'internal/**/*.stylex.ts',
  'internal/**/*.stylex.tsx',
  'internal/**/*.tsx',
  'workers/internal/**/*.tsx',
  'src/components/ui/**/*.stylex.ts',
  'src/components/ui/**/*.tsx',
  'src/lib/**/*.stylex.ts',
  'src/lib/**/*.tsx',
]

const PUBLIC_KIT_FILES = [
  'src/components/ui/{count-up,dia-sweep,dia-text,reveal,stagger-reveal}.tsx',
  'src/components/ui/{count-up,dia-sweep,dia-text,reveal,stagger-reveal}.ts',
  'src/components/ui/{count-up,dia-sweep,dia-text,reveal,stagger-reveal}.stylex.ts',
  'src/lib/hairline-*',
]

const LADDER_SURFACES = [
  'src/components/ui/button.tsx',
  'src/components/ui/icon-button.tsx',
  'src/components/ui/icon.tsx',
  'src/components/ui/icon-label.tsx',
  'src/components/ui/badge.tsx',
  'src/components/ui/avatar.tsx',
  'src/components/ui/status-dot.tsx',
  'src/components/ui/input.tsx',
  'src/components/ui/field.stylex.ts',
  'src/components/ui/select.tsx',
  'src/components/ui/search-field.tsx',
  'src/components/ui/menu.tsx',
  'src/components/ui/menu.stylex.ts',
]

const LADDER_SIZE_PROPS = [
  'height',
  'minHeight',
  'maxHeight',
  'width',
  'minWidth',
  'blockSize',
  'minBlockSize',
  'maxBlockSize',
  'inlineSize',
  'minInlineSize',
]

const ladderPropLimits = {
  ...propLimits,
  ...Object.fromEntries(
    LADDER_SIZE_PROPS.map((prop) => [
      prop,
      {
        limit: [0, '0', '1px', 'auto', 'none', '100%', 'fit-content', 'min-content', 'max-content'],
        reason: `A control kit file has a literal ${prop}. Use a step token (layout.stepHeight, layout.stepGlyph) or a named layout token from src/tokens/token-consts.stylex.ts. See DESIGN.md, "Size ladder".`,
      },
    ]),
  ),
}

const stylexLanguage = {
  parser: require('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
}

export default defineConfig(
  {
    ignores: ['**/node_modules/**', '**/dist/**', '.cloudflare/**', 'internal/.cloudflare/**', '.agents/**', 'src/lib/hairline-*.js'],
  },
  {
    files: ['**/*.{ts,tsx,mjs,js}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.stylex.ts', '**/*.stylex.tsx', 'src/**/*.tsx', 'internal/**/*.tsx', 'workers/**/*.tsx'],
    ignores: GENERATED_TOKEN_SCALE,
    plugins: { '@stylexjs': stylex },
    languageOptions: stylexLanguage,
    rules: {
      '@stylexjs/valid-styles': 'error',
      '@stylexjs/no-conflicting-props': 'error',
    },
  },
  {
    files: WEBAPP_STYLE_SOURCES,
    ignores: [...GENERATED_TOKEN_SCALE, ...PUBLIC_KIT_FILES],
    rules: {
      '@stylexjs/valid-styles': ['error', { propLimits }],
    },
  },
  {
    files: LADDER_SURFACES,
    rules: {
      '@stylexjs/valid-styles': ['error', { propLimits: ladderPropLimits }],
    },
  },
)
