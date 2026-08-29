<script setup>
import '@/css/components/LoadingBlock.css'

defineProps({
  message: { type: String, default: '불러오는 중입니다.' },
})
</script>

<template>
  <div class="loading">
    <span class="loading__dot" aria-hidden="true"></span>
    <span>{{ message }}</span>
  </div>
</template>
