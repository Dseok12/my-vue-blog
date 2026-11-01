/**
 * ESLint 설정 - `npm run lint` 로 실행한다.
 * - eslint-plugin-vue : Vue 문법 실수 / 권장 규칙
 * - eslint-config-prettier : 줄바꿈·들여쓰기 같은 "모양" 규칙은 끈다 (Prettier 가 담당)
 */
import js from '@eslint/js'
import prettier from 'eslint-config-prettier/flat'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  { ignores: ['dist/', 'coverage/'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  prettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // 설정 파일은 Node 에서 실행된다.
    files: ['*.config.js'],
    languageOptions: { globals: globals.node },
  },
]
