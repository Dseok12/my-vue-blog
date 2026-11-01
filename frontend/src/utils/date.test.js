/** utils/date.js 테스트 - `npm test` 로 실행한다. */
import { describe, expect, it } from 'vitest'

import { addMonths, buildMonthMatrix, formatDate, getDaysInMonth, toDateKey } from './date'

describe('toDateKey - 한국 시간 기준 날짜', () => {
  it('UTC 로는 전날이어도 KST 로 자정이 지났으면 다음 날이다', () => {
    // UTC 2026-08-29 15:30 = KST 2026-08-30 00:30
    expect(toDateKey(new Date('2026-08-29T15:30:00Z'))).toBe('2026-08-30')
    expect(toDateKey(new Date('2026-08-29T14:59:00Z'))).toBe('2026-08-29')
  })
})

describe('buildMonthMatrix - 캘린더', () => {
  it('첫 번째 칸은 항상 일요일이다', () => {
    // 2026년 8월 1일은 토요일 -> 첫 주는 7월 26일(일)부터 시작한다.
    const weeks = buildMonthMatrix(2026, 8)
    expect(weeks[0][0]).toMatchObject({ dateKey: '2026-07-26', inMonth: false })
    expect(weeks[0][6]).toMatchObject({ dateKey: '2026-08-01', inMonth: true })
  })

  it('모든 주는 7칸이다', () => {
    buildMonthMatrix(2026, 2).forEach((week) => expect(week).toHaveLength(7))
  })
})

describe('달 계산', () => {
  it('12월 다음은 다음 해 1월, 1월 이전은 전년 12월', () => {
    expect(addMonths(2026, 12, 1)).toEqual({ year: 2027, month: 1 })
    expect(addMonths(2026, 1, -1)).toEqual({ year: 2025, month: 12 })
  })

  it('윤년 2월은 29일까지다', () => {
    expect(getDaysInMonth(2028, 2)).toBe(29)
    expect(getDaysInMonth(2026, 2)).toBe(28)
  })
})

describe('formatDate', () => {
  it('요일을 붙여 보여 준다', () => {
    expect(formatDate('2026-08-30')).toBe('2026년 8월 30일 (일)')
    expect(formatDate('2026-08-30', { withWeekday: false })).toBe('2026년 8월 30일')
  })
})
