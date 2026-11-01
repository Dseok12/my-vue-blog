/**
 * 커서 기반 페이지네이션 - 목록의 "더 보기" 에 사용한다.
 *
 * 목록은 date_key DESC, created_at DESC, id DESC 로 정렬한다.
 * "이번 페이지 마지막 글의 (date_key, created_at, id)" 를 커서로 넘겨받아 그 뒤부터 읽는다.
 * (id 는 UUID 라 순서가 없으므로, 같은 날짜·같은 시각일 때 순서를 고정하는 용도로만 쓴다)
 *
 * 커서 형식: 'YYYY-MM-DD_2026-08-30T12:00:00.000Z_<id>'
 *
 * OFFSET(몇 개 건너뛰기) 방식과 달리, 그 사이에 새 글이 추가되어도
 * 같은 글이 두 번 나오거나 빠지지 않는다.
 */
import { ApiError } from './ApiError.js'
import { isValidDateKey } from './date.js'

export const DEFAULT_LIMIT = 10
export const MAX_LIMIT = 30

const ID_PATTERN = /^[\w-]{1,64}$/

/** 한 번에 가져올 개수 - 값이 없거나 이상하면 기본값, 너무 크면 최대값 */
export function parseLimit(value) {
  const limit = Number(value)
  if (!Number.isInteger(limit) || limit < 1) return DEFAULT_LIMIT
  return Math.min(limit, MAX_LIMIT)
}

/** 커서 문자열 -> { dateKey, createdAt(Date), id }. 값이 없으면 null (= 첫 페이지) */
export function parseCursor(value) {
  if (value === undefined || value === null || value === '') return null

  const invalid = () => ApiError.badRequest('목록 위치 정보가 올바르지 않습니다.')
  const parts = String(value).split('_')
  if (parts.length !== 3) throw invalid()

  const [dateKey, createdAtText, id] = parts
  const createdAt = new Date(createdAtText)
  if (!isValidDateKey(dateKey) || Number.isNaN(createdAt.getTime()) || !ID_PATTERN.test(id)) {
    throw invalid()
  }
  return { dateKey, createdAt, id }
}

/** DB 행 -> 커서 문자열 */
export function toCursor(row) {
  return row.date_key + '_' + new Date(row.created_at).toISOString() + '_' + row.id
}

/**
 * 정렬 기준에서 커서보다 "뒤"에 있는 글만 고르는 조건.
 * 커서가 없으면 조건도 없다.
 */
export function cursorCondition(cursor) {
  if (!cursor) return { sql: '', values: [] }
  return {
    sql:
      '(d.date_key < ? OR (d.date_key = ? AND' +
      ' (d.created_at < ? OR (d.created_at = ? AND d.id < ?))))',
    values: [cursor.dateKey, cursor.dateKey, cursor.createdAt, cursor.createdAt, cursor.id],
  }
}

/**
 * limit + 1 개를 조회한 결과를 받아 한 페이지로 자른다.
 * 하나 더 있으면 다음 페이지가 있다는 뜻이다.
 */
export function toPage(rows, limit) {
  const hasMore = rows.length > limit
  const pageRows = hasMore ? rows.slice(0, limit) : rows
  return {
    rows: pageRows,
    nextCursor: hasMore ? toCursor(pageRows[pageRows.length - 1]) : null,
  }
}
