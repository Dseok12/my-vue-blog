/** 마이페이지 - 특정 회원의 프로필과 그 회원이 쓴 글 목록 */
import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'

import { users as usersApi } from '@/api'

function createFilters() {
  return { category: '', keyword: '' }
}

export const useUserStore = defineStore('user', () => {
  const profile = ref(null)
  const isMe = ref(false)
  const diaries = ref([])
  const filters = reactive(createFilters())
  const loading = ref(false)
  const error = ref('')

  function applyFilter(patch) {
    Object.assign(filters, patch)
  }

  function reset() {
    profile.value = null
    isMe.value = false
    diaries.value = []
    Object.assign(filters, createFilters())
    error.value = ''
  }

  async function fetchProfile(userId) {
    loading.value = true
    error.value = ''
    try {
      const { user, isMe: mine } = await usersApi.profile(userId)
      profile.value = user
      isMe.value = mine
    } catch (err) {
      error.value = err.message
      profile.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchDiaries(userId) {
    loading.value = true
    error.value = ''
    try {
      const { items } = await usersApi.diaries(userId, { ...filters })
      diaries.value = items
    } catch (err) {
      error.value = err.message
      diaries.value = []
    } finally {
      loading.value = false
    }
  }

  /** 삭제한 글을 마이페이지 목록에서도 뺀다. (stores/diary.js 의 remove 가 부른다) */
  function removeDiary(id) {
    const before = diaries.value.length
    diaries.value = diaries.value.filter((item) => item.id !== id)
    if (profile.value && diaries.value.length < before) {
      profile.value.diaryCount = Math.max(0, profile.value.diaryCount - 1)
    }
  }

  /** 프로필 화면에서 닉네임이 바뀌면 표시값도 맞춘다. */
  function patchProfileNickname(nickname) {
    if (profile.value) profile.value.nickname = nickname
  }

  return {
    profile,
    isMe,
    diaries,
    filters,
    loading,
    error,
    applyFilter,
    reset,
    fetchProfile,
    fetchDiaries,
    removeDiary,
    patchProfileNickname,
  }
})
