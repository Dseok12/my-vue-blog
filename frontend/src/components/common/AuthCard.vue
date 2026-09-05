<script setup>
import '@/css/components/AuthCard.css'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  /** 한 화면에 제목이 둘 있을 때 h2 로 낮춘다. (로그인 화면은 소개가 h1 이다) */
  headingTag: { type: String, default: 'h1' },
  /** 옆에 소개가 있어 서비스 이름이 겹칠 때는 false 로 끈다. */
  showBrand: { type: Boolean, default: true },
})
</script>

<template>
  <section class="auth-card">
    <p v-if="showBrand" class="auth-card__brand">
      <span aria-hidden="true">📔</span>
      <span>나만의 다양한 diary</span>
    </p>
    <component :is="headingTag" class="auth-card__title">{{ title }}</component>
    <p v-if="subtitle" class="auth-card__subtitle">{{ subtitle }}</p>

    <div class="auth-card__body">
      <slot />
    </div>

    <p v-if="$slots.foot" class="auth-card__foot">
      <slot name="foot" />
    </p>
  </section>
</template>
