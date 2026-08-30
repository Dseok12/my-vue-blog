/**
 * 날짜 유틸 - 날짜 키(dateKey)는 항상 한국 시간(KST) 기준 'YYYY-MM-DD' 이다.
 * 프론트엔드 utils/date.js 와 같은 규칙을 사용한다.
 */
const TIME_ZONE = 'Asia/Seoul'

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** KST 기준 'YYYY-MM-DD' 문자열 */
function toDateKey(value = new Date()) {
  return dateKeyFormatter.format(value instanceof Date ? value : new Date(value))
}

/** KST 기준 오늘 날짜 키 */
function todayKey() {
  return toDateKey(new Date())
}

/** 'YYYY-MM-DD' 형식이면서 실제로 존재하는 날짜인지 확인한다. */
function isValidDateKey(value) {
  if (!DATE_KEY_PATTERN.test(String(value || ''))) return false
  const [year, month, day] = String(value).split('-').map(Number)
  if (month < 1 || month > 12 || day < 1 || day > 31) return false
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

/** year, month(1~12) -> 'YYYY-MM' (월별 조회에 사용) */
function toMonthPrefix(year, month) {
  return String(year) + '-' + String(month).padStart(2, '0')
}

/** DB 의 DATETIME 값을 프론트엔드가 쓰는 ISO 문자열로 바꾼다. */
function toIso(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

module.exports = {
  TIME_ZONE,
  toDateKey,
  todayKey,
  isValidDateKey,
  toMonthPrefix,
  toIso,
}
