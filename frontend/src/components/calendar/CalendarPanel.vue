<script setup>
import { computed, ref, watch } from 'vue'

import { addMonths, buildMonthMatrix, parseDateKey, todayKey, WEEKDAY_LABELS } from '@/utils/date'
import '@/css/components/CalendarPanel.css'

const props = defineProps({
  /** 선택된 날짜 ('YYYY-MM-DD'), 없으면 빈 문자열 */
  modelValue: { type: String, default: '' },
  /** { 'YYYY-MM-DD': 글 개수 } */
  counts: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue', 'month-change'])

const initial = parseDateKey(props.modelValue || todayKey())
const viewYear = ref(initial.year)
const viewMonth = ref(initial.month)

// 첫 번째 시작 요일은 일요일이다.
const weeks = computed(() => buildMonthMatrix(viewYear.value, viewMonth.value))
const monthLabel = computed(() => viewYear.value + '년 ' + viewMonth.value + '월')
const monthPrefix = computed(() => viewYear.value + '-' + String(viewMonth.value).padStart(2, '0'))
const monthTotal = computed(() =>
  Object.entries(props.counts)
    .filter(([dateKey]) => dateKey.startsWith(monthPrefix.value))
    .reduce((total, [, count]) => total + count, 0),
)

function moveMonth(delta) {
  const next = addMonths(viewYear.value, viewMonth.value, delta)
  viewYear.value = next.year
  viewMonth.value = next.month
}

function goToday() {
  const today = parseDateKey(todayKey())
  viewYear.value = today.year
  viewMonth.value = today.month
  emit('update:modelValue', todayKey())
}

function selectDay(cell) {
  // 같은 날짜를 다시 누르면 선택을 해제한다.
  emit('update:modelValue', props.modelValue === cell.dateKey ? '' : cell.dateKey)
}

watch(
  () => [viewYear.value, viewMonth.value],
  () => emit('month-change', { year: viewYear.value, month: viewMonth.value }),
  { immediate: true },
)

// 바깥에서 날짜가 바뀌면 해당 달로 이동한다.
watch(
  () => props.modelValue,
  (value) => {
    if (!value) return
    const { year, month } = parseDateKey(value)
    viewYear.value = year
    viewMonth.value = month
  },
)
</script>

<template>
  <div class="calendar">
    <div class="calendar__head">
      <p class="calendar__title">{{ monthLabel }}</p>
      <div class="calendar__nav">
        <button class="calendar__arrow" type="button" aria-label="이전 달" @click="moveMonth(-1)">
          ‹
        </button>
        <button class="calendar__arrow" type="button" aria-label="다음 달" @click="moveMonth(1)">
          ›
        </button>
      </div>
    </div>

    <div class="calendar__grid">
      <p
        v-for="(label, index) in WEEKDAY_LABELS"
        :key="label"
        class="calendar__weekday"
        :class="{
          'calendar__weekday--sun': index === 0,
          'calendar__weekday--sat': index === 6,
        }"
      >
        {{ label }}
      </p>

      <template v-for="(week, weekIndex) in weeks" :key="weekIndex">
        <button
          v-for="cell in week"
          :key="cell.dateKey"
          class="calendar__day"
          :class="{
            'calendar__day--outside': !cell.inMonth,
            'calendar__day--today': cell.isToday,
            'calendar__day--selected': modelValue === cell.dateKey,
          }"
          type="button"
          @click="selectDay(cell)"
        >
          {{ cell.day }}
          <span v-if="counts[cell.dateKey]" class="calendar__dot" aria-hidden="true"></span>
        </button>
      </template>
    </div>

    <div class="calendar__foot">
      <span>이 달의 기록 {{ monthTotal }}개</span>
      <button class="calendar__today" type="button" @click="goToday">오늘</button>
    </div>
  </div>
</template>
