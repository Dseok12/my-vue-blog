<script setup>
import '@/css/components/NicknameLink.css'

defineProps({
  userId: { type: String, required: true },
  nickname: { type: String, required: true },
})
</script>

<template>
  <router-link
    class="nickname-link"
    :to="{ name: 'user-page', params: { id: userId } }"
    @click.stop
  >
    {{ nickname }}
  </router-link>
</template>
