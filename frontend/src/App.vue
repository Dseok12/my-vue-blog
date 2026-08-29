<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AppToast from '@/components/common/AppToast.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const route = useRoute()

// 라우트 meta.layout 값으로 레이아웃을 고른다.
const layouts = { default: DefaultLayout, auth: AuthLayout }
const layout = computed(() => layouts[route.meta.layout] || DefaultLayout)
</script>

<template>
  <component :is="layout">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </component>
  <AppToast />
</template>
