<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import AuthCard from '@/components/common/AuthCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import {
  isValid,
  validateEmail,
  validateNickname,
  validatePassword,
  validatePasswordConfirm,
} from '@/utils/validators'
import '@/css/views/SignupView.css'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const form = reactive({ email: '', nickname: '', password: '', passwordConfirm: '' })
const errors = reactive({ email: '', nickname: '', password: '', passwordConfirm: '' })
const touched = ref(false)

function validate() {
  errors.email = validateEmail(form.email)
  errors.nickname = validateNickname(form.nickname)
  errors.password = validatePassword(form.password)
  errors.passwordConfirm = validatePasswordConfirm(form.passwordConfirm, form.password)
  return isValid(errors)
}

async function onSubmit() {
  touched.value = true
  if (!validate()) return

  const success = await authStore.signup({
    email: form.email,
    nickname: form.nickname,
    password: form.password,
  })
  if (!success) return

  uiStore.notify.success('가입이 완료되었습니다.')
  router.push({ name: 'diary-list' })
}
</script>

<template>
  <AuthCard title="회원가입" subtitle="가입하면 나만 볼 수 있는 다이어리가 만들어집니다.">
    <form class="signup__form" @submit.prevent="onSubmit">
      <p v-if="authStore.error" class="signup__error">{{ authStore.error }}</p>

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
        v-model="form.nickname"
        label="닉네임"
        placeholder="2~12자"
        :error="errors.nickname"
        required
      />
      <BaseInput
        v-model="form.password"
        label="비밀번호"
        type="password"
        placeholder="8자 이상"
        autocomplete="new-password"
        :error="errors.password"
        required
      />
      <BaseInput
        v-model="form.passwordConfirm"
        label="비밀번호 확인"
        type="password"
        autocomplete="new-password"
        :error="errors.passwordConfirm"
        required
      />

      <BaseButton type="submit" size="lg" block :loading="authStore.loading">가입하기</BaseButton>
    </form>

    <template #foot>
      이미 계정이 있으신가요?
      <router-link class="signup__link" :to="{ name: 'login' }">로그인</router-link>
    </template>
  </AuthCard>
</template>
