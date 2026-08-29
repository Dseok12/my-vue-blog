<script setup>
import { ref } from 'vue'

import { uploads } from '@/api'
import { IMAGE_ALLOWED_EXTENSIONS, IMAGE_MAX_BYTES, IMAGE_MAX_COUNT } from '@/config'
import { formatBytes, validateImageFile } from '@/utils/image'
import '@/css/components/ImageUploader.css'

const props = defineProps({
  /** [{ url, name }] */
  modelValue: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const dragging = ref(false)
const uploading = ref(false)
const message = ref('')

const ruleText =
  IMAGE_ALLOWED_EXTENSIONS.join(', ') +
  ' · 최대 ' +
  formatBytes(IMAGE_MAX_BYTES) +
  ' · ' +
  IMAGE_MAX_COUNT +
  '장까지'

function openPicker() {
  fileInput.value?.click()
}

async function addFiles(fileList) {
  const files = Array.from(fileList || [])
  if (!files.length) return

  message.value = ''
  const room = IMAGE_MAX_COUNT - props.modelValue.length
  if (room <= 0) {
    message.value = '이미지는 최대 ' + IMAGE_MAX_COUNT + '장까지 첨부할 수 있습니다.'
    return
  }

  uploading.value = true
  const next = [...props.modelValue]
  try {
    for (const file of files.slice(0, room)) {
      const invalid = validateImageFile(file)
      if (invalid) {
        message.value = invalid
        continue
      }
      const image = await uploads.image(file)
      next.push({ url: image.url, name: image.name })
    }
    emit('update:modelValue', next)
  } catch (error) {
    message.value = error.message
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function removeImage(index) {
  const next = props.modelValue.filter((_, position) => position !== index)
  emit('update:modelValue', next)
}

function onDrop(event) {
  dragging.value = false
  addFiles(event.dataTransfer?.files)
}
</script>

<template>
  <div class="uploader">
    <p class="uploader__label">이미지</p>

    <div
      class="uploader__drop"
      :class="{ 'uploader__drop--over': dragging }"
      role="button"
      tabindex="0"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <span>{{ uploading ? '업로드 중입니다…' : '이미지를 끌어다 놓거나 클릭해 선택하세요.' }}</span>
      <span class="uploader__rule">{{ ruleText }}</span>
    </div>

    <input
      ref="fileInput"
      class="uploader__input"
      type="file"
      accept="image/jpeg,image/png,image/gif,image/webp"
      multiple
      @change="addFiles($event.target.files)"
    />

    <ul v-if="modelValue.length" class="uploader__grid">
      <li v-for="(image, index) in modelValue" :key="image.url" class="uploader__item">
        <img class="uploader__image" :src="image.url" :alt="image.name" />
        <button
          class="uploader__remove"
          type="button"
          :aria-label="image.name + ' 삭제'"
          @click="removeImage(index)"
        >
          ✕
        </button>
      </li>
    </ul>

    <p v-if="message" class="uploader__message">{{ message }}</p>
  </div>
</template>
