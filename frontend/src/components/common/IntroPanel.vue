<script setup>
/**
 * 비회원이 처음 만나는 소개 패널.
 * 로그인 화면 옆(좁은 화면에서는 위)에 놓인다.
 */
import '@/css/components/IntroPanel.css'

/** 소개 항목 - 문구만 고치면 되도록 배열로 뺀다. */
const items = [
  { emoji: '📝', label: '일기', description: '오늘 있었던 일' },
  { emoji: '📚', label: '독서기록', description: '읽은 책과 문장' },
  { emoji: '💗', label: '감정기록', description: '지금의 마음' },
]
</script>

<template>
  <section class="intro">
    <p class="intro__badge" aria-hidden="true">📔</p>

    <h1 class="intro__title">나만의 다양한 diary</h1>
    <p class="intro__lead">
      오늘 하루를 가볍게 남겨 보세요.
      <br />
      일기도, 책도, 마음도 모두 좋아요.
    </p>

    <ul class="intro__list">
      <li v-for="item in items" :key="item.label" class="intro__item">
        <span class="intro__emoji" aria-hidden="true">{{ item.emoji }}</span>
        <span class="intro__label">{{ item.label }}</span>
        <span class="intro__desc">{{ item.description }}</span>
      </li>
    </ul>

    <p class="intro__note">
      <span aria-hidden="true">🔒</span>
      기본은 나만 보기. 공개하면 댓글과 좋아요를 주고받을 수 있어요.
    </p>
  </section>
</template>
