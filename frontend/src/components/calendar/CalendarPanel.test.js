/** components/calendar/CalendarPanel.vue 테스트 */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import CalendarPanel from './CalendarPanel.vue'

describe('CalendarPanel', () => {
  const mountAt = (props = {}) =>
    mount(CalendarPanel, { props: { modelValue: '2026-08-30', ...props } })

  it('요일 머리글은 일요일부터 시작한다', () => {
    const weekdays = mountAt()
      .findAll('.calendar__weekday')
      .map((item) => item.text())
    expect(weekdays).toEqual(['일', '월', '화', '수', '목', '금', '토'])
  })

  it('글이 있는 날에만 점을 찍는다', () => {
    const wrapper = mountAt({ counts: { '2026-08-30': 2 } })
    expect(wrapper.findAll('.calendar__dot')).toHaveLength(1)
    expect(wrapper.text()).toContain('이 달의 기록 2개')
  })

  it('날짜를 누르면 선택, 같은 날짜를 다시 누르면 해제한다', async () => {
    const wrapper = mountAt()
    const day = (label) =>
      wrapper
        .findAll('.calendar__day:not(.calendar__day--outside)')
        .find((cell) => cell.text() === label)

    await day('15').trigger('click')
    await day('30').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['2026-08-15'], ['']])
  })
})
