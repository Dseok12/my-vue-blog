<script setup>
import { useRouter } from 'vue-router'

import BaseButton from '@/components/common/BaseButton.vue'
import '@/css/views/NotFoundView.css'

const router = useRouter()
</script>

<template>
  <section class="not-found">
    <p class="not-found__code">404</p>
    <h1 class="not-found__title">페이지를 찾을 수 없습니다.</h1>
    <p class="not-found__description">주소가 바뀌었거나 삭제된 페이지일 수 있습니다.</p>
    <BaseButton @click="router.push({ name: 'diary-list' })">내 다이어리로 가기</BaseButton>
  </section>
</template>
