<script setup>
import { storeToRefs } from 'pinia'

import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useUiStore } from '@/stores/ui'
import '@/css/layouts/DefaultLayout.css'

const uiStore = useUiStore()
const { sidebarOpen } = storeToRefs(uiStore)
</script>

<template>
  <div class="app">
    <AppHeader />
    <div class="app__body">
      <AppSidebar />
      <main class="app__main" :class="{ 'app__main--shifted': sidebarOpen }">
        <div class="u-container">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
