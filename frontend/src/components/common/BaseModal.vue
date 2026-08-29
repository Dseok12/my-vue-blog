<script setup>
import BaseButton from './BaseButton.vue'
import '@/css/components/BaseModal.css'

defineProps({
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

function onCancel() {
  emit('cancel')
}
</script>

<template>
  <transition name="fade">
    <div
      v-if="open"
      class="modal"
      role="dialog"
      aria-modal="true"
      @click.self="onCancel"
      @keydown.esc="onCancel"
    >
      <div class="modal__panel">
        <h2 v-if="title" class="modal__title">{{ title }}</h2>
        <p v-if="message" class="modal__body">{{ message }}</p>
        <slot />
        <div class="modal__actions">
          <BaseButton variant="ghost" @click="onCancel">{{ cancelText }}</BaseButton>
          <BaseButton :variant="confirmVariant" :loading="loading" @click="$emit('confirm')">
            {{ confirmText }}
          </BaseButton>
        </div>
      </div>
    </div>
  </transition>
</template>
