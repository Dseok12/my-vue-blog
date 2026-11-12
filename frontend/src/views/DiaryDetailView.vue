<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import LoadingBlock from '@/components/common/LoadingBlock.vue'
import NicknameLink from '@/components/common/NicknameLink.vue'
import CommentSection from '@/components/comment/CommentSection.vue'
import DiaryMeta from '@/components/diary/DiaryMeta.vue'
import LikeButton from '@/components/diary/LikeButton.vue'
import ReportModal from '@/components/diary/ReportModal.vue'
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
const reportOpen = ref(false)
const reporting = ref(false)

const isMine = computed(() => current.value?.authorId === authStore.user?.id)
const isPublic = computed(() => current.value?.visibility === 'public')
const isHidden = computed(() => Boolean(current.value?.isHidden))
const canReport = computed(() => isPublic.value && !isMine.value && !isHidden.value)

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
    diaryStore.refreshMonthlyCounts()
    uiStore.notify.success('다이어리를 삭제했습니다.')
    router.push({ name: 'diary-list' })
  } catch (err) {
    uiStore.notify.error(err.message)
  } finally {
    removing.value = false
    confirmOpen.value = false
  }
}

async function onReport(payload) {
  reporting.value = true
  try {
    await diaryStore.report(String(route.params.id), payload)
    reportOpen.value = false
    uiStore.notify.success('신고가 접수되었습니다. 검토 후 조치됩니다.')
    router.push({ name: 'feed' })
  } catch (err) {
    uiStore.notify.error(err.message)
  } finally {
    reporting.value = false
  }
}
</script>

<template>
  <div class="detail">
    <button class="detail__back" type="button" @click="router.back()">← 뒤로</button>

    <LoadingBlock v-if="loading && !current" />

    <p v-else-if="error && !current" class="detail__error">{{ error }}</p>

    <template v-else-if="current">
      <p v-if="isHidden && isMine" class="detail__notice">
        신고가 접수되어 이 글은 다른 회원에게 가려진 상태입니다. 관리자 검토 후 해제될 수 있습니다.
      </p>
      <p v-else-if="isHidden" class="detail__notice">
        신고로 가림 처리된 글입니다. 관리자 검토를 위해 표시됩니다.
      </p>

      <article class="detail__paper">
        <DiaryMeta :diary="current" :show-author="!isMine" />
        <h1 class="detail__title">{{ current.title }}</h1>
        <p class="detail__byline">
          <NicknameLink :user-id="current.author.id" :nickname="current.author.nickname" />
          · {{ formatDateTime(current.createdAt) }}
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
          <LikeButton v-if="isPublic && !isHidden" :diary="current" />
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
          <BaseButton v-else-if="canReport" size="sm" variant="ghost" @click="reportOpen = true">
            신고
          </BaseButton>
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

    <ReportModal
      :open="reportOpen"
      :submitting="reporting"
      @submit="onReport"
      @cancel="reportOpen = false"
    />
  </div>
</template>
