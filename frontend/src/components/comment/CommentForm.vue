<script setup>
import { ref } from 'vue'

import BaseButton from '@/components/common/BaseButton.vue'
import { COMMENT_MAX_LENGTH } from '@/config'
import '@/css/components/CommentForm.css'

defineProps({
  placeholder: { type: String, default: '댓글을 남겨 보세요.' },
  submitText: { type: String, default: '등록' },
  submitting: { type: Boolean, default: false },
  /** 대댓글 작성용 (취소 버튼이 함께 보인다) */
  reply: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])

const content = ref('')

function onSubmit() {
  const value = content.value.trim()
  if (!value) return
  emit('submit', value)
}

function reset() {
  content.value = ''
}

defineExpose({ reset })
</script>

<template>
  <form class="comment-form" :class="{ 'comment-form--reply': reply }" @submit.prevent="onSubmit">
    <textarea
      v-model="content"
      class="comment-form__input"
      :placeholder="placeholder"
      :aria-label="placeholder"
      :maxlength="COMMENT_MAX_LENGTH"
    ></textarea>
    <div class="comment-form__actions">
      <BaseButton v-if="reply" size="sm" variant="ghost" @click="emit('cancel')">취소</BaseButton>
      <BaseButton size="sm" type="submit" :loading="submitting" :disabled="!content.trim()">
        {{ submitText }}
      </BaseButton>
    </div>
  </form>
</template>
