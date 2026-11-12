/**
 * 입력값 검증.
 * 프론트엔드(frontend/src/utils/validators.js)와 같은 규칙을 서버에서 한 번 더 확인한다.
 * 문제가 있으면 400 오류를 던진다.
 */
import { ApiError } from './ApiError.js'
import { isValidDateKey } from './date.js'
import { config } from '../config/index.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const CATEGORIES = ['diary', 'book', 'emotion']
export const VISIBILITIES = ['public', 'private']
export const MOODS = ['happy', 'calm', 'tired', 'sad', 'angry', 'excited']
export const REPORT_REASONS = [
  'obscene',
  'defamation',
  'political',
  'violent',
  'scam',
  'threat',
  'illegal',
  'etc',
]

/**
 * 길이 제한 - DB 컬럼 크기에 맞춘다. (schema.sql)
 * 검증 없이 긴 값을 넣으면 DB 가 "Data too long" 오류를 내고 500 이 된다.
 * 사용자의 실수는 500(서버 잘못)이 아니라 400(요청 잘못)으로 알려 줘야 한다.
 */
export const LIMITS = {
  email: 191, // users.email VARCHAR(191)
  password: 72, // bcrypt 는 72바이트까지만 비교에 쓴다
  title: 60, // diaries.title VARCHAR(60)
  // TEXT 는 65,535 바이트. 한글 한 글자가 3바이트이므로 20,000자면 안전하다.
  content: 20000,
  comment: 1000,
}

function asString(value) {
  return typeof value === 'string' ? value : ''
}

export function requireEmail(value) {
  const email = asString(value).trim().toLowerCase()
  if (!email) throw ApiError.badRequest('이메일을 입력해 주세요.')
  if (!EMAIL_PATTERN.test(email)) throw ApiError.badRequest('이메일 형식이 올바르지 않습니다.')
  if (email.length > LIMITS.email) throw ApiError.badRequest('이메일이 너무 깁니다.')
  return email
}

export function requirePassword(value) {
  const password = asString(value)
  if (!password) throw ApiError.badRequest('비밀번호를 입력해 주세요.')
  if (password.length < 8) throw ApiError.badRequest('비밀번호는 8자 이상이어야 합니다.')
  if (password.length > LIMITS.password) {
    throw ApiError.badRequest('비밀번호는 ' + LIMITS.password + '자 이하여야 합니다.')
  }
  return password
}

export function requireNickname(value) {
  const nickname = asString(value).trim()
  if (!nickname) throw ApiError.badRequest('닉네임을 입력해 주세요.')
  if (nickname.length < 2) throw ApiError.badRequest('닉네임은 2자 이상이어야 합니다.')
  if (nickname.length > 12) throw ApiError.badRequest('닉네임은 12자 이하여야 합니다.')
  return nickname
}

/** 글 내용 / 댓글처럼 "비면 안 되고 너무 길어도 안 되는" 글자 */
export function requireContent(value, label = '내용', maxLength = LIMITS.content) {
  const content = asString(value).trim()
  if (!content) throw ApiError.badRequest(label + '을 입력해 주세요.')
  if (content.length > maxLength) {
    throw ApiError.badRequest(label + '은 ' + maxLength.toLocaleString('ko-KR') + '자 이하여야 합니다.')
  }
  return content
}

/** 다이어리 작성/수정 본문을 검증하고 정리된 값을 돌려준다. */
export function requireDiaryPayload(body = {}) {
  const title = asString(body.title).trim()
  if (!title) throw ApiError.badRequest('제목을 입력해 주세요.')
  if (title.length > LIMITS.title) {
    throw ApiError.badRequest('제목은 ' + LIMITS.title + '자 이하여야 합니다.')
  }

  const content = requireContent(body.content)

  const category = asString(body.category) || 'diary'
  if (!CATEGORIES.includes(category)) throw ApiError.badRequest('글 종류가 올바르지 않습니다.')

  const mood = asString(body.mood)
  if (mood && !MOODS.includes(mood)) throw ApiError.badRequest('감정 값이 올바르지 않습니다.')

  const dateKey = asString(body.dateKey)
  if (!isValidDateKey(dateKey)) throw ApiError.badRequest('날짜가 올바르지 않습니다.')

  const visibility = asString(body.visibility) || 'private'
  if (!VISIBILITIES.includes(visibility)) {
    throw ApiError.badRequest('공개 여부가 올바르지 않습니다.')
  }

  return { title, content, category, mood, dateKey, visibility, images: requireImages(body.images) }
}

/** 이미지 목록 검증 - [{ url, name }] 형태만 허용한다. */
export function requireImages(value) {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) throw ApiError.badRequest('이미지 형식이 올바르지 않습니다.')
  if (value.length > config.upload.maxCount) {
    throw ApiError.badRequest('이미지는 최대 ' + config.upload.maxCount + '장까지 첨부할 수 있습니다.')
  }

  return value.map((image) => {
    const url = asString(image?.url).trim()
    if (!url) throw ApiError.badRequest('이미지 주소가 비어 있습니다.')
    if (url.length > 512) throw ApiError.badRequest('이미지 주소가 너무 깁니다.')
    return { url, name: asString(image?.name).slice(0, 255) }
  })
}

/** 목록 조회용 선택 값 - 값이 없으면 null 을 돌려준다. */
export function optionalOneOf(value, allowed, message) {
  const item = asString(value).trim()
  if (!item) return null
  if (!allowed.includes(item)) throw ApiError.badRequest(message)
  return item
}

/** 검색어 - 너무 긴 입력은 잘라 낸다. */
export function optionalKeyword(value) {
  const keyword = asString(value).trim()
  return keyword ? keyword.slice(0, 100) : null
}

export function optionalDateKey(value) {
  const dateKey = asString(value).trim()
  if (!dateKey) return null
  if (!isValidDateKey(dateKey)) throw ApiError.badRequest('날짜가 올바르지 않습니다.')
  return dateKey
}

/** 신고 본문을 검증하고 정리된 값을 돌려준다. */
export function requireReportPayload(body = {}) {
  const reason = asString(body.reason).trim()
  if (!REPORT_REASONS.includes(reason)) {
    throw ApiError.badRequest('신고 사유를 선택해 주세요.')
  }

  const detail = asString(body.detail).trim().slice(0, 500)
  return { reason, detail }
}

/** 마이페이지에서 바꾼 닉네임/비밀번호를 검증한다. 바꿀 항목만 담아서 돌려준다. */
export function requireProfilePatch(body = {}) {
  const patch = {}

  if (body.nickname !== undefined) {
    patch.nickname = requireNickname(body.nickname)
  }

  const wantsPasswordChange =
    body.newPassword !== undefined || body.currentPassword !== undefined
  if (wantsPasswordChange) {
    if (!asString(body.currentPassword)) {
      throw ApiError.badRequest('현재 비밀번호를 입력해 주세요.')
    }
    patch.currentPassword = asString(body.currentPassword)
    patch.newPassword = requirePassword(body.newPassword)
  }

  if (Object.keys(patch).length === 0) {
    throw ApiError.badRequest('변경할 내용이 없습니다.')
  }
  return patch
}
