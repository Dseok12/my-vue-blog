/**
 * 앱 전체 흐름 테스트 - 데이터베이스 없이 확인할 수 있는 것만 다룬다.
 * (서버를 임시 포트로 띄우고 실제 HTTP 요청을 보낸다)
 *
 * 환경 변수는 앱을 불러오기 "전에" 정해야 하므로 동적 import 를 쓴다.
 */
import assert from 'node:assert/strict'
import test from 'node:test'

process.env.NODE_ENV = 'test'
process.env.AUTH_RATE_MAX = '3'
process.env.TRUST_PROXY = '1'

const { createApp } = await import('../src/app.js')
const { pool } = await import('../src/db/pool.js')

let server
let baseUrl

test.before(async () => {
  server = createApp().listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = 'http://127.0.0.1:' + server.address().port + '/api'
})

test.after(async () => {
  await new Promise((resolve) => server.close(resolve))
  await pool.end()
})

test('GET /health - 200 과 보안 헤더', async () => {
  const response = await fetch(baseUrl + '/health')
  assert.equal(response.status, 200)
  assert.equal((await response.json()).status, 'ok')
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(response.headers.get('x-frame-options'), 'DENY')
  assert.equal(response.headers.get('x-powered-by'), null)
})

test('없는 주소 - 404 와 { message }', async () => {
  const response = await fetch(baseUrl + '/nothing-here')
  assert.equal(response.status, 404)
  assert.equal(typeof (await response.json()).message, 'string')
})

test('토큰 없이 다이어리 목록 - 401', async () => {
  const response = await fetch(baseUrl + '/diaries')
  assert.equal(response.status, 401)
})

test('잘못된 토큰 - 401 (DB 를 조회하기 전에 거절된다)', async () => {
  const response = await fetch(baseUrl + '/diaries', {
    headers: { Authorization: 'Bearer not-a-token' },
  })
  assert.equal(response.status, 401)
})

test('JSON 형식이 깨진 요청 - 400', async () => {
  // 본문 해석(express.json)은 라우터보다 먼저 실행되므로 어느 주소든 같다.
  const response = await fetch(baseUrl + '/health', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{ broken',
  })
  assert.equal(response.status, 400)
})

test('로그인 시도 제한 - 정해진 횟수를 넘으면 429', async () => {
  // AUTH_RATE_MAX=3 이므로 3번까지는 400 (빈 값), 4번째부터 429
  const login = () =>
    fetch(baseUrl + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })

  for (let i = 0; i < 3; i += 1) {
    assert.equal((await login()).status, 400)
  }
  const blocked = await login()
  assert.equal(blocked.status, 429)
  assert.ok(blocked.headers.get('retry-after'))
})

test('TRUST_PROXY=1 이면 프록시가 알려 준 실제 IP 별로 따로 센다', async () => {
  // Nginx 가 X-Forwarded-For 에 실제 접속 IP 를 적어 준다고 가정한다.
  const loginFrom = (ip) =>
    fetch(baseUrl + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip },
      body: '{}',
    })

  for (let i = 0; i < 3; i += 1) {
    assert.equal((await loginFrom('203.0.113.1')).status, 400)
  }
  assert.equal((await loginFrom('203.0.113.1')).status, 429)
  // 다른 사용자는 앞 사람 때문에 막히지 않는다.
  assert.equal((await loginFrom('203.0.113.2')).status, 400)
})
