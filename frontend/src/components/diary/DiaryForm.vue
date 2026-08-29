<script setup>
import { reactive, ref, watch } from 'vue'

import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import ImageUploader from './ImageUploader.vue'
import { DIARY_CATEGORIES, DIARY_MOODS, VISIBILITY_OPTIONS } from '@/config'
import { todayKey } from '@/utils/date'
import { isValid, validateContent, validateTitle } from '@/utils/validators'
import '@/css/components/DiaryForm.css'

const props = defineProps({
  /** 수정할 다이어리. 없으면 새 글 작성으로 동작한다. */
  diary: { type: Object, default: null },
  submitting: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])

/** 새 글의 기본값 - 날짜는 한국 시간 기준 오늘 */
function createForm(source) {
  return {
    title: source?.title || '',
    content: source?.content || '',
    category: source?.category || 'diary',
    mood: source?.mood || '',
    dateKey: source?.dateKey || todayKey(),
    visibility: source?.visibility || 'private',
    images: source?.images ? [...source.images] : [],
  }
}

const form = reactive(createForm(props.diary))
const errors = reactive({ title: '', content: '' })
const touched = ref(false)

watch(
  () => props.diary,
  (value) => Object.assign(form, createForm(value)),
)

function validate() {
  errors.title = validateTitle(form.title)
  errors.content = validateContent(form.content)
  return isValid(errors)
}

function onSubmit() {
  touched.value = true
  if (!validate()) return
  emit('submit', { ...form, title: form.title.trim(), content: form.content.trim() })
}

watch(
  () => [form.title, form.content],
  () => {
    if (touched.value) validate()
  },
)
</script>

<template>
  <form class="form" @submit.prevent="onSubmit">
    <div class="form__row">
      <div class="form__col">
        <BaseInput v-model="form.dateKey" label="날짜" type="date" required />
      </div>
      <div class="form__col form__group">
        <span class="form__label">종류</span>
        <div class="form__options">
          <button
            v-for="item in DIARY_CATEGORIES"
            :key="item.value"
            class="form__option"
            :class="{ 'form__option--on': form.category === item.value }"
            type="button"
            @click="form.category = item.value"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="form__group">
      <span class="form__label">오늘의 감정</span>
      <div class="form__options">
        <button
          v-for="mood in DIARY_MOODS"
          :key="mood.value"
          class="form__option"
          :class="{ 'form__option--on': form.mood === mood.value }"
          type="button"
          @click="form.mood = form.mood === mood.value ? '' : mood.value"
        >
          {{ mood.emoji }} {{ mood.label }}
        </button>
      </div>
    </div>

    <BaseInput
      v-model="form.title"
      label="제목"
      placeholder="오늘을 한 줄로 표현한다면?"
      :error="errors.title"
      required
    />

    <BaseTextarea
      v-model="form.content"
      label="내용"
      placeholder="오늘의 기록을 자유롭게 남겨 보세요."
      :error="errors.content"
      required
    />

    <ImageUploader v-model="form.images" />

    <div class="form__group">
      <span class="form__label">공개 여부</span>
      <div class="form__visibility">
        <label
          v-for="option in VISIBILITY_OPTIONS"
          :key="option.value"
          class="form__radio"
          :class="{ 'form__radio--on': form.visibility === option.value }"
        >
          <input
            v-model="form.visibility"
            type="radio"
            name="visibility"
            :value="option.value"
          />
          <span class="form__radio-text">
            <span class="form__radio-title">{{ option.label }}</span>
            <span class="form__radio-desc">{{ option.description }}</span>
          </span>
        </label>
      </div>
    </div>

    <div class="form__actions">
      <BaseButton variant="ghost" @click="emit('cancel')">취소</BaseButton>
      <BaseButton type="submit" :loading="submitting">
        {{ diary ? '수정 완료' : '저장하기' }}
      </BaseButton>
    </div>
  </form>
</template>
