/** composables/usePagedList.js 테스트 */
import { describe, expect, it } from 'vitest'

import { usePagedList } from './usePagedList'

/** 1~25 번 글을 10개씩 돌려주는 가짜 API */
function fakeLoader(total = 25, size = 10) {
  const all = Array.from({ length: total }, (_, index) => ({ id: String(index + 1) }))
  return async (cursor) => {
    const start = cursor ? all.findIndex((item) => item.id === cursor) + 1 : 0
    const items = all.slice(start, start + size)
    const hasMore = start + size < all.length
    return { items, nextCursor: hasMore ? items[items.length - 1].id : null, total }
  }
}

describe('usePagedList', () => {
  it('reload 는 첫 페이지, loadMore 는 이어 붙인다', async () => {
    const list = usePagedList(fakeLoader())

    await list.reload()
    expect(list.items.value).toHaveLength(10)
    expect(list.hasMore.value).toBe(true)

    await list.loadMore()
    await list.loadMore()
    expect(list.items.value).toHaveLength(25)
    expect(list.hasMore.value).toBe(false)
    expect(list.items.value.at(-1).id).toBe('25')
  })

  it('늦게 도착한 이전 요청의 응답은 무시한다', async () => {
    const resolvers = []
    const list = usePagedList(() => new Promise((resolve) => resolvers.push(resolve)))

    const first = list.reload() // 예: 검색어 "a"
    const second = list.reload() // 예: 검색어 "ab"

    // 두 번째 응답이 먼저, 첫 번째 응답이 나중에 도착한다.
    resolvers[1]({ items: [{ id: 'ab' }], nextCursor: null, total: 1 })
    await second
    resolvers[0]({ items: [{ id: 'a' }], nextCursor: null, total: 1 })
    await first

    expect(list.items.value.map((item) => item.id)).toEqual(['ab'])
  })

  it('removeItem 은 목록과 전체 개수를 함께 줄인다', async () => {
    const list = usePagedList(fakeLoader(3))
    await list.reload()

    list.removeItem('2')
    expect(list.items.value.map((item) => item.id)).toEqual(['1', '3'])
    expect(list.total.value).toBe(2)
  })
})
