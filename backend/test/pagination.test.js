/** utils/pagination.js 테스트 - `npm test` 로 실행한다. */
const test = require('node:test')
const assert = require('node:assert/strict')

const {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  parseCursor,
  parseLimit,
  toPage,
} = require('../src/utils/pagination')

test('parseLimit - 값이 없거나 이상하면 기본값, 너무 크면 최대값', () => {
  assert.equal(parseLimit(undefined), DEFAULT_LIMIT)
  assert.equal(parseLimit('abc'), DEFAULT_LIMIT)
  assert.equal(parseLimit('0'), DEFAULT_LIMIT)
  assert.equal(parseLimit('5'), 5)
  assert.equal(parseLimit('9999'), MAX_LIMIT)
})

test('parseCursor - 비어 있으면 첫 페이지(null)', () => {
  assert.equal(parseCursor(undefined), null)
  assert.equal(parseCursor(''), null)
})

test('parseCursor - 올바른 커서를 나눈다', () => {
  assert.deepEqual(parseCursor('2026-08-30_42'), { dateKey: '2026-08-30', id: '42' })
})

test('parseCursor - 형식이 틀리면 400', () => {
  for (const value of ['2026-08-30', '2026-13-01_1', 'abc_1', '2026-08-30_x']) {
    assert.throws(() => parseCursor(value), { status: 400 }, value)
  }
})

test('toPage - 하나 더 읽혔으면 다음 커서를 만든다', () => {
  const rows = [
    { id: 3, date_key: '2026-08-30' },
    { id: 2, date_key: '2026-08-29' },
    { id: 1, date_key: '2026-08-28' },
  ]
  const page = toPage(rows, 2)
  assert.equal(page.rows.length, 2)
  assert.equal(page.nextCursor, '2026-08-29_2')
})

test('toPage - 마지막 페이지면 nextCursor 는 null', () => {
  const page = toPage([{ id: 1, date_key: '2026-08-28' }], 2)
  assert.equal(page.rows.length, 1)
  assert.equal(page.nextCursor, null)
})
