<script setup>
import { ref, watch } from 'vue'

import BaseButton from '@/components/common/BaseButton.vue'
import { DIARY_CATEGORIES } from '@/config'
import '@/css/components/DiaryFilterBar.css'

const props = defineProps({
  category: { type: String, default: '' },
  keyword: { type: String, default: '' },
  /** 공개/비공개 필터 표시 여부 (내 다이어리에서만 사용) */
  showVisibility: { type: Boolean, default: false },
  visibility: { type: String, default: '' },
})

const emit = defineEmits(['update:category', 'update:keyword', 'update:visibility'])

const keywordInput = ref(props.keyword)

watch(
  () => props.keyword,
  (value) => {
    keywordInput.value = value
  },
)

function submitSearch() {
  emit('update:keyword', keywordInput.value.trim())
}

function pickCategory(value) {
  emit('update:category', props.category === value ? '' : value)
}

function pickVisibility(value) {
  emit('update:visibility', props.visibility === value ? '' : value)
}
</script>

<template>
  <div class="filter">
    <div class="filter__chips">
      <button
        v-for="item in DIARY_CATEGORIES"
        :key="item.value"
        class="filter__chip"
        :class="{ 'filter__chip--on': category === item.value }"
        type="button"
        @click="pickCategory(item.value)"
      >
        {{ item.label }}
      </button>

      <template v-if="showVisibility">
        <button
          class="filter__chip"
          :class="{ 'filter__chip--on': visibility === 'public' }"
          type="button"
          @click="pickVisibility('public')"
        >
          공개
        </button>
        <button
          class="filter__chip"
          :class="{ 'filter__chip--on': visibility === 'private' }"
          type="button"
          @click="pickVisibility('private')"
        >
          비공개
        </button>
      </template>
    </div>

    <form class="filter__search" @submit.prevent="submitSearch">
      <input
        v-model="keywordInput"
        class="filter__input"
        type="search"
        placeholder="제목, 내용 검색"
        aria-label="검색어"
      />
      <BaseButton size="sm" variant="outline" type="submit">검색</BaseButton>
    </form>
  </div>
</template>
