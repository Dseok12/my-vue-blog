/** 다이어리 목록 / 상세 / 작성·수정·삭제 상태 */
import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'

import { diaries as diaryApi, reports as reportApi } from '@/api'
import { parseDateKey, todayKey } from '@/utils/date'

/** 목록 필터의 초기값 */
function createFilters() {
  return { dateKey: '', category: '', visibility: '', keyword: '' }
}

export const useDiaryStore = defineStore('diary', () => {
  const items = ref([])
  const feedItems = ref([])
  const current = ref(null)
  const monthlyCounts = ref({})
  const filters = reactive(createFilters())
  const loading = ref(false)
  const error = ref('')

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
    update(items.value)
    update(feedItems.value)
    if (current.value?.id === id) Object.assign(current.value, patch)
  }

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

  async function fetchMine() {
    return run(async () => {
      const { items: list } = await diaryApi.listMine({ ...filters })
      items.value = list
      return list
    })
  }

  async function fetchFeed() {
    return run(async () => {
      const { items: list } = await diaryApi.listFeed({
        keyword: filters.keyword,
        category: filters.category,
      })
      feedItems.value = list
      return list
    })
  }

  async function fetchOne(id) {
    return run(async () => {
      const { diary } = await diaryApi.get(id)
      current.value = diary
      return diary
    })
  }

  async function fetchMonthlyCounts(dateKey = todayKey()) {
    const { year, month } = parseDateKey(dateKey)
    try {
      const { counts } = await diaryApi.monthlyCounts({ year, month, scope: 'mine' })
      monthlyCounts.value = counts
    } catch {
      monthlyCounts.value = {}
    }
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
      items.value = items.value.filter((item) => item.id !== id)
      feedItems.value = feedItems.value.filter((item) => item.id !== id)
      if (current.value?.id === id) current.value = null
    })
  }

  async function toggleLike(id) {
    const { liked, likeCount } = await diaryApi.toggleLike(id)
    syncDiary(id, { likedByMe: liked, likeCount })
    return liked
  }

  /** 게시물을 신고한다. 신고하면 자동으로 가림 처리되어 목록/피드에서 사라진다. */
  async function report(id, payload) {
    await reportApi.create(id, payload)
    items.value = items.value.filter((item) => item.id !== id)
    feedItems.value = feedItems.value.filter((item) => item.id !== id)
    if (current.value?.id === id) current.value = { ...current.value, isHidden: true }
  }

  function clearCurrent() {
    current.value = null
  }

  return {
    items,
    feedItems,
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
    fetchOne,
    fetchMonthlyCounts,
    create,
    update,
    remove,
    toggleLike,
    report,
    clearCurrent,
  }
})
