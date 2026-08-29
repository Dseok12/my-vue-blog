<script setup>
import '@/css/components/AuthCard.css'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <section class="auth-card">
    <p class="auth-card__brand">
      <span aria-hidden="true">📔</span>
      <span>나만의 다양한 diary</span>
    </p>
    <h1 class="auth-card__title">{{ title }}</h1>
    <p v-if="subtitle" class="auth-card__subtitle">{{ subtitle }}</p>

    <div class="auth-card__body">
      <slot />
    </div>

    <p v-if="$slots.foot" class="auth-card__foot">
      <slot name="foot" />
    </p>
  </section>
</template>
