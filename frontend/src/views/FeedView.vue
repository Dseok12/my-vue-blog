<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import EmptyState from '@/components/common/EmptyState.vue'
import LoadingBlock from '@/components/common/LoadingBlock.vue'
import LoadMoreButton from '@/components/common/LoadMoreButton.vue'
import DiaryCard from '@/components/diary/DiaryCard.vue'
import DiaryFilterBar from '@/components/diary/DiaryFilterBar.vue'
import { useDiaryStore } from '@/stores/diary'
import { useUiStore } from '@/stores/ui'
import '@/css/views/FeedView.css'

const diaryStore = useDiaryStore()
const uiStore = useUiStore()
const { feedItems, feedTotal, feedHasMore, feedLoadingMore, filters, loading, error } =
  storeToRefs(diaryStore)

function updateFilter(patch) {
  diaryStore.applyFilter(patch)
  diaryStore.fetchFeed()
}

async function loadMore() {
  try {
    await diaryStore.loadMoreFeed()
  } catch (err) {
    uiStore.notify.error(err.message)
  }
}

onMounted(() => {
  diaryStore.applyFilter({ dateKey: '', visibility: '' })
  diaryStore.fetchFeed()
})
</script>

<template>
  <div class="feed">
    <div class="feed__head">
      <h1 class="feed__title">공개 다이어리</h1>
      <p class="feed__subtitle">회원들이 공개한 기록입니다. 댓글과 좋아요로 마음을 전해 보세요.</p>
    </div>

    <DiaryFilterBar
      :category="filters.category"
      :keyword="filters.keyword"
      @update:category="updateFilter({ category: $event })"
      @update:keyword="updateFilter({ keyword: $event })"
    />

    <p v-if="error" class="feed__error">{{ error }}</p>

    <LoadingBlock v-if="loading" />

    <EmptyState
      v-else-if="!feedItems.length"
      icon="🌱"
      title="공개된 기록이 아직 없습니다."
      description="내 기록을 공개로 남기면 이곳에서 함께 볼 수 있습니다."
    />

    <template v-else>
      <ul class="feed__items">
        <li v-for="diary in feedItems" :key="diary.id">
          <DiaryCard :diary="diary" show-author />
        </li>
      </ul>

      <LoadMoreButton
        v-if="feedHasMore"
        :shown="feedItems.length"
        :total="feedTotal"
        :loading="feedLoadingMore"
        @load="loadMore"
      />
    </template>
  </div>
</template>
