/**
 * stores/comment.js 테스트
 * 실제 API 대신 vi.mock 으로 만든 가짜 API 를 쓴다. (서버 없이 스토어 로직만 확인)
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { comments } from '@/api'
import { useCommentStore } from './comment'

vi.mock('@/api', () => ({
  comments: {
    list: vi.fn(),
    create: vi.fn(),
    remove: vi.fn(),
  },
}))

const flat = [
  { id: '1', parentId: null, content: '첫 댓글' },
  { id: '2', parentId: '1', content: '첫 댓글의 답글' },
  { id: '3', parentId: null, content: '두 번째 댓글' },
]

describe('comment 스토어', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    comments.list.mockResolvedValue({ items: flat.map((item) => ({ ...item })) })
  })

  it('평평한 목록을 부모-답글 트리로 바꾼다', async () => {
    const store = useCommentStore()
    await store.fetch('d1')

    expect(store.tree).toHaveLength(2)
    expect(store.tree[0].replies.map((reply) => reply.id)).toEqual(['2'])
    expect(store.count).toBe(3)
  })

  it('댓글을 지우면 그 답글도 함께 사라진다', async () => {
    comments.remove.mockResolvedValue({})
    const store = useCommentStore()
    await store.fetch('d1')

    await store.remove('d1', '1')
    expect(store.items.map((item) => item.id)).toEqual(['3'])
  })

  it('불러오기에 실패하면 error 에 메시지를 담는다', async () => {
    comments.list.mockRejectedValue(new Error('서버에 연결할 수 없습니다.'))
    const store = useCommentStore()
    await store.fetch('d1')

    expect(store.error).toBe('서버에 연결할 수 없습니다.')
    expect(store.items).toEqual([])
  })
})
