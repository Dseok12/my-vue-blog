<script setup>
import { ref } from 'vue'

import { useDiaryStore } from '@/stores/diary'
import { useUiStore } from '@/stores/ui'
import '@/css/components/LikeButton.css'

const props = defineProps({
  diary: { type: Object, required: true },
})

const diaryStore = useDiaryStore()
const uiStore = useUiStore()
const pending = ref(false)

async function onToggle() {
  if (pending.value) return
  pending.value = true
  try {
    await diaryStore.toggleLike(props.diary.id)
  } catch (error) {
    uiStore.notify.error(error.message)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <button
    class="like"
    :class="{ 'like--on': diary.likedByMe }"
    type="button"
    :disabled="pending"
    :aria-pressed="diary.likedByMe"
    @click="onToggle"
  >
    <span aria-hidden="true">{{ diary.likedByMe ? '♥' : '♡' }}</span>
    <span class="like__count">{{ diary.likeCount }}</span>
  </button>
</template>
