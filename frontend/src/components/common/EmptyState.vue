<script setup>
import '@/css/components/EmptyState.css'

defineProps({
  icon: { type: String, default: '📓' },
  title: { type: String, default: '내용이 없습니다.' },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="empty">
    <p class="empty__icon" aria-hidden="true">{{ icon }}</p>
    <p class="empty__title">{{ title }}</p>
    <p v-if="description" class="empty__description">{{ description }}</p>
    <div v-if="$slots.action" class="empty__action">
      <slot name="action" />
    </div>
  </div>
</template>
