<script setup>
import { computed } from 'vue'

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
    <span v-if="showAuthor" class="meta__author">by {{ diary.author.nickname }}</span>
  </div>
</template>
