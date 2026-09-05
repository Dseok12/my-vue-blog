/**
 * 날짜 유틸 - 프론트엔드(frontend/src/utils/date.js)와 같은 규칙을 사용한다.
 * 사용자가 고르는 날짜(dateKey)는 언제나 한국 시간(KST) 기준 'YYYY-MM-DD' 이다.
 */
export const TIME_ZONE = 'Asia/Seoul'

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** KST 기준 'YYYY-MM-DD' 문자열로 바꾼다. */
export function toDateKey(value = new Date()) {
  return dateKeyFormatter.format(value instanceof Date ? value : new Date(value))
}

/** KST 기준 오늘 날짜 키 */
export function todayKey() {
  return toDateKey(new Date())
}

/** 'YYYY-MM-DD' 형식이면서 실제로 존재하는 날짜인지 확인한다. */
export function isValidDateKey(value) {
  if (typeof value !== 'string' || !DATE_KEY_PATTERN.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

/** dateKey 를 days 만큼 이동한 날짜 키 (KST 기준) */
export function shiftDateKey(dateKey, days) {
  const base = new Date(dateKey + 'T00:00:00+09:00')
  base.setTime(base.getTime() + days * 24 * 60 * 60 * 1000)
  return toDateKey(base)
}

/** 해당 날짜(KST)의 특정 시각을 Date 로 만든다. 예: kstMoment('2026-09-05', 21) */
export function kstMoment(dateKey, hour = 9) {
  return new Date(dateKey + 'T' + String(hour).padStart(2, '0') + ':00:00+09:00')
}

/** 그 달의 첫날과 마지막 날 (dateKey 범위 조회용) */
export function monthRange(year, month) {
  const start = year + '-' + String(month).padStart(2, '0') + '-01'
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const end = year + '-' + String(month).padStart(2, '0') + '-' + String(lastDay).padStart(2, '0')
  return { start, end }
}

/** DB 에서 읽은 DATETIME 을 프론트엔드가 쓰는 ISO 문자열로 바꾼다. */
export function toIso(value) {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}
