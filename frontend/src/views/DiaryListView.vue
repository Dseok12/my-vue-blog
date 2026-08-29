<script setup>
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/common/BaseButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingBlock from '@/components/common/LoadingBlock.vue'
import DiaryCard from '@/components/diary/DiaryCard.vue'
import DiaryFilterBar from '@/components/diary/DiaryFilterBar.vue'
import { useAuthStore } from '@/stores/auth'
import { useDiaryStore } from '@/stores/diary'
import { formatDate } from '@/utils/date'
import '@/css/views/DiaryListView.css'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const diaryStore = useDiaryStore()
const { items, filters, loading, error } = storeToRefs(diaryStore)

const selectedDate = computed(() => String(route.query.date || ''))

const subtitle = computed(() => {
  if (selectedDate.value) return formatDate(selectedDate.value) + ' 의 기록'
  return authStore.nickname + ' 님이 남긴 기록 ' + items.value.length + '개'
})

function clearDate() {
  router.push({ name: 'diary-list' })
}

// 캘린더에서 고른 날짜(주소의 date)를 목록 필터에 반영한다.
watch(
  selectedDate,
  (value) => {
    diaryStore.applyFilter({ dateKey: value })
    diaryStore.fetchMine()
  },
  { immediate: true },
)

function updateFilter(patch) {
  diaryStore.applyFilter(patch)
  diaryStore.fetchMine()
}

onMounted(() => {
  diaryStore.fetchMonthlyCounts(selectedDate.value || undefined)
})
</script>

<template>
  <div class="list">
    <div class="list__head">
      <div>
        <h1 class="list__title">내 다이어리</h1>
        <p class="list__subtitle">{{ subtitle }}</p>
      </div>
      <div class="list__actions">
        <BaseButton v-if="selectedDate" variant="outline" @click="clearDate">
          전체 보기
        </BaseButton>
        <BaseButton @click="router.push({ name: 'diary-create' })">새 기록 쓰기</BaseButton>
      </div>
    </div>

    <DiaryFilterBar
      show-visibility
      :category="filters.category"
      :keyword="filters.keyword"
      :visibility="filters.visibility"
      @update:category="updateFilter({ category: $event })"
      @update:keyword="updateFilter({ keyword: $event })"
      @update:visibility="updateFilter({ visibility: $event })"
    />

    <p v-if="error" class="list__error">{{ error }}</p>

    <LoadingBlock v-if="loading" />

    <EmptyState
      v-else-if="!items.length"
      icon="🕊️"
      title="아직 기록이 없습니다."
      description="오늘 있었던 일, 읽은 책, 지금의 감정을 남겨 보세요."
    >
      <template #action>
        <BaseButton @click="router.push({ name: 'diary-create' })">첫 기록 남기기</BaseButton>
      </template>
    </EmptyState>

    <ul v-else class="list__items">
      <li v-for="diary in items" :key="diary.id">
        <DiaryCard :diary="diary" />
      </li>
    </ul>
  </div>
</template>
