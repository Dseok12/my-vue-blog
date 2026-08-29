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

const navigations = [
  { name: 'diary-list', label: '내 다이어리' },
  { name: 'feed', label: '공개 다이어리' },
]

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
        <span class="header__user">{{ authStore.nickname }} 님</span>
        <BaseButton size="sm" @click="router.push({ name: 'diary-create' })">글쓰기</BaseButton>
        <BaseButton size="sm" variant="ghost" @click="onLogout">로그아웃</BaseButton>
      </div>
    </div>
  </header>
</template>
