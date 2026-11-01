<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import CalendarPanel from '@/components/calendar/CalendarPanel.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useDiaryStore } from '@/stores/diary'
import { useUiStore } from '@/stores/ui'
import { buildDateKey } from '@/utils/date'
import '@/css/layouts/AppSidebar.css'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const diaryStore = useDiaryStore()
const { sidebarOpen } = storeToRefs(uiStore)
const { monthlyCounts } = storeToRefs(diaryStore)

// 화면 폭이 좁으면 사이드바가 본문 위를 덮으므로 배경을 어둡게 한다.
const isNarrow = useMediaQuery('(max-width: 1023px)')
const showBackdrop = computed(() => sidebarOpen.value && isNarrow.value)
const selectedDate = computed({
  get: () => String(route.query.date || ''),
  set: (value) => {
    const query = value ? { date: value } : {}
    router.push({ name: 'diary-list', query })
    if (isNarrow.value) uiStore.setSidebar(false)
  },
})

function onMonthChange({ year, month }) {
  diaryStore.fetchMonthlyCounts(buildDateKey(year, month, 1))
}
</script>

<template>
  <div v-if="showBackdrop" class="sidebar__backdrop" @click="uiStore.setSidebar(false)"></div>

  <aside class="sidebar" :class="{ 'sidebar--closed': !sidebarOpen }" aria-label="캘린더">
    <div class="sidebar__section">
      <p class="sidebar__title">캘린더</p>
      <CalendarPanel v-model="selectedDate" :counts="monthlyCounts" @month-change="onMonthChange" />
      <p class="sidebar__hint">
        점이 있는 날짜에 기록이 있습니다. 날짜를 다시 누르면 전체 목록으로 돌아갑니다.
      </p>
    </div>
  </aside>

  <button
    class="sidebar__toggle"
    type="button"
    :aria-expanded="sidebarOpen"
    @click="uiStore.toggleSidebar()"
  >
    <span aria-hidden="true">📅</span>
    <span>{{ sidebarOpen ? '캘린더 접기' : '캘린더 펼치기' }}</span>
  </button>
</template>
