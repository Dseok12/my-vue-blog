<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import BaseButton from '@/components/common/BaseButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingBlock from '@/components/common/LoadingBlock.vue'
import { useAdminStore } from '@/stores/admin'
import { useUiStore } from '@/stores/ui'
import { formatDateTime } from '@/utils/date'
import '@/css/views/AdminView.css'

const adminStore = useAdminStore()
const uiStore = useUiStore()
const { reports, status, loading, error } = storeToRefs(adminStore)

const busyId = ref('')

const tabs = [
  { value: 'pending', label: '처리 대기' },
  { value: 'reviewed', label: '검토함' },
  { value: 'dismissed', label: '반려' },
  { value: '', label: '전체' },
]

const statusLabels = {
  pending: '처리 대기',
  reviewed: '검토함',
  dismissed: '반려',
}

async function run(id, task, successMessage) {
  busyId.value = id
  try {
    await task()
    uiStore.notify.success(successMessage)
  } catch (err) {
    uiStore.notify.error(err.message)
  } finally {
    busyId.value = ''
  }
}

function unhide(report) {
  run(report.id, () => adminStore.unhide(report.diaryId), '가림을 해제했습니다.')
}

function hide(report) {
  run(report.id, () => adminStore.hide(report.diaryId), '다시 가림 처리했습니다.')
}

function dismiss(report) {
  run(report.id, () => adminStore.dismiss(report.id), '신고를 반려했습니다.')
}

onMounted(() => adminStore.fetchReports())
</script>

<template>
  <div class="admin">
    <header class="admin__head">
      <h1 class="admin__title">신고 관리</h1>
      <p class="admin__subtitle">
        신고된 글은 자동으로 가림 처리됩니다. 검토 후 가림을 해제하거나 유지할 수 있습니다.
      </p>
    </header>

    <div class="admin__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value || 'all'"
        class="admin__tab"
        :class="{ 'admin__tab--on': status === tab.value }"
        type="button"
        @click="adminStore.setStatus(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <p v-if="error" class="admin__error">{{ error }}</p>

    <LoadingBlock v-if="loading" />

    <EmptyState v-else-if="!reports.length" icon="🛡️" title="표시할 신고가 없습니다." />

    <ul v-else class="admin__list">
      <li v-for="report in reports" :key="report.id" class="admin__item">
        <div class="admin__item-main">
          <div class="admin__item-head">
            <span class="admin__reason">{{ report.reasonLabel }}</span>
            <span class="admin__status" :class="`admin__status--${report.status}`">
              {{ statusLabels[report.status] || report.status }}
            </span>
            <span v-if="report.diaryHidden" class="admin__status admin__status--hidden">
              가림 중
            </span>
          </div>

          <router-link
            class="admin__diary"
            :to="{ name: 'diary-detail', params: { id: report.diaryId } }"
          >
            {{ report.diaryTitle }}
          </router-link>

          <p v-if="report.detail" class="admin__detail">“{{ report.detail }}”</p>

          <p class="admin__meta">
            작성자 {{ report.authorNickname }} · 신고자 {{ report.reporterNickname }} ·
            {{ formatDateTime(report.createdAt) }}
          </p>
        </div>

        <div class="admin__actions">
          <BaseButton
            v-if="report.diaryHidden"
            size="sm"
            variant="outline"
            :loading="busyId === report.id"
            @click="unhide(report)"
          >
            가림 해제
          </BaseButton>
          <BaseButton
            v-else
            size="sm"
            variant="outline"
            :loading="busyId === report.id"
            @click="hide(report)"
          >
            다시 가림
          </BaseButton>
          <BaseButton
            v-if="report.status === 'pending'"
            size="sm"
            variant="ghost"
            :loading="busyId === report.id"
            @click="dismiss(report)"
          >
            반려
          </BaseButton>
        </div>
      </li>
    </ul>
  </div>
</template>
