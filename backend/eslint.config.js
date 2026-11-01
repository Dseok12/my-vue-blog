/**
 * ESLint 설정 - `npm run lint` 로 실행한다.
 * 실수하기 쉬운 코드(안 쓰는 변수, 정의 안 된 변수 등)를 미리 찾아 준다.
 */
const js = require('@eslint/js')
const globals = require('globals')

module.exports = [
  { ignores: ['node_modules/', 'uploads/'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      // 사용하지 않는 인자는 이름 앞에 _ 를 붙이면 허용한다.
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
]
