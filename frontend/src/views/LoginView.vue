<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AuthCard from '@/components/common/AuthCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { USE_MOCK } from '@/config'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { isValid, validateEmail, validatePassword } from '@/utils/validators'
import '@/css/views/LoginView.css'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const touched = ref(false)

function validate() {
  errors.email = validateEmail(form.email)
  errors.password = validatePassword(form.password)
  return isValid(errors)
}

async function onSubmit() {
  touched.value = true
  if (!validate()) return

  const success = await authStore.login({ ...form })
  if (!success) return

  uiStore.notify.success(authStore.nickname + ' 님, 반갑습니다.')
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
  router.push(redirect || { name: 'diary-list' })
}

/** mock 모드에서 바로 둘러볼 수 있도록 예시 계정을 채워 준다. */
function fillDemo() {
  form.email = 'demo@diary.test'
  form.password = 'demo1234'
}
</script>

<template>
  <AuthCard title="로그인" subtitle="오늘의 기록을 이어서 남겨 보세요.">
    <form class="login__form" @submit.prevent="onSubmit">
      <p v-if="authStore.error" class="login__error">{{ authStore.error }}</p>

      <BaseInput
        v-model="form.email"
        label="이메일"
        type="email"
        placeholder="you@example.com"
        autocomplete="email"
        :error="errors.email"
        required
      />
      <BaseInput
        v-model="form.password"
        label="비밀번호"
        type="password"
        placeholder="8자 이상"
        autocomplete="current-password"
        :error="errors.password"
        required
      />

      <BaseButton type="submit" size="lg" block :loading="authStore.loading">로그인</BaseButton>

      <p v-if="USE_MOCK" class="login__demo">
        체험용 계정: demo@diary.test / demo1234
        <br />
        <button class="login__link" type="button" @click="fillDemo">계정 채우기</button>
      </p>
    </form>

    <template #foot>
      아직 회원이 아니신가요?
      <router-link class="login__link" :to="{ name: 'signup' }">회원가입</router-link>
    </template>
  </AuthCard>
</template>
