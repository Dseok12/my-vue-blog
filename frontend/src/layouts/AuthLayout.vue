<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import '@/css/layouts/AuthLayout.css'

const route = useRoute()

/** 라우트 meta.wide 가 true 면 소개까지 놓을 수 있게 넓게 쓴다. (로그인 화면) */
const isWide = computed(() => Boolean(route.meta.wide))
</script>

<template>
  <div class="auth-layout">
    <div class="auth-layout__inner" :class="{ 'auth-layout__inner--wide': isWide }">
      <slot />
    </div>
  </div>
</template>
