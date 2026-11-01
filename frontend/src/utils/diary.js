/** 다이어리 표시용 라벨 헬퍼 */
import { DIARY_CATEGORIES, DIARY_MOODS, VISIBILITY_OPTIONS } from '@/config'

export function getCategory(value) {
  return DIARY_CATEGORIES.find((item) => item.value === value) || null
}

export function getCategoryLabel(value) {
  return getCategory(value)?.label || '기록'
}

export function getMood(value) {
  return DIARY_MOODS.find((item) => item.value === value) || null
}

export function getMoodLabel(value) {
  const mood = getMood(value)
  return mood ? mood.emoji + ' ' + mood.label : ''
}

export function getVisibilityLabel(value) {
  return VISIBILITY_OPTIONS.find((item) => item.value === value)?.label || ''
}

export function isPublic(diary) {
  return diary?.visibility === 'public'
}

/** 목록에서 보여줄 요약문 */
export function summarize(content, length = 120) {
  const text = String(content || '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > length ? text.slice(0, length) + '…' : text
}
