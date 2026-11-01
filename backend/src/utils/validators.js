/**
 * 요청 값 검증 - 프론트엔드 utils/validators.js 와 같은 규칙을 사용한다.
 * 문제가 있으면 400 ApiError 를 던지고, 통과하면 정리된 값을 돌려준다.
 */
const ApiError = require('./ApiError')
const { isValidDateKey, todayKey } = require('./date')

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const CATEGORIES = ['diary', 'book', 'emotion']
const MOODS = ['happy', 'calm', 'tired', 'sad', 'angry', 'excited']
const VISIBILITIES = ['public', 'private']
const IMAGE_MAX_COUNT = 5

const asText = (value) => (typeof value === 'string' ? value.trim() : '')

/** 이메일 - 소문자로 정리해서 반환한다. */
function parseEmail(value) {
  const email = asText(value).toLowerCase()
  if (!email) throw ApiError.badRequest('이메일을 입력해 주세요.')
  if (!EMAIL_PATTERN.test(email)) throw ApiError.badRequest('이메일 형식이 올바르지 않습니다.')
  if (email.length > 255) throw ApiError.badRequest('이메일이 너무 깁니다.')
  return email
}

function parsePassword(value) {
  const password = typeof value === 'string' ? value : ''
  if (!password) throw ApiError.badRequest('비밀번호를 입력해 주세요.')
  if (password.length < 8) throw ApiError.badRequest('비밀번호는 8자 이상이어야 합니다.')
  if (password.length > 72) throw ApiError.badRequest('비밀번호는 72자 이하여야 합니다.')
  return password
}

function parseNickname(value) {
  const nickname = asText(value)
  if (!nickname) throw ApiError.badRequest('닉네임을 입력해 주세요.')
  if (nickname.length < 2) throw ApiError.badRequest('닉네임은 2자 이상이어야 합니다.')
  if (nickname.length > 12) throw ApiError.badRequest('닉네임은 12자 이하여야 합니다.')
  return nickname
}

/** 목록에 있는 값인지 확인한다. 값이 없으면 기본값을 쓴다. */
function parseEnum(value, allowed, { field, fallback = null, required = true }) {
  const text = asText(value)
  if (!text) {
    if (required && fallback === null) throw ApiError.badRequest(field + ' 값을 선택해 주세요.')
    return fallback === null ? '' : fallback
  }
  if (!allowed.includes(text)) throw ApiError.badRequest(field + ' 값이 올바르지 않습니다.')
  return text
}

/** 목록 조회용 - 값이 없으면 빈 문자열(= 조건 없음) */
function parseOptionalEnum(value, allowed, field) {
  return parseEnum(value, allowed, { field, fallback: '', required: false })
}

function parseDateKey(value, { fallbackToday = false } = {}) {
  const dateKey = asText(value)
  if (!dateKey) {
    if (fallbackToday) return todayKey()
    throw ApiError.badRequest('날짜를 선택해 주세요.')
  }
  if (!isValidDateKey(dateKey)) throw ApiError.badRequest('날짜 형식이 올바르지 않습니다.')
  return dateKey
}

/** [{ url, name }] 형태로 정리한다. */
function parseImages(value) {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) throw ApiError.badRequest('이미지 목록 형식이 올바르지 않습니다.')
  if (value.length > IMAGE_MAX_COUNT) {
    throw ApiError.badRequest('이미지는 최대 ' + IMAGE_MAX_COUNT + '장까지 첨부할 수 있습니다.')
  }

  return value.map((image) => {
    const url = asText(image && image.url)
    if (!url) throw ApiError.badRequest('이미지 주소가 비어 있습니다.')
    if (url.length > 512) throw ApiError.badRequest('이미지 주소가 너무 깁니다.')
    return { url, name: asText(image && image.name).slice(0, 255) || '이미지' }
  })
}

/** 회원가입 요청 */
function parseSignupPayload(body = {}) {
  return {
    email: parseEmail(body.email),
    nickname: parseNickname(body.nickname),
    password: parsePassword(body.password),
  }
}

/** 로그인 요청 - 형식이 틀려도 "이메일 또는 비밀번호" 오류로 통일한다. */
function parseLoginPayload(body = {}) {
  const email = asText(body.email).toLowerCase()
  const password = typeof body.password === 'string' ? body.password : ''
  if (!email || !password) {
    throw ApiError.badRequest('이메일과 비밀번호를 입력해 주세요.')
  }
  return { email, password }
}

/** 다이어리 작성 / 수정 요청 */
function parseDiaryPayload(body = {}) {
  const title = asText(body.title)
  const content = asText(body.content)

  if (!title) throw ApiError.badRequest('제목을 입력해 주세요.')
  if (title.length > 60) throw ApiError.badRequest('제목은 60자 이하여야 합니다.')
  if (!content) throw ApiError.badRequest('내용을 입력해 주세요.')
  if (content.length > 20000) throw ApiError.badRequest('내용이 너무 깁니다.')

  return {
    title,
    content,
    category: parseEnum(body.category, CATEGORIES, { field: '종류', fallback: 'diary' }),
    mood: parseEnum(body.mood, MOODS, { field: '감정', fallback: '', required: false }),
    dateKey: parseDateKey(body.dateKey, { fallbackToday: true }),
    visibility: parseEnum(body.visibility, VISIBILITIES, {
      field: '공개 여부',
      fallback: 'private',
    }),
    images: parseImages(body.images),
  }
}

/** 댓글 작성 요청 */
function parseCommentPayload(body = {}) {
  const content = asText(body.content)
  if (!content) throw ApiError.badRequest('댓글 내용을 입력해 주세요.')
  if (content.length > 1000) throw ApiError.badRequest('댓글은 1000자 이하여야 합니다.')

  // 숫자(7)로 와도 문자열('7')로 와도 같은 값으로 취급한다.
  const parentId =
    body.parentId === undefined || body.parentId === null ? null : String(body.parentId).trim()
  if (parentId !== null && !/^\d+$/.test(parentId)) {
    throw ApiError.badRequest('원본 댓글 정보가 올바르지 않습니다.')
  }
  return { content, parentId }
}

/** URL 의 :id 처럼 숫자만 허용되는 값 */
function parseId(value, message = '잘못된 요청입니다.') {
  const id = asText(value)
  if (!/^\d+$/.test(id)) throw ApiError.notFound(message)
  return id
}

/** 월별 조회용 year, month */
function parseYearMonth(query = {}) {
  const year = Number(query.year)
  const month = Number(query.month)
  if (!Number.isInteger(year) || year < 1970 || year > 9999) {
    throw ApiError.badRequest('연도가 올바르지 않습니다.')
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw ApiError.badRequest('월이 올바르지 않습니다.')
  }
  return { year, month }
}

/** 검색어 - 길이만 잘라서 사용한다. */
function parseKeyword(value) {
  return asText(value).slice(0, 100)
}

module.exports = {
  CATEGORIES,
  MOODS,
  VISIBILITIES,
  IMAGE_MAX_COUNT,
  parseSignupPayload,
  parseLoginPayload,
  parseDiaryPayload,
  parseCommentPayload,
  parseOptionalEnum,
  parseDateKey,
  parseId,
  parseYearMonth,
  parseKeyword,
}
