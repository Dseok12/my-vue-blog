/** utils/validators.js, utils/date.js 테스트 */
const test = require('node:test')
const assert = require('node:assert/strict')

const {
  parseCommentPayload,
  parseDiaryPayload,
  parseId,
  parseSignupPayload,
  parseYearMonth,
} = require('../src/utils/validators')
const { isValidDateKey, toDateKey } = require('../src/utils/date')

test('회원가입 - 이메일은 소문자로 정리한다', () => {
  const payload = parseSignupPayload({
    email: '  Demo@Diary.TEST ',
    nickname: '데모',
    password: 'demo1234',
  })
  assert.equal(payload.email, 'demo@diary.test')
})

test('회원가입 - 규칙을 어기면 400', () => {
  const valid = { email: 'a@b.cd', nickname: '데모', password: 'demo1234' }
  const broken = [
    { ...valid, email: 'not-email' },
    { ...valid, nickname: '한' },
    { ...valid, nickname: '열세글자가넘는아주긴닉네임' },
    { ...valid, password: 'short' },
  ]
  broken.forEach((body) => assert.throws(() => parseSignupPayload(body), { status: 400 }))
})

test('다이어리 - 빠진 값은 기본값으로 채운다', () => {
  const payload = parseDiaryPayload({ title: ' 제목 ', content: ' 내용 ' })
  assert.equal(payload.title, '제목')
  assert.equal(payload.category, 'diary')
  assert.equal(payload.visibility, 'private')
  assert.equal(payload.mood, '')
  assert.deepEqual(payload.images, [])
  assert.ok(isValidDateKey(payload.dateKey))
})

test('다이어리 - 목록에 없는 값과 이미지 6장은 거절한다', () => {
  const base = { title: '제목', content: '내용' }
  assert.throws(() => parseDiaryPayload({ ...base, category: 'novel' }), { status: 400 })
  assert.throws(() => parseDiaryPayload({ ...base, visibility: 'friends' }), { status: 400 })

  const images = Array.from({ length: 6 }, (_, index) => ({ url: '/a' + index, name: 'a' }))
  assert.throws(() => parseDiaryPayload({ ...base, images }), { status: 400 })
})

test('댓글 - parentId 는 숫자 문자열 또는 null', () => {
  assert.equal(parseCommentPayload({ content: '안녕' }).parentId, null)
  assert.equal(parseCommentPayload({ content: '안녕', parentId: 7 }).parentId, '7')
  assert.throws(() => parseCommentPayload({ content: '안녕', parentId: 'x' }), { status: 400 })
})

test('parseId - 숫자가 아니면 404', () => {
  assert.equal(parseId('12'), '12')
  assert.throws(() => parseId('12abc'), { status: 404 })
})

test('parseYearMonth - 범위를 확인한다', () => {
  assert.deepEqual(parseYearMonth({ year: '2026', month: '8' }), { year: 2026, month: 8 })
  assert.throws(() => parseYearMonth({ year: '2026', month: '13' }), { status: 400 })
})

test('날짜 - 존재하지 않는 날짜는 거절한다', () => {
  assert.equal(isValidDateKey('2026-02-28'), true)
  assert.equal(isValidDateKey('2026-02-30'), false)
  assert.equal(isValidDateKey('2026-2-1'), false)
})

test('날짜 - 한국 시간 기준으로 날짜를 정한다', () => {
  // UTC 2026-08-29 15:30 = KST 2026-08-30 00:30
  assert.equal(toDateKey(new Date('2026-08-29T15:30:00Z')), '2026-08-30')
  assert.equal(toDateKey(new Date('2026-08-29T14:59:00Z')), '2026-08-29')
})
