<script setup>
import { reactive, ref } from 'vue'

import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { isValid, validateNickname, validatePassword } from '@/utils/validators'
import '@/css/components/ProfileEditForm.css'

const props = defineProps({
  currentNickname: { type: String, default: '' },
})

const emit = defineEmits(['updated'])

const authStore = useAuthStore()
const uiStore = useUiStore()

const open = ref(false)
const form = reactive({
  nickname: props.currentNickname,
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
})
const errors = reactive({
  nickname: '',
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
})

function toggle() {
  open.value = !open.value
  if (open.value) {
    form.nickname = props.currentNickname
    form.currentPassword = ''
    form.newPassword = ''
    form.newPasswordConfirm = ''
    Object.keys(errors).forEach((key) => {
      errors[key] = ''
    })
  }
}

function validate() {
  errors.nickname = validateNickname(form.nickname)

  const changingPassword = Boolean(
    form.currentPassword || form.newPassword || form.newPasswordConfirm,
  )
  errors.currentPassword =
    changingPassword && !form.currentPassword ? '현재 비밀번호를 입력해 주세요.' : ''
  errors.newPassword = changingPassword ? validatePassword(form.newPassword) : ''
  errors.newPasswordConfirm =
    changingPassword && form.newPassword !== form.newPasswordConfirm
      ? '새 비밀번호가 일치하지 않습니다.'
      : ''

  return isValid(errors)
}

async function onSubmit() {
  if (!validate()) return

  const payload = {}
  const nextNickname = form.nickname.trim()
  if (nextNickname && nextNickname !== props.currentNickname) {
    payload.nickname = nextNickname
  }
  if (form.newPassword) {
    payload.currentPassword = form.currentPassword
    payload.newPassword = form.newPassword
  }

  if (Object.keys(payload).length === 0) {
    uiStore.notify.info('변경할 내용이 없습니다.')
    return
  }

  const success = await authStore.updateProfile(payload)
  if (!success) {
    uiStore.notify.error(authStore.error || '변경하지 못했습니다.')
    return
  }

  uiStore.notify.success('프로필을 변경했습니다.')
  open.value = false
  emit('updated', authStore.user.nickname)
}
</script>

<template>
  <div class="profile-edit">
    <BaseButton size="sm" variant="outline" @click="toggle">
      {{ open ? '수정 취소' : '프로필 수정' }}
    </BaseButton>

    <form v-if="open" class="profile-edit__form" @submit.prevent="onSubmit">
      <p v-if="authStore.error" class="profile-edit__error">{{ authStore.error }}</p>

      <BaseInput
        v-model="form.nickname"
        label="닉네임"
        placeholder="2~12자"
        :error="errors.nickname"
      />

      <p class="profile-edit__hint">비밀번호를 바꾸지 않으려면 아래는 비워 두세요.</p>

      <BaseInput
        v-model="form.currentPassword"
        label="현재 비밀번호"
        type="password"
        autocomplete="current-password"
        :error="errors.currentPassword"
      />
      <BaseInput
        v-model="form.newPassword"
        label="새 비밀번호"
        type="password"
        placeholder="8자 이상"
        autocomplete="new-password"
        :error="errors.newPassword"
      />
      <BaseInput
        v-model="form.newPasswordConfirm"
        label="새 비밀번호 확인"
        type="password"
        autocomplete="new-password"
        :error="errors.newPasswordConfirm"
      />

      <BaseButton type="submit" block :loading="authStore.loading">변경 저장</BaseButton>
    </form>
  </div>
</template>
