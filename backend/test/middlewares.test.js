/** middlewares/rateLimit.js, utils/uploadFiles.js 테스트 */
const test = require('node:test')
const assert = require('node:assert/strict')

const rateLimit = require('../src/middlewares/rateLimit')
const { filenameFromUrl } = require('../src/utils/uploadFiles')

/** 미들웨어를 한 번 실행하고 next 에 넘어온 값을 돌려준다. */
function run(middleware, ip = '1.1.1.1') {
  const req = { ip }
  const res = { headers: {}, set: (name, value) => (res.headers[name] = value) }
  let passed
  middleware(req, res, (error) => {
    passed = error
  })
  return { error: passed, res }
}

test('rateLimit - max 번까지는 통과, 그다음은 429', () => {
  const limiter = rateLimit({ windowMs: 60_000, max: 2 })

  assert.equal(run(limiter).error, undefined)
  assert.equal(run(limiter).error, undefined)

  const third = run(limiter)
  assert.equal(third.error.status, 429)
  assert.ok(Number(third.res.headers['Retry-After']) > 0)
})

test('rateLimit - IP 마다 따로 센다', () => {
  const limiter = rateLimit({ windowMs: 60_000, max: 1 })
  assert.equal(run(limiter, '1.1.1.1').error, undefined)
  assert.equal(run(limiter, '2.2.2.2').error, undefined)
  assert.equal(run(limiter, '1.1.1.1').error.status, 429)
})

test('filenameFromUrl - 이 서버의 파일 이름만 꺼낸다', () => {
  assert.equal(filenameFromUrl('/api/uploads/files/abc.png'), 'abc.png')
  assert.equal(filenameFromUrl('https://example.com/abc.png'), '')
  assert.equal(filenameFromUrl('/api/uploads/files/../.env'), '')
  assert.equal(filenameFromUrl('/api/uploads/files/'), '')
})
