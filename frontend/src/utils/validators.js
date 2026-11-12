/** 폼 검증 헬퍼 - 모든 함수는 오류 메시지(문자열) 또는 빈 문자열을 반환한다. */
import { CONTENT_MAX_LENGTH, PASSWORD_MAX_LENGTH } from '@/config'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateEmail(value) {
  // 복사해 붙이면서 딸려 온 앞뒤 공백은 무시한다. (서버도 공백을 지우고 저장한다)
  const email = String(value || '').trim()
  if (!email) return '이메일을 입력해 주세요.'
  if (!EMAIL_PATTERN.test(email)) return '이메일 형식이 올바르지 않습니다.'
  return ''
}

export function validatePassword(value) {
  if (!value) return '비밀번호를 입력해 주세요.'
  if (value.length < 8) return '비밀번호는 8자 이상이어야 합니다.'
  if (value.length > PASSWORD_MAX_LENGTH) {
    return '비밀번호는 ' + PASSWORD_MAX_LENGTH + '자 이하여야 합니다.'
  }
  return ''
}

export function validatePasswordConfirm(value, password) {
  if (!value) return '비밀번호를 한 번 더 입력해 주세요.'
  if (value !== password) return '비밀번호가 일치하지 않습니다.'
  return ''
}

export function validateNickname(value) {
  if (!value) return '닉네임을 입력해 주세요.'
  if (value.trim().length < 2) return '닉네임은 2자 이상이어야 합니다.'
  if (value.trim().length > 12) return '닉네임은 12자 이하여야 합니다.'
  return ''
}

export function validateTitle(value) {
  if (!value || !value.trim()) return '제목을 입력해 주세요.'
  if (value.trim().length > 60) return '제목은 60자 이하여야 합니다.'
  return ''
}

export function validateContent(value) {
  if (!value || !value.trim()) return '내용을 입력해 주세요.'
  if (value.trim().length > CONTENT_MAX_LENGTH) {
    return '내용은 ' + CONTENT_MAX_LENGTH.toLocaleString('ko-KR') + '자 이하여야 합니다.'
  }
  return ''
}

/** 검증 결과 객체에 오류가 하나도 없으면 true */
export function isValid(errors) {
  return Object.values(errors).every((message) => !message)
}
