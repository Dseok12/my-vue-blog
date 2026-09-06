/** 관리자 - 신고 검토 / 가림 해제 */
import { ref } from 'vue'
import { defineStore } from 'pinia'

import { admin as adminApi } from '@/api'

export const useAdminStore = defineStore('admin', () => {
  const reports = ref([])
  const status = ref('pending')
  const loading = ref(false)
  const error = ref('')

  async function fetchReports() {
    loading.value = true
    error.value = ''
    try {
      const { items } = await adminApi.listReports(
        status.value ? { status: status.value } : {},
      )
      reports.value = items
    } catch (err) {
      error.value = err.message
      reports.value = []
    } finally {
      loading.value = false
    }
  }

  function setStatus(next) {
    status.value = next
    return fetchReports()
  }

  async function unhide(diaryId) {
    await adminApi.unhideDiary(diaryId)
    await fetchReports()
  }

  async function hide(diaryId) {
    await adminApi.hideDiary(diaryId)
    await fetchReports()
  }

  async function dismiss(reportId) {
    await adminApi.dismissReport(reportId)
    await fetchReports()
  }

  return { reports, status, loading, error, fetchReports, setStatus, unhide, hide, dismiss }
})
