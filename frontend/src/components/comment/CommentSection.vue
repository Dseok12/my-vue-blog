<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import CommentForm from './CommentForm.vue'
import CommentItem from './CommentItem.vue'
import LoadingBlock from '@/components/common/LoadingBlock.vue'
import { useCommentStore } from '@/stores/comment'
import { useDiaryStore } from '@/stores/diary'
import { useUiStore } from '@/stores/ui'
import '@/css/components/CommentSection.css'

const props = defineProps({
  diary: { type: Object, required: true },
})

const commentStore = useCommentStore()
const diaryStore = useDiaryStore()
const uiStore = useUiStore()
const { tree, count, loading } = storeToRefs(commentStore)

const rootForm = ref(null)
const replyTarget = ref(null)
const submitting = ref(false)

watch(
  () => props.diary.id,
  (id) => {
    replyTarget.value = null
    if (id) commentStore.fetch(id)
  },
  { immediate: true },
)

onBeforeUnmount(() => commentStore.clear())

/** 댓글 수가 바뀌면 목록/상세의 표시값도 함께 맞춘다. */
function syncCount() {
  diaryStore.syncDiary(props.diary.id, { commentCount: commentStore.items.length })
}

async function addComment(content, parentId = null) {
  submitting.value = true
  try {
    await commentStore.create(props.diary.id, { content, parentId })
    syncCount()
    if (parentId) {
      replyTarget.value = null
    } else {
      rootForm.value?.reset()
    }
  } catch (error) {
    uiStore.notify.error(error.message)
  } finally {
    submitting.value = false
  }
}

async function removeComment(comment) {
  try {
    await commentStore.remove(props.diary.id, comment.id)
    syncCount()
    uiStore.notify.success('댓글을 삭제했습니다.')
  } catch (error) {
    uiStore.notify.error(error.message)
  }
}
</script>

<template>
  <section class="comments">
    <div class="comments__head">
      <h2 class="comments__title">댓글</h2>
      <span class="comments__count">{{ count }}개</span>
    </div>

    <p v-if="diary.visibility !== 'public'" class="comments__locked">
      비공개 글에는 댓글을 남길 수 없습니다. 공개로 바꾸면 다른 회원과 이야기를 나눌 수 있습니다.
    </p>

    <template v-else>
      <CommentForm ref="rootForm" :submitting="submitting" @submit="addComment($event)" />

      <LoadingBlock v-if="loading" message="댓글을 불러오는 중입니다." />

      <p v-else-if="!tree.length" class="comments__empty">첫 댓글을 남겨 보세요.</p>

      <ul v-else class="comments__list">
        <li v-for="comment in tree" :key="comment.id">
          <CommentItem
            :comment="comment"
            :diary-author-id="diary.authorId"
            @reply="replyTarget = comment"
            @remove="removeComment"
          />

          <div v-if="replyTarget?.id === comment.id" class="comments__reply-form">
            <CommentForm
              reply
              submit-text="답글 등록"
              :submitting="submitting"
              :placeholder="comment.author.nickname + ' 님에게 답글 남기기'"
              @submit="addComment($event, comment.id)"
              @cancel="replyTarget = null"
            />
          </div>

          <ul v-if="comment.replies.length" class="comments__replies">
            <li v-for="child in comment.replies" :key="child.id">
              <CommentItem
                reply
                :comment="child"
                :diary-author-id="diary.authorId"
                @remove="removeComment"
              />
            </li>
          </ul>
        </li>
      </ul>
    </template>
  </section>
</template>
