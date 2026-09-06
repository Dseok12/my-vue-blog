<script setup>
import { computed } from 'vue'

import NicknameLink from '@/components/common/NicknameLink.vue'
import { formatDate } from '@/utils/date'
import { getCategoryLabel, getMoodLabel, getVisibilityLabel } from '@/utils/diary'
import '@/css/components/DiaryMeta.css'

const props = defineProps({
  diary: { type: Object, required: true },
  /** 작성자 닉네임 표시 여부 (공개 다이어리 목록에서 사용) */
  showAuthor: { type: Boolean, default: false },
})

const moodLabel = computed(() => getMoodLabel(props.diary.mood))
const visibilityLabel = computed(() => getVisibilityLabel(props.diary.visibility))
</script>

<template>
  <div class="meta">
    <span class="meta__date">{{ formatDate(diary.dateKey) }}</span>
    <span class="meta__tag meta__tag--category">{{ getCategoryLabel(diary.category) }}</span>
    <span v-if="moodLabel" class="meta__tag">{{ moodLabel }}</span>
    <span class="meta__tag" :class="`meta__tag--${diary.visibility}`">{{ visibilityLabel }}</span>
    <span v-if="diary.isHidden" class="meta__tag meta__tag--hidden">가림 처리됨</span>
    <span v-if="showAuthor" class="meta__author">
      by <NicknameLink :user-id="diary.author.id" :nickname="diary.author.nickname" />
    </span>
  </div>
</template>
