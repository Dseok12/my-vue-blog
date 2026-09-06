<script setup>
import { computed } from 'vue'

import NicknameLink from '@/components/common/NicknameLink.vue'
import { useAuthStore } from '@/stores/auth'
import { fromNow } from '@/utils/date'
import '@/css/components/CommentItem.css'

const props = defineProps({
  comment: { type: Object, required: true },
  /** 글 작성자 id - 작성자 뱃지 표시에 사용한다. */
  diaryAuthorId: { type: String, default: '' },
  /** 대댓글 여부 */
  reply: { type: Boolean, default: false },
})

const emit = defineEmits(['reply', 'remove'])

const authStore = useAuthStore()
const isMine = computed(() => authStore.user?.id === props.comment.authorId)
const isDiaryAuthor = computed(() => props.comment.authorId === props.diaryAuthorId)
</script>

<template>
  <div class="comment" :class="{ 'comment--reply': reply }">
    <div class="comment__head">
      <NicknameLink
        class="comment__author"
        :user-id="comment.author.id"
        :nickname="comment.author.nickname"
      />
      <span v-if="isDiaryAuthor" class="comment__badge">작성자</span>
      <span>{{ fromNow(comment.createdAt) }}</span>
    </div>

    <p class="comment__body">{{ comment.content }}</p>

    <div class="comment__actions">
      <button v-if="!reply" class="comment__action" type="button" @click="emit('reply', comment)">
        답글
      </button>
      <button
        v-if="isMine"
        class="comment__action comment__action--danger"
        type="button"
        @click="emit('remove', comment)"
      >
        삭제
      </button>
    </div>
  </div>
</template>
