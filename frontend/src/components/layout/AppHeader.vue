<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/common/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import '@/css/layouts/AppHeader.css'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const navigations = computed(() => {
  const items = [
    { name: 'diary-list', label: '내 다이어리' },
    { name: 'feed', label: '공개 다이어리' },
  ]
  if (authStore.isAdmin) items.push({ name: 'admin', label: '신고 관리' })
  return items
})

const currentName = computed(() => route.name)

async function onLogout() {
  await authStore.logout()
  uiStore.notify.info('로그아웃되었습니다.')
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <router-link class="header__logo" :to="{ name: 'diary-list' }">
        <span aria-hidden="true">📔</span>
        <span class="header__logo-text">나만의 다양한 diary</span>
      </router-link>

      <nav class="header__nav">
        <router-link
          v-for="item in navigations"
          :key="item.name"
          class="header__link"
          :class="{ 'header__link--active': currentName === item.name }"
          :to="{ name: item.name }"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="header__actions">
        <!-- 좁은 화면에서는 이름을 숨기고 아이콘만 남긴다. (마이페이지로 가는 길은 항상 있어야 한다) -->
        <router-link
          v-if="authStore.user"
          class="header__user"
          :to="{ name: 'user-page', params: { id: authStore.user.id } }"
          :aria-label="'마이페이지 (' + authStore.nickname + ')'"
        >
          <span class="header__user-icon" aria-hidden="true">👤</span>
          <span class="header__user-name">{{ authStore.nickname }} 님</span>
        </router-link>
        <BaseButton size="sm" @click="router.push({ name: 'diary-create' })">글쓰기</BaseButton>
        <!-- 아주 좁은 화면에서는 글자 대신 아이콘만 보인다. (aria-label 이 있어 스크린리더는 그대로 읽는다) -->
        <BaseButton size="sm" variant="ghost" aria-label="로그아웃" @click="onLogout">
          <span class="header__logout-icon" aria-hidden="true">🚪</span>
          <span class="header__logout-text">로그아웃</span>
        </BaseButton>
      </div>
    </div>
  </header>
</template>
