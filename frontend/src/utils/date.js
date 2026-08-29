/**
 * 날짜 유틸 - 모든 날짜는 한국 시간(KST) 기준으로 계산한다.
 * 날짜 키(dateKey)의 형식은 'YYYY-MM-DD' 로 통일한다.
 */
export const TIME_ZONE = 'Asia/Seoul'

/** 일요일부터 시작하는 요일 라벨 */
export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: TIME_ZONE,
  hour: 'numeric',
  minute: '2-digit',
})

function toDate(value) {
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value)
  if (typeof value === 'string') {
    // 'YYYY-MM-DD' 는 KST 자정으로 해석한다.
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value + 'T00:00:00+09:00')
    return new Date(value)
  }
  return new Date()
}

/** KST 기준 'YYYY-MM-DD' 문자열 */
export function toDateKey(value = new Date()) {
  return dateKeyFormatter.format(toDate(value))
}

/** KST 기준 오늘 날짜 키 */
export function todayKey() {
  return toDateKey(new Date())
}

/** 'YYYY-MM-DD' -> { year, month, day } (month 는 1~12) */
export function parseDateKey(dateKey) {
  const [year, month, day] = String(dateKey).split('-').map(Number)
  return { year, month, day }
}

/** year, month, day -> 'YYYY-MM-DD' */
export function buildDateKey(year, month, day) {
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return year + '-' + mm + '-' + dd
}

/** 요일 번호 (0=일요일) */
export function getWeekday(dateKey) {
  const { year, month, day } = parseDateKey(dateKey)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

/** '2026년 8월 29일 (토)' 형태 */
export function formatDate(value, { withWeekday = true } = {}) {
  if (!value) return ''
  const dateKey = toDateKey(value)
  const { year, month, day } = parseDateKey(dateKey)
  const base = year + '년 ' + month + '월 ' + day + '일'
  if (!withWeekday) return base
  return base + ' (' + WEEKDAY_LABELS[getWeekday(dateKey)] + ')'
}

/** '오후 3:20' 형태 */
export function formatTime(value) {
  if (!value) return ''
  return timeFormatter.format(toDate(value))
}

/** '2026년 8월 29일 (토) 오후 3:20' 형태 */
export function formatDateTime(value) {
  if (!value) return ''
  return formatDate(value) + ' ' + formatTime(value)
}

/** 상대 시간 ('방금 전', '3분 전', ...) */
export function fromNow(value) {
  if (!value) return ''
  const diff = Date.now() - toDate(value).getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '방금 전'
  if (diff < hour) return Math.floor(diff / minute) + '분 전'
  if (diff < day) return Math.floor(diff / hour) + '시간 전'
  if (diff < day * 7) return Math.floor(diff / day) + '일 전'
  return formatDate(value, { withWeekday: false })
}

/** year/month(1~12) 에 delta 개월을 더한 값 */
export function addMonths(year, month, delta) {
  const total = year * 12 + (month - 1) + delta
  return { year: Math.floor(total / 12), month: (total % 12) + 1 }
}

/** 해당 월의 마지막 일자 */
export function getDaysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function createCell(year, month, day, inMonth, today) {
  const dateKey = buildDateKey(year, month, day)
  return { dateKey, day, inMonth, isToday: dateKey === today }
}

/**
 * 달력 그리드를 만든다. 첫 번째 시작 요일은 항상 일요일이다.
 * 반환값: 주(week) 배열, 각 주는 7개의 셀을 가진다.
 */
export function buildMonthMatrix(year, month) {
  const firstWeekday = getWeekday(buildDateKey(year, month, 1))
  const daysInMonth = getDaysInMonth(year, month)
  const today = todayKey()
  const cells = []

  // 이전 달의 남은 날짜로 첫 주를 채운다.
  const prev = addMonths(year, month, -1)
  const prevDays = getDaysInMonth(prev.year, prev.month)
  for (let i = firstWeekday - 1; i >= 0; i -= 1) {
    cells.push(createCell(prev.year, prev.month, prevDays - i, false, today))
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(createCell(year, month, day, true, today))
  }

  // 마지막 주를 7칸으로 맞춘다.
  const next = addMonths(year, month, 1)
  let nextDay = 1
  while (cells.length % 7 !== 0) {
    cells.push(createCell(next.year, next.month, nextDay, false, today))
    nextDay += 1
  }

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}
