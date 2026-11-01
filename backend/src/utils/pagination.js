/**
 * 커서 기반 페이지네이션 - 목록의 "더 보기" 에 사용한다.
 *
 * 목록은 date_key DESC, id DESC 로 정렬한다.
 * 그래서 "이번 페이지 마지막 글의 (dateKey, id)" 만 알면 다음 페이지의 시작점을 정할 수 있다.
 * 커서 형식: 'YYYY-MM-DD_123'
 *
 * OFFSET(몇 개 건너뛰기) 방식과 달리, 그 사이에 새 글이 추가되어도
 * 같은 글이 두 번 나오거나 빠지지 않는다.
 */
const ApiError = require('./ApiError')
const { isValidDateKey } = require('./date')

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 30

const CURSOR_PATTERN = /^(\d{4}-\d{2}-\d{2})_(\d+)$/

/** 한 번에 가져올 개수 - 값이 없거나 이상하면 기본값, 너무 크면 최대값 */
function parseLimit(value) {
  const limit = Number(value)
  if (!Number.isInteger(limit) || limit < 1) return DEFAULT_LIMIT
  return Math.min(limit, MAX_LIMIT)
}

/** 'YYYY-MM-DD_123' -> { dateKey, id }. 값이 없으면 null (= 첫 페이지) */
function parseCursor(value) {
  if (value === undefined || value === null || value === '') return null

  const matched = CURSOR_PATTERN.exec(String(value))
  if (!matched || !isValidDateKey(matched[1])) {
    throw ApiError.badRequest('목록 위치 정보가 올바르지 않습니다.')
  }
  return { dateKey: matched[1], id: matched[2] }
}

/** DB 행 -> 커서 문자열 */
function toCursor(row) {
  return row.date_key + '_' + row.id
}

/**
 * limit + 1 개를 조회한 결과를 받아 한 페이지로 자른다.
 * 하나 더 있으면 다음 페이지가 있다는 뜻이다.
 */
function toPage(rows, limit) {
  const hasMore = rows.length > limit
  const pageRows = hasMore ? rows.slice(0, limit) : rows
  return {
    rows: pageRows,
    nextCursor: hasMore ? toCursor(pageRows[pageRows.length - 1]) : null,
  }
}

module.exports = { DEFAULT_LIMIT, MAX_LIMIT, parseLimit, parseCursor, toCursor, toPage }
