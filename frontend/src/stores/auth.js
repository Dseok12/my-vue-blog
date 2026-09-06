/** 로그인 사용자 상태 */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { auth as authApi, users as usersApi } from '@/api'
import { STORAGE_KEYS } from '@/config'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem(STORAGE_KEYS.token) || '')
  const loading = ref(false)
  const error = ref('')
  const restored = ref(false)

  const isLoggedIn = computed(() => Boolean(user.value))
  const nickname = computed(() => user.value?.nickname || '')
  const isAdmin = computed(() => Boolean(user.value?.isAdmin))

  function saveSession(payload) {
    user.value = payload.user
    token.value = payload.token
    localStorage.setItem(STORAGE_KEYS.token, payload.token)
  }

  function clearSession() {
    user.value = null
    token.value = ''
    localStorage.removeItem(STORAGE_KEYS.token)
  }

  /** 새로고침 후 토큰으로 로그인 상태를 복구한다. */
  async function restore() {
    if (restored.value) return isLoggedIn.value
    restored.value = true
    if (!token.value) return false

    try {
      const { user: me } = await authApi.me()
      user.value = me
      return true
    } catch {
      clearSession()
      return false
    }
  }

  async function login(form) {
    loading.value = true
    error.value = ''
    try {
      saveSession(await authApi.login(form))
      restored.value = true
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function signup(form) {
    loading.value = true
    error.value = ''
    try {
      saveSession(await authApi.signup(form))
      restored.value = true
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } finally {
      clearSession()
    }
  }

  /** 마이페이지에서 닉네임/비밀번호를 바꾼다. 성공하면 true. */
  async function updateProfile(payload) {
    loading.value = true
    error.value = ''
    try {
      const { user: updated } = await usersApi.updateMe(payload)
      user.value = updated
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  function resetError() {
    error.value = ''
  }

  return {
    user,
    token,
    loading,
    error,
    isLoggedIn,
    nickname,
    isAdmin,
    restore,
    login,
    signup,
    logout,
    updateProfile,
    resetError,
    clearSession,
  }
})
