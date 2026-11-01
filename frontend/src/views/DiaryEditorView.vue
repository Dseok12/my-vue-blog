<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import LoadingBlock from '@/components/common/LoadingBlock.vue'
import DiaryForm from '@/components/diary/DiaryForm.vue'
import { useLeaveGuard } from '@/composables/useLeaveGuard'
import { useAuthStore } from '@/stores/auth'
import { useDiaryStore } from '@/stores/diary'
import { useUiStore } from '@/stores/ui'
import '@/css/views/DiaryEditorView.css'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const diaryStore = useDiaryStore()
const uiStore = useUiStore()

const diaryId = computed(() => (route.params.id ? String(route.params.id) : ''))
const isEdit = computed(() => Boolean(diaryId.value))
const source = ref(null)
const loading = ref(false)
const submitting = ref(false)
const message = ref('')

// 작성 중인 내용이 있으면 화면을 떠나기 전에 한 번 더 묻는다. (저장에 성공한 뒤에는 묻지 않는다)
const dirty = ref(false)
const saved = ref(false)
useLeaveGuard(() => dirty.value && !saved.value)

watch(
  diaryId,
  async (id) => {
    source.value = null
    message.value = ''
    if (!id) return

    loading.value = true
    try {
      const diary = await diaryStore.fetchOne(id)

      // 다른 회원이 쓴 글은 수정할 수 없다. 읽기만 가능하도록 상세로 돌려보낸다.
      if (diary.authorId !== authStore.user?.id) {
        uiStore.notify.error('내가 쓴 글만 수정할 수 있습니다.')
        router.replace({ name: 'diary-detail', params: { id } })
        return
      }
      source.value = diary
    } catch (error) {
      // 없는 글이거나 볼 수 없는 글이면 목록으로 돌아간다.
      uiStore.notify.error(error.message)
      router.replace({ name: 'diary-list' })
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

async function onSubmit(payload) {
  // 수정은 작성자 본인만 가능하다. (서버에서도 같은 검증을 한다)
  if (isEdit.value && source.value?.authorId !== authStore.user?.id) {
    uiStore.notify.error('내가 쓴 글만 수정할 수 있습니다.')
    return
  }

  submitting.value = true
  message.value = ''
  try {
    const diary = isEdit.value
      ? await diaryStore.update(diaryId.value, payload)
      : await diaryStore.create(payload)

    saved.value = true
    uiStore.notify.success(isEdit.value ? '수정했습니다.' : '기록을 저장했습니다.')
    diaryStore.refreshMonthlyCounts()
    router.push({ name: 'diary-detail', params: { id: diary.id } })
  } catch (error) {
    message.value = error.message
  } finally {
    submitting.value = false
  }
}

function onCancel() {
  if (isEdit.value) {
    router.push({ name: 'diary-detail', params: { id: diaryId.value } })
    return
  }
  router.push({ name: 'diary-list' })
}
</script>

<template>
  <div class="editor">
    <div class="editor__head">
      <h1 class="editor__title">{{ isEdit ? '다이어리 수정' : '새 다이어리' }}</h1>
      <p class="editor__subtitle">
        {{
          isEdit
            ? '내용을 고친 뒤 수정 완료를 눌러 주세요.'
            : '하루에 몇 개든 자유롭게 기록할 수 있습니다.'
        }}
      </p>
    </div>

    <p v-if="message" class="editor__error">{{ message }}</p>

    <LoadingBlock v-if="loading" message="다이어리를 불러오는 중입니다." />

    <DiaryForm
      v-else-if="!isEdit || source"
      :diary="source"
      :submitting="submitting"
      @submit="onSubmit"
      @cancel="onCancel"
      @dirty-change="dirty = $event"
    />
  </div>
</template>
