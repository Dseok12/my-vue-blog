<script setup>
import { useId } from 'vue'

import '@/css/components/BaseTextarea.css'

defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  rows: { type: Number, default: 10 },
})

defineEmits(['update:modelValue'])

const textareaId = useId()
</script>

<template>
  <div class="field" :class="{ 'field--error': error }">
    <label v-if="label" class="field__label" :for="textareaId">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true">*</span>
    </label>
    <textarea
      :id="textareaId"
      class="field__control field__control--textarea"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :aria-invalid="Boolean(error)"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
    <p v-if="error" class="field__message">{{ error }}</p>
  </div>
</template>
