<script setup>
import { storeToRefs } from 'pinia'

import { useUiStore } from '@/stores/ui'
import '@/css/components/AppToast.css'

const uiStore = useUiStore()
const { toasts } = storeToRefs(uiStore)
</script>

<template>
  <div class="toast-list" role="status" aria-live="polite">
    <transition-group name="toast">
      <p v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast--${toast.type}`">
        {{ toast.message }}
      </p>
    </transition-group>
  </div>
</template>
