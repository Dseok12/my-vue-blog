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

function asString(value) {
  return typeof value === 'string' ? value : ''
}

export function requireEmail(value) {
  const email = asString(value).trim().toLowerCase()
  if (!email) throw ApiError.badRequest('이메일을 입력해 주세요.')
  if (!EMAIL_PATTERN.test(email)) throw ApiError.badRequest('이메일 형식이 올바르지 않습니다.')
  return email
}

export function requirePassword(value) {
  const password = asString(value)
  if (!password) throw ApiError.badRequest('비밀번호를 입력해 주세요.')
  if (password.length < 8) throw ApiError.badRequest('비밀번호는 8자 이상이어야 합니다.')
  return password
}

export function requireNickname(value) {
  const nickname = asString(value).trim()
  if (!nickname) throw ApiError.badRequest('닉네임을 입력해 주세요.')
  if (nickname.length < 2) throw ApiError.badRequest('닉네임은 2자 이상이어야 합니다.')
  if (nickname.length > 12) throw ApiError.badRequest('닉네임은 12자 이하여야 합니다.')
  return nickname
}

export function requireContent(value, label = '내용') {
  const content = asString(value).trim()
  if (!content) throw ApiError.badRequest(label + '을 입력해 주세요.')
  return content
}

/** 다이어리 작성/수정 본문을 검증하고 정리된 값을 돌려준다. */
export function requireDiaryPayload(body = {}) {
  const title = asString(body.title).trim()
  if (!title) throw ApiError.badRequest('제목을 입력해 주세요.')
  if (title.length > 60) throw ApiError.badRequest('제목은 60자 이하여야 합니다.')

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
