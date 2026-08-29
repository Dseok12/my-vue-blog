/** 댓글 / 대댓글 상태 */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { comments as commentApi } from '@/api'

export const useCommentStore = defineStore('comment', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref('')

  /** 부모 댓글 아래에 대댓글을 붙인 트리 구조 */
  const tree = computed(() => {
    const roots = items.value.filter((comment) => !comment.parentId)
    return roots.map((root) => ({
      ...root,
      replies: items.value.filter((comment) => comment.parentId === root.id),
    }))
  })

  const count = computed(() => items.value.length)

  async function fetch(diaryId) {
    loading.value = true
    error.value = ''
    try {
      const { items: list } = await commentApi.list(diaryId)
      items.value = list
    } catch (err) {
      error.value = err.message
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function create(diaryId, { content, parentId = null }) {
    const { comment } = await commentApi.create(diaryId, { content, parentId })
    items.value.push(comment)
    return comment
  }

  async function remove(diaryId, commentId) {
    await commentApi.remove(diaryId, commentId)
    items.value = items.value.filter(
      (item) => item.id !== commentId && item.parentId !== commentId,
    )
  }

  function clear() {
    items.value = []
    error.value = ''
  }

  return { items, tree, count, loading, error, fetch, create, remove, clear }
})
