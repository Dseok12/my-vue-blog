/** 다이어리 목록 / 상세 / 작성·수정·삭제 상태 */
import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'

import { diaries as diaryApi } from '@/api'
import { usePagedList } from '@/composables/usePagedList'
import { parseDateKey, todayKey } from '@/utils/date'

/** 한 번에 불러오는 글 개수 ("더 보기" 한 번에 늘어나는 개수) */
const PAGE_SIZE = 10

/** 목록 필터의 초기값 */
function createFilters() {
  return { dateKey: '', category: '', visibility: '', keyword: '' }
}

export const useDiaryStore = defineStore('diary', () => {
  const filters = reactive(createFilters())
  const current = ref(null)
  const monthlyCounts = ref({})
  /** 캘린더가 보고 있는 달 (그 달의 아무 날짜 키) - 글을 쓰거나 지운 뒤 다시 셀 때 쓴다. */
  const countsMonth = ref(todayKey())
  const loading = ref(false)
  const error = ref('')

  // 내 다이어리 / 공개 피드 - 둘 다 "더 보기" 목록이다.
  const mine = usePagedList((cursor) => diaryApi.listMine({ ...filters, cursor, limit: PAGE_SIZE }))
  const feed = usePagedList((cursor) =>
    diaryApi.listFeed({
      keyword: filters.keyword,
      category: filters.category,
      cursor,
      limit: PAGE_SIZE,
    }),
  )

  const hasFilter = computed(() =>
    Boolean(filters.dateKey || filters.category || filters.visibility || filters.keyword),
  )

  function applyFilter(patch) {
    Object.assign(filters, patch)
  }

  function resetFilters() {
    Object.assign(filters, createFilters())
  }

  /** 목록/상세에 있는 같은 글의 좋아요·댓글 수를 함께 맞춘다. */
  function syncDiary(id, patch) {
    const update = (list) => {
      const target = list.find((item) => item.id === id)
      if (target) Object.assign(target, patch)
    }
    update(mine.items.value)
    update(feed.items.value)
    if (current.value?.id === id) Object.assign(current.value, patch)
  }

  /** 로딩 / 오류 처리를 한 곳에서 한다. 오류는 화면에서도 잡을 수 있게 다시 던진다. */
  async function run(task) {
    loading.value = true
    error.value = ''
    try {
      return await task()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /** 첫 페이지부터 다시 불러온다. (필터가 바뀌었을 때) */
  function fetchMine() {
    return run(mine.reload)
  }

  function fetchFeed() {
    return run(feed.reload)
  }

  /** 다음 페이지를 이어 붙인다. 오류는 화면에서 토스트로 보여 준다. */
  function loadMoreMine() {
    return mine.loadMore()
  }

  function loadMoreFeed() {
    return feed.loadMore()
  }

  async function fetchOne(id) {
    return run(async () => {
      const { diary } = await diaryApi.get(id)
      current.value = diary
      return diary
    })
  }

  async function fetchMonthlyCounts(dateKey = countsMonth.value) {
    countsMonth.value = dateKey
    const { year, month } = parseDateKey(dateKey)
    try {
      const { counts } = await diaryApi.monthlyCounts({ year, month, scope: 'mine' })
      monthlyCounts.value = counts
    } catch {
      // 캘린더 점 표시는 부가 정보이므로 실패하면 비워 둔다.
      monthlyCounts.value = {}
    }
  }

  /** 캘린더가 보고 있는 달을 다시 센다. (글 작성 / 수정 / 삭제 뒤) */
  function refreshMonthlyCounts() {
    return fetchMonthlyCounts(countsMonth.value)
  }

  async function create(payload) {
    return run(async () => {
      const { diary } = await diaryApi.create(payload)
      return diary
    })
  }

  async function update(id, payload) {
    return run(async () => {
      const { diary } = await diaryApi.update(id, payload)
      current.value = diary
      return diary
    })
  }

  async function remove(id) {
    return run(async () => {
      await diaryApi.remove(id)
      mine.removeItem(id)
      feed.removeItem(id)
      if (current.value?.id === id) current.value = null
    })
  }

  async function toggleLike(id) {
    const { liked, likeCount } = await diaryApi.toggleLike(id)
    syncDiary(id, { likedByMe: liked, likeCount })
    return liked
  }

  function clearCurrent() {
    current.value = null
  }

  return {
    // 내 다이어리
    items: mine.items,
    total: mine.total,
    hasMore: mine.hasMore,
    loadingMore: mine.loadingMore,
    // 공개 피드
    feedItems: feed.items,
    feedTotal: feed.total,
    feedHasMore: feed.hasMore,
    feedLoadingMore: feed.loadingMore,
    // 공통
    current,
    monthlyCounts,
    filters,
    loading,
    error,
    hasFilter,
    applyFilter,
    resetFilters,
    syncDiary,
    fetchMine,
    fetchFeed,
    loadMoreMine,
    loadMoreFeed,
    fetchOne,
    fetchMonthlyCounts,
    refreshMonthlyCounts,
    create,
    update,
    remove,
    toggleLike,
    clearCurrent,
  }
})
