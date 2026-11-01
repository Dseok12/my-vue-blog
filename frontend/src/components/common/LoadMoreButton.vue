<script setup>
import BaseButton from './BaseButton.vue'
import '@/css/components/LoadMoreButton.css'

defineProps({
  /** 지금 화면에 보이는 개수 */
  shown: { type: Number, required: true },
  /** 전체 개수 */
  total: { type: Number, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['load'])
</script>

<template>
  <div class="load-more">
    <BaseButton variant="outline" :loading="loading" @click="$emit('load')">
      더 보기
      <span class="load-more__count">{{ shown }} / {{ total }}</span>
    </BaseButton>
  </div>
</template>
