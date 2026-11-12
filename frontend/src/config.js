/**
 * 앱 전역 설정값.
 * 환경 변수는 .env 에서 관리하며, 여기서 한 번만 읽어서 사용한다.
 */
const env = import.meta.env

export const APP_TITLE = env.VITE_APP_TITLE || '나만의 다양한 diary'
export const API_BASE_URL = env.VITE_API_BASE_URL || '/api'

/** true 면 백엔드 없이 브라우저 저장소(mock)로 동작한다. */
export const USE_MOCK = String(env.VITE_USE_MOCK ?? 'true') === 'true'

/** 이미지 업로드 제한 */
export const IMAGE_MAX_BYTES = 10 * 1024 * 1024 // 10MB
export const IMAGE_ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp']
export const IMAGE_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
export const IMAGE_MAX_COUNT = 5

/** 글자 수 제한 - 백엔드 utils/validate.js 의 LIMITS 와 같은 값 */
export const CONTENT_MAX_LENGTH = 20000
export const COMMENT_MAX_LENGTH = 1000
export const PASSWORD_MAX_LENGTH = 72

/** 다이어리 종류 - 일기 / 독서기록 / 감정기록 */
export const DIARY_CATEGORIES = [
  { value: 'diary', label: '일기' },
  { value: 'book', label: '독서기록' },
  { value: 'emotion', label: '감정기록' },
]

/** 감정 목록 */
export const DIARY_MOODS = [
  { value: 'happy', label: '행복', emoji: '😊' },
  { value: 'calm', label: '평온', emoji: '🙂' },
  { value: 'tired', label: '지침', emoji: '😴' },
  { value: 'sad', label: '슬픔', emoji: '😢' },
  { value: 'angry', label: '화남', emoji: '😤' },
  { value: 'excited', label: '설렘', emoji: '🤩' },
]

/** 공개 여부 */
export const VISIBILITY_OPTIONS = [
  { value: 'private', label: '비공개', description: '나만 볼 수 있습니다.' },
  { value: 'public', label: '공개', description: '다른 회원에게 공유됩니다.' },
]

/** 게시물 신고 사유 (백엔드 REPORT_REASONS 와 같은 목록) */
export const REPORT_REASONS = [
  { value: 'obscene', label: '음란성' },
  { value: 'defamation', label: '비방' },
  { value: 'political', label: '정치적 게시물' },
  { value: 'violent', label: '잔인한 게시물' },
  { value: 'scam', label: '사기' },
  { value: 'threat', label: '협박' },
  { value: 'illegal', label: '불법거래' },
  { value: 'etc', label: '기타' },
]

export function getReportReasonLabel(value) {
  return REPORT_REASONS.find((item) => item.value === value)?.label || value
}

export const STORAGE_KEYS = {
  token: 'diary.auth.token',
  sidebar: 'diary.ui.sidebar',
}
