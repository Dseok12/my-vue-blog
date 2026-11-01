/**
 * models/diaryModel.js 테스트 - DB 대신 가짜 query 함수를 끼워 넣어
 * "만들어진 SQL 의 ? 개수와 값의 개수가 맞는지" 를 확인한다.
 * (실제 DB 결과는 MySQL 을 띄우고 직접 호출해 확인한다 - Study 06 Level 3)
 */
const test = require('node:test')
const assert = require('node:assert/strict')

const db = require('../src/config/db')
const diaryModel = require('../src/models/diaryModel')

const calls = []
db.query = async (sql, params) => {
  calls.push({ sql, params })
  return []
}
db.queryOne = async (sql, params) => {
  calls.push({ sql, params })
  return { total: 0 }
}

const countPlaceholders = (sql) => (sql.match(/\?/g) || []).length

test.after(() => db.pool.end())

test('findMine - 모든 필터 + 커서를 써도 ? 와 값의 개수가 같다', async () => {
  calls.length = 0
  await diaryModel.findMine(
    '1',
    { dateKey: '2026-08-30', category: 'diary', visibility: 'public', keyword: '산책' },
    { cursor: { dateKey: '2026-08-30', id: '10' }, limit: 10 },
  )

  const { sql, params } = calls[0]
  assert.equal(countPlaceholders(sql), params.length)
  assert.equal(params[0], '1', '첫 번째 값은 보는 사람 id (likedByMe 계산용)')
  assert.equal(params[params.length - 1], 11, '마지막 값은 limit + 1')
  assert.match(sql, /ORDER BY d\.date_key DESC, d\.id DESC LIMIT \?$/)
})

test('findFeed - 커서 없이 첫 페이지', async () => {
  calls.length = 0
  await diaryModel.findFeed('1', { keyword: '50%' }, { cursor: null, limit: 5 })

  const { sql, params } = calls[0]
  assert.equal(countPlaceholders(sql), params.length)
  assert.doesNotMatch(sql, /d\.id < \?/)
  assert.ok(params.includes('%50\\%%'), '검색어의 % 는 이스케이프한다')
})

test('countMine - 보는 사람 id 없이 조건만 쓴다', async () => {
  calls.length = 0
  await diaryModel.countMine('1', { category: 'book' })

  const { sql, params } = calls[0]
  assert.equal(countPlaceholders(sql), params.length)
  assert.deepEqual(params, ['1', 'book'])
})
