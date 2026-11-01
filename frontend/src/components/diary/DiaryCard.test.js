/** components/diary/DiaryCard.vue 테스트 */
import { describe, expect, it } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia } from 'pinia'

import DiaryCard from './DiaryCard.vue'

const diary = {
  id: '1',
  authorId: 'u1',
  author: { id: 'u1', nickname: '데모' },
  title: '오늘의 기록',
  content: '산책을 했다.',
  category: 'diary',
  mood: 'calm',
  dateKey: '2026-08-30',
  visibility: 'public',
  images: [],
  likeCount: 3,
  likedByMe: false,
  commentCount: 1,
  createdAt: '2026-08-30T12:00:00.000Z',
}

describe('DiaryCard', () => {
  const mountCard = () =>
    mount(DiaryCard, {
      props: { diary },
      // 실제 라우터 대신 RouterLinkStub 을 쓴다. (to 값만 확인)
      global: { plugins: [createPinia()], stubs: { RouterLink: RouterLinkStub } },
    })

  it('제목 링크는 상세 화면으로 간다', () => {
    const link = mountCard().findComponent(RouterLinkStub)
    expect(link.props('to')).toEqual({ name: 'diary-detail', params: { id: '1' } })
    expect(link.text()).toBe('오늘의 기록')
  })

  it('좋아요 버튼은 링크 바깥에 있다 (a 안에 button 금지)', () => {
    const wrapper = mountCard()
    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.find('a button').exists()).toBe(false)
    expect(wrapper.find('button.like').exists()).toBe(true)
  })
})
