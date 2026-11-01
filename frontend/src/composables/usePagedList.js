/**
 * "더 보기" 목록 상태 - 첫 페이지 다시 불러오기(reload)와 다음 페이지 이어 붙이기(loadMore).
 *
 * loadPage(cursor) 는 { items, nextCursor, total } 을 돌려주는 함수다.
 * cursor 가 null 이면 첫 페이지, nextCursor 가 null 이면 마지막 페이지다.
 */
import { computed, ref } from 'vue'

export function usePagedList(loadPage) {
  const items = ref([])
  const nextCursor = ref(null)
  const total = ref(0)
  const loadingMore = ref(false)

  const hasMore = computed(() => Boolean(nextCursor.value))

  // 필터를 빠르게 바꾸면 응답이 요청 순서와 다르게 도착할 수 있다.
  // 요청마다 번호를 붙이고, 가장 마지막 요청의 응답만 화면에 반영한다.
  let version = 0

  function applyPage(page) {
    nextCursor.value = page.nextCursor ?? null
    total.value = page.total ?? items.value.length
  }

  async function reload() {
    version += 1
    const requestVersion = version
    const page = await loadPage(null)
    if (requestVersion !== version) return items.value

    items.value = page.items
    applyPage(page)
    return page.items
  }

  async function loadMore() {
    if (!nextCursor.value || loadingMore.value) return

    const requestVersion = version
    loadingMore.value = true
    try {
      const page = await loadPage(nextCursor.value)
      if (requestVersion !== version) return

      items.value.push(...page.items)
      applyPage(page)
    } finally {
      loadingMore.value = false
    }
  }

  /** 삭제한 글을 목록에서 뺀다. */
  function removeItem(id) {
    const before = items.value.length
    items.value = items.value.filter((item) => item.id !== id)
    if (items.value.length < before) total.value = Math.max(0, total.value - 1)
  }

  return { items, nextCursor, total, loadingMore, hasMore, reload, loadMore, removeItem }
}
