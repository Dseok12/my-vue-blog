<script setup>
import { useId } from 'vue'

import '@/css/components/BaseInput.css'

defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  autocomplete: { type: String, default: 'off' },
})

defineEmits(['update:modelValue'])

const inputId = useId()
</script>

<template>
  <div class="field" :class="{ 'field--error': error }">
    <label v-if="label" class="field__label" :for="inputId">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true">*</span>
    </label>
    <input
      :id="inputId"
      class="field__control"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      :aria-invalid="Boolean(error)"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="error" class="field__message">{{ error }}</p>
  </div>
</template>
