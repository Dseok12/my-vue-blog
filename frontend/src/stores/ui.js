/** 화면 공통 상태 - 사이드바 토글, 토스트 메시지 */
import { ref } from 'vue'
import { defineStore } from 'pinia'

import { STORAGE_KEYS } from '@/config'

let toastSequence = 0

/** 캘린더 사이드바의 첫 상태 - 저장된 값이 없으면 넓은 화면에서만 펼친다. */
function readInitialSidebar() {
  const stored = localStorage.getItem(STORAGE_KEYS.sidebar)
  if (stored) return stored === 'open'
  return window.innerWidth >= 1024
}

export const useUiStore = defineStore('ui', () => {
  // 캘린더 사이드바는 마지막 상태를 기억한다.
  const sidebarOpen = ref(readInitialSidebar())
  const toasts = ref([])

  function setSidebar(open) {
    sidebarOpen.value = open
    localStorage.setItem(STORAGE_KEYS.sidebar, open ? 'open' : 'closed')
  }

  function toggleSidebar() {
    setSidebar(!sidebarOpen.value)
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function pushToast(message, type = 'info') {
    if (!message) return
    toastSequence += 1
    const id = toastSequence
    toasts.value.push({ id, message, type })
    setTimeout(() => removeToast(id), 2600)
  }

  const notify = {
    info: (message) => pushToast(message, 'info'),
    success: (message) => pushToast(message, 'success'),
    error: (message) => pushToast(message, 'error'),
  }

  return { sidebarOpen, toasts, setSidebar, toggleSidebar, pushToast, removeToast, notify }
})
