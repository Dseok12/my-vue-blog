/**
 * stores/diary.js 테스트 - 목록 불러오기 실패 처리와, 같은 글을 여러 목록에서 함께 맞추는 동작
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { diaries } from '@/api'
import { useDiaryStore } from './diary'
import { useUserStore } from './user'

vi.mock('@/api', () => ({
  diaries: {
    listMine: vi.fn(),
    listFeed: vi.fn(),
    toggleLike: vi.fn(),
    remove: vi.fn(),
  },
  reports: { create: vi.fn() },
  users: { profile: vi.fn(), diaries: vi.fn() },
}))

const diary = (id, patch = {}) => ({
  id,
  title: '글 ' + id,
  likeCount: 0,
  likedByMe: false,
  ...patch,
})

describe('diary 스토어', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('목록 불러오기에 실패하면 오류를 던지지 않고 error 에 메시지를 담는다', async () => {
    diaries.listMine.mockRejectedValue(new Error('서버에 연결할 수 없습니다.'))
    const store = useDiaryStore()

    // 화면은 fetchMine() 을 기다리지 않고 부른다. 여기서 던지면 아무도 잡지 않는 오류가 된다.
    await expect(store.fetchMine()).resolves.toEqual([])
    expect(store.error).toBe('서버에 연결할 수 없습니다.')
    expect(store.loading).toBe(false)
  })

  it('좋아요를 누르면 내 목록 / 피드 / 마이페이지의 같은 글이 함께 바뀐다', async () => {
    diaries.listMine.mockResolvedValue({ items: [diary('1')], nextCursor: null, total: 1 })
    diaries.listFeed.mockResolvedValue({ items: [diary('1')], nextCursor: null, total: 1 })
    diaries.toggleLike.mockResolvedValue({ liked: true, likeCount: 1 })

    const store = useDiaryStore()
    const userStore = useUserStore()
    userStore.diaries = [diary('1'), diary('2')]
    await store.fetchMine()
    await store.fetchFeed()

    await store.toggleLike('1')

    expect(store.items[0]).toMatchObject({ likedByMe: true, likeCount: 1 })
    expect(store.feedItems[0]).toMatchObject({ likedByMe: true, likeCount: 1 })
    expect(userStore.diaries[0]).toMatchObject({ likedByMe: true, likeCount: 1 })
    expect(userStore.diaries[1].likeCount).toBe(0)
  })

  it('글을 지우면 목록과 전체 개수, 마이페이지 목록에서 함께 빠진다', async () => {
    diaries.listMine.mockResolvedValue({
      items: [diary('1'), diary('2')],
      nextCursor: null,
      total: 2,
    })
    diaries.remove.mockResolvedValue({})

    const store = useDiaryStore()
    const userStore = useUserStore()
    userStore.profile = { id: 'u1', nickname: '데모', diaryCount: 2 }
    userStore.diaries = [diary('1'), diary('2')]
    await store.fetchMine()

    await store.remove('1')

    expect(store.items.map((item) => item.id)).toEqual(['2'])
    expect(store.total).toBe(1)
    expect(userStore.diaries.map((item) => item.id)).toEqual(['2'])
    expect(userStore.profile.diaryCount).toBe(1)
  })
})
