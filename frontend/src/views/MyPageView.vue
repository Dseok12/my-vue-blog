<script setup>
import { computed, onBeforeUnmount, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import EmptyState from '@/components/common/EmptyState.vue'
import LoadingBlock from '@/components/common/LoadingBlock.vue'
import DiaryCard from '@/components/diary/DiaryCard.vue'
import DiaryFilterBar from '@/components/diary/DiaryFilterBar.vue'
import ProfileEditForm from '@/components/user/ProfileEditForm.vue'
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils/date'
import '@/css/views/MyPageView.css'

const route = useRoute()
const userStore = useUserStore()
const { profile, isMe, diaries, filters, loading, error } = storeToRefs(userStore)

const userId = computed(() => String(route.params.id))

const heading = computed(() => (isMe.value ? '마이페이지' : profile.value?.nickname + ' 님의 기록'))

async function load() {
  userStore.reset()
  await userStore.fetchProfile(userId.value)
  if (profile.value) await userStore.fetchDiaries(userId.value)
}

function updateFilter(patch) {
  userStore.applyFilter(patch)
  userStore.fetchDiaries(userId.value)
}

function onProfileUpdated(nickname) {
  userStore.patchProfileNickname(nickname)
}

watch(userId, load, { immediate: true })
onBeforeUnmount(() => userStore.reset())
</script>

<template>
  <div class="mypage">
    <button class="mypage__back" type="button" @click="$router.back()">← 뒤로</button>

    <LoadingBlock v-if="loading && !profile" />

    <p v-else-if="error && !profile" class="mypage__error">{{ error }}</p>

    <template v-else-if="profile">
      <header class="mypage__header">
        <div class="mypage__avatar" aria-hidden="true">{{ profile.nickname.slice(0, 1) }}</div>
        <div class="mypage__info">
          <h1 class="mypage__title">{{ heading }}</h1>
          <p class="mypage__meta">
            <span>{{ profile.nickname }}</span>
            <span class="mypage__dot">·</span>
            <span>가입일 {{ formatDate(profile.joinedAt, { withWeekday: false }) }}</span>
            <span class="mypage__dot">·</span>
            <span>기록 {{ profile.diaryCount }}개</span>
          </p>
        </div>
      </header>

      <ProfileEditForm
        v-if="isMe"
        :current-nickname="profile.nickname"
        @updated="onProfileUpdated"
      />

      <section class="mypage__records">
        <h2 class="mypage__records-title">
          {{ isMe ? '내 기록' : '공개한 기록' }}
        </h2>

        <DiaryFilterBar
          :category="filters.category"
          :keyword="filters.keyword"
          @update:category="updateFilter({ category: $event })"
          @update:keyword="updateFilter({ keyword: $event })"
        />

        <LoadingBlock v-if="loading" />

        <EmptyState
          v-else-if="!diaries.length"
          icon="🗂️"
          :title="isMe ? '아직 남긴 기록이 없습니다.' : '공개된 기록이 없습니다.'"
          :description="isMe ? '오늘의 이야기를 남겨 보세요.' : ''"
        />

        <ul v-else class="mypage__list">
          <li v-for="diary in diaries" :key="diary.id">
            <DiaryCard :diary="diary" />
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
