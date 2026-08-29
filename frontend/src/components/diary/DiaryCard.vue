<script setup>
import { computed } from 'vue'

import DiaryMeta from './DiaryMeta.vue'
import LikeButton from './LikeButton.vue'
import { fromNow } from '@/utils/date'
import { summarize } from '@/utils/diary'
import '@/css/components/DiaryCard.css'

const props = defineProps({
  diary: { type: Object, required: true },
  /** 공개 다이어리 목록에서는 작성자와 좋아요를 함께 보여준다. */
  showAuthor: { type: Boolean, default: false },
})

const excerpt = computed(() => summarize(props.diary.content))
const isPublic = computed(() => props.diary.visibility === 'public')
</script>

<template>
  <router-link class="card" :to="{ name: 'diary-detail', params: { id: diary.id } }">
    <DiaryMeta :diary="diary" :show-author="showAuthor" />
    <h3 class="card__title">{{ diary.title }}</h3>
    <p class="card__excerpt u-clamp-3">{{ excerpt }}</p>

    <div v-if="diary.images.length" class="card__thumbs">
      <img
        v-for="image in diary.images.slice(0, 3)"
        :key="image.url"
        class="card__thumb"
        :src="image.url"
        :alt="image.name"
        loading="lazy"
      />
    </div>

    <div class="card__foot">
      <span class="card__stat">💬 {{ diary.commentCount }}</span>
      <LikeButton v-if="isPublic" :diary="diary" />
      <span class="card__spacer"></span>
      <span>{{ fromNow(diary.createdAt) }}</span>
    </div>
  </router-link>
</template>
