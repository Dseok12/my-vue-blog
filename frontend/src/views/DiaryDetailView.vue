<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import LoadingBlock from '@/components/common/LoadingBlock.vue'
import CommentSection from '@/components/comment/CommentSection.vue'
import DiaryMeta from '@/components/diary/DiaryMeta.vue'
import LikeButton from '@/components/diary/LikeButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useDiaryStore } from '@/stores/diary'
import { useUiStore } from '@/stores/ui'
import { formatDateTime } from '@/utils/date'
import '@/css/views/DiaryDetailView.css'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const diaryStore = useDiaryStore()
const uiStore = useUiStore()
const { current, loading, error } = storeToRefs(diaryStore)

const removing = ref(false)
const confirmOpen = ref(false)

const isMine = computed(() => current.value?.authorId === authStore.user?.id)
const isPublic = computed(() => current.value?.visibility === 'public')

watch(
  () => route.params.id,
  async (id) => {
    if (!id) return
    diaryStore.clearCurrent()
    try {
      await diaryStore.fetchOne(String(id))
    } catch {
      // 오류 메시지는 스토어의 error 로 화면에 표시한다.
    }
  },
  { immediate: true },
)

async function onRemove() {
  removing.value = true
  try {
    await diaryStore.remove(String(route.params.id))
    uiStore.notify.success('다이어리를 삭제했습니다.')
    router.push({ name: 'diary-list' })
  } catch (err) {
    uiStore.notify.error(err.message)
  } finally {
    removing.value = false
    confirmOpen.value = false
  }
}
</script>

<template>
  <div class="detail">
    <button class="detail__back" type="button" @click="router.back()">← 뒤로</button>

    <LoadingBlock v-if="loading && !current" />

    <p v-else-if="error && !current" class="detail__error">{{ error }}</p>

    <template v-else-if="current">
      <article class="detail__paper">
        <DiaryMeta :diary="current" :show-author="!isMine" />
        <h1 class="detail__title">{{ current.title }}</h1>
        <p class="detail__byline">
          {{ current.author.nickname }} · {{ formatDateTime(current.createdAt) }}
        </p>

        <p class="detail__content">{{ current.content }}</p>

        <div v-if="current.images.length" class="detail__images">
          <img
            v-for="image in current.images"
            :key="image.url"
            class="detail__image"
            :src="image.url"
            :alt="image.name"
          />
        </div>

        <div class="detail__bar">
          <LikeButton v-if="isPublic" :diary="current" />
          <span class="detail__spacer"></span>
          <template v-if="isMine">
            <BaseButton
              size="sm"
              variant="outline"
              @click="router.push({ name: 'diary-edit', params: { id: current.id } })"
            >
              수정
            </BaseButton>
            <BaseButton size="sm" variant="danger" @click="confirmOpen = true">삭제</BaseButton>
          </template>
        </div>
      </article>

      <CommentSection :diary="current" />
    </template>

    <BaseModal
      :open="confirmOpen"
      title="다이어리를 삭제할까요?"
      message="삭제하면 댓글과 좋아요도 함께 사라지며 되돌릴 수 없습니다."
      confirm-text="삭제"
      confirm-variant="danger"
      :loading="removing"
      @confirm="onRemove"
      @cancel="confirmOpen = false"
    />
  </div>
</template>
