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
  <article class="card">
    <!--
      링크(<a>) 안에 버튼을 넣으면 잘못된 HTML 이 된다.
      그래서 제목만 링크로 두고, CSS 로 링크가 카드 전체를 덮게 해서 어디를 눌러도 상세로 간다.
      좋아요 버튼은 그 위에 올려 따로 눌린다. (DiaryCard.css 의 .card__link::after)
      주의: 이 주석을 <article> 밖(맨 위)에 두면 루트가 두 개가 되어 속성 전달이 깨진다.
    -->
    <DiaryMeta :diary="diary" :show-author="showAuthor" />
    <h3 class="card__title">
      <router-link class="card__link" :to="{ name: 'diary-detail', params: { id: diary.id } }">
        {{ diary.title }}
      </router-link>
    </h3>
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
      <LikeButton v-if="isPublic" class="card__like" :diary="diary" />
      <span class="card__spacer"></span>
      <span>{{ fromNow(diary.createdAt) }}</span>
    </div>
  </article>
</template>
