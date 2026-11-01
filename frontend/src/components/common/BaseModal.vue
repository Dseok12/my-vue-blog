<script setup>
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

import BaseButton from './BaseButton.vue'
import '@/css/components/BaseModal.css'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '확인' },
  cancelText: { type: String, default: '취소' },
  /** primary | danger */
  confirmVariant: { type: String, default: 'primary' },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel'])

const titleId = useId()
const panel = ref(null)
/** 모달을 열기 전에 포커스가 있던 요소 - 닫으면 그 자리로 돌려준다. */
let lastFocused = null

function onCancel() {
  // 처리 중에는 닫지 않는다.
  if (props.loading) return
  emit('cancel')
}

function onKeydown(event) {
  if (event.key === 'Escape') onCancel()
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      lastFocused = document.activeElement
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      // 키보드·스크린리더 사용자가 바로 모달 안에서 시작하도록 포커스를 옮긴다.
      panel.value?.focus()
      return
    }
    document.removeEventListener('keydown', onKeydown)
    lastFocused?.focus?.()
    lastFocused = null
  },
)

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <!-- 화면 어디에서 열든 다른 요소 밑에 깔리지 않도록 body 바로 아래에 그린다. -->
    <transition name="fade">
      <div v-if="open" class="modal" @click.self="onCancel">
        <div
          ref="panel"
          class="modal__panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          tabindex="-1"
        >
          <h2 v-if="title" :id="titleId" class="modal__title">{{ title }}</h2>
          <p v-if="message" class="modal__body">{{ message }}</p>
          <slot />
          <div class="modal__actions">
            <BaseButton variant="ghost" :disabled="loading" @click="onCancel">
              {{ cancelText }}
            </BaseButton>
            <BaseButton :variant="confirmVariant" :loading="loading" @click="emit('confirm')">
              {{ confirmText }}
            </BaseButton>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>
