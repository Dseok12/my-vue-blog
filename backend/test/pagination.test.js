/** utils/pagination.js 테스트 - `npm test` 로 실행한다. */
import assert from 'node:assert/strict'
import test from 'node:test'

import {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  cursorCondition,
  parseCursor,
  parseLimit,
  toPage,
} from '../src/utils/pagination.js'

const ID = '8f14e45f-ceea-467a-9575-1d2e7c6a0b11'

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

test('parseCursor - 날짜 / 작성 시각 / id 로 나눈다', () => {
  const cursor = parseCursor('2026-08-30_2026-08-30T03:00:00.000Z_' + ID)
  assert.equal(cursor.dateKey, '2026-08-30')
  assert.equal(cursor.createdAt.toISOString(), '2026-08-30T03:00:00.000Z')
  assert.equal(cursor.id, ID)
})

test('parseCursor - 형식이 틀리면 400', () => {
  const broken = [
    '2026-08-30',
    '2026-13-01_2026-08-30T03:00:00.000Z_' + ID,
    '2026-08-30_not-a-date_' + ID,
    "2026-08-30_2026-08-30T03:00:00.000Z_x' OR 1=1",
  ]
  broken.forEach((value) => assert.throws(() => parseCursor(value), { status: 400 }, value))
})

test('cursorCondition - ? 개수와 값 개수가 같다', () => {
  assert.deepEqual(cursorCondition(null), { sql: '', values: [] })

  const { sql, values } = cursorCondition(parseCursor('2026-08-30_2026-08-30T03:00:00.000Z_' + ID))
  assert.equal(sql.match(/\?/g).length, values.length)
})

test('toPage - 하나 더 읽혔으면 마지막 글로 다음 커서를 만든다', () => {
  const rows = [
    { id: 'c', date_key: '2026-08-30', created_at: new Date('2026-08-30T03:00:00Z') },
    { id: 'b', date_key: '2026-08-29', created_at: new Date('2026-08-29T03:00:00Z') },
    { id: 'a', date_key: '2026-08-28', created_at: new Date('2026-08-28T03:00:00Z') },
  ]
  const page = toPage(rows, 2)
  assert.equal(page.rows.length, 2)
  assert.equal(page.nextCursor, '2026-08-29_2026-08-29T03:00:00.000Z_b')

  // 만든 커서를 다시 해석할 수 있어야 한다.
  assert.equal(parseCursor(page.nextCursor).id, 'b')
})

test('toPage - 마지막 페이지면 nextCursor 는 null', () => {
  const page = toPage([{ id: 'a', date_key: '2026-08-28', created_at: new Date() }], 2)
  assert.equal(page.nextCursor, null)
})
