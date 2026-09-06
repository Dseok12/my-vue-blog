<script setup>
import { ref, watch } from 'vue'

import BaseModal from '@/components/common/BaseModal.vue'
import { REPORT_REASONS } from '@/config'
import '@/css/components/ReportModal.css'

const props = defineProps({
  open: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])

const reason = ref('')
const detail = ref('')
const localError = ref('')

function clear() {
  reason.value = ''
  detail.value = ''
  localError.value = ''
}

// 모달이 닫히면 입력을 비운다.
watch(
  () => props.open,
  (value) => {
    if (!value) clear()
  },
)

function onConfirm() {
  if (!reason.value) {
    localError.value = '신고 사유를 선택해 주세요.'
    return
  }
  localError.value = ''
  emit('submit', { reason: reason.value, detail: detail.value.trim() })
}
</script>

<template>
  <BaseModal
    :open="open"
    title="게시물 신고"
    message="신고하면 이 글은 즉시 가림 처리되고, 관리자 검토 후 조치됩니다. 신고는 취소할 수 없습니다."
    confirm-text="신고하기"
    confirm-variant="danger"
    :loading="submitting"
    @confirm="onConfirm"
    @cancel="emit('cancel')"
  >
    <div class="report">
      <fieldset class="report__reasons">
        <legend class="report__legend">신고 사유</legend>
        <label v-for="item in REPORT_REASONS" :key="item.value" class="report__option">
          <input v-model="reason" type="radio" name="report-reason" :value="item.value" />
          <span>{{ item.label }}</span>
        </label>
      </fieldset>

      <textarea
        v-model="detail"
        class="report__detail"
        rows="3"
        maxlength="500"
        placeholder="상세 내용을 적어 주세요. (선택)"
        aria-label="신고 상세 내용"
      ></textarea>

      <p v-if="localError" class="report__error">{{ localError }}</p>
    </div>
  </BaseModal>
</template>
