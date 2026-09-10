import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'node_modules', '.npm-cache'] },
  js.configs.recommended,
  { files: ['src/**/*.{ts,tsx}'], languageOptions: { parserOptions: { ecmaVersion: 2020, sourceType: 'module' }, globals: { window: 'readonly', document: 'readonly', navigator: 'readonly', fetch: 'readonly', FormData: 'readonly', Blob: 'readonly', URL: 'readonly', DOMParser: 'readonly', crypto: 'readonly', confirm: 'readonly' } }, plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh }, rules: { ...reactHooks.configs.recommended.rules, 'react-refresh/only-export-components': ['warn', { allowConstantExport: true }] } }
]
