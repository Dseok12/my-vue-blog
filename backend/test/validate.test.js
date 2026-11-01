/** utils/validate.js, utils/date.js 테스트 */
import assert from 'node:assert/strict'
import test from 'node:test'

import { isValidDateKey, toDateKey } from '../src/utils/date.js'
import {
  optionalKeyword,
  optionalOneOf,
  requireDiaryPayload,
  requireEmail,
  requireImages,
  requireNickname,
  requirePassword,
  requireProfilePatch,
  requireReportPayload,
} from '../src/utils/validate.js'

test('이메일은 앞뒤 공백을 지우고 소문자로 정리한다', () => {
  assert.equal(requireEmail('  Demo@Diary.TEST '), 'demo@diary.test')
  assert.throws(() => requireEmail('not-email'), { status: 400 })
})

test('비밀번호 8자, 닉네임 2~12자', () => {
  assert.throws(() => requirePassword('1234567'), { status: 400 })
  assert.equal(requirePassword('12345678'), '12345678')
  assert.throws(() => requireNickname('한'), { status: 400 })
  assert.throws(() => requireNickname('가'.repeat(13)), { status: 400 })
  assert.equal(requireNickname(' 데모 '), '데모')
})

test('다이어리 - 빠진 값은 기본값으로 채운다', () => {
  const payload = requireDiaryPayload({ title: ' 제목 ', content: ' 내용 ', dateKey: '2026-08-30' })
  assert.equal(payload.title, '제목')
  assert.equal(payload.category, 'diary')
  assert.equal(payload.visibility, 'private')
  assert.deepEqual(payload.images, [])
})

test('다이어리 - 목록에 없는 값, 없는 날짜, 60자 넘는 제목은 거절한다', () => {
  const base = { title: '제목', content: '내용', dateKey: '2026-08-30' }
  assert.throws(() => requireDiaryPayload({ ...base, category: 'novel' }), { status: 400 })
  assert.throws(() => requireDiaryPayload({ ...base, visibility: 'friends' }), { status: 400 })
  assert.throws(() => requireDiaryPayload({ ...base, mood: 'hungry' }), { status: 400 })
  assert.throws(() => requireDiaryPayload({ ...base, dateKey: '2026-02-30' }), { status: 400 })
  assert.throws(() => requireDiaryPayload({ ...base, title: '가'.repeat(61) }), { status: 400 })
})

test('이미지는 5장까지', () => {
  const images = (count) => Array.from({ length: count }, (_, i) => ({ url: '/uploads/' + i }))
  assert.equal(requireImages(images(5)).length, 5)
  assert.throws(() => requireImages(images(6)), { status: 400 })
  assert.throws(() => requireImages('not-array'), { status: 400 })
})

test('목록 필터 - 비면 null, 목록에 없으면 400, 검색어는 100자까지', () => {
  assert.equal(optionalOneOf('', ['a'], '틀림'), null)
  assert.throws(() => optionalOneOf('b', ['a'], '틀림'), { status: 400 })
  assert.equal(optionalKeyword('가'.repeat(150)).length, 100)
})

test('신고 사유는 정해진 값만', () => {
  assert.equal(requireReportPayload({ reason: 'scam' }).reason, 'scam')
  assert.throws(() => requireReportPayload({ reason: 'boring' }), { status: 400 })
})

test('프로필 변경 - 비밀번호를 바꾸려면 현재 비밀번호가 필요하다', () => {
  assert.deepEqual(requireProfilePatch({ nickname: '새이름' }), { nickname: '새이름' })
  assert.throws(() => requireProfilePatch({ newPassword: '12345678' }), { status: 400 })
  assert.throws(() => requireProfilePatch({}), { status: 400 })
})

test('날짜 - 존재하지 않는 날짜는 거절하고, 한국 시간 기준으로 정한다', () => {
  assert.equal(isValidDateKey('2026-02-28'), true)
  assert.equal(isValidDateKey('2026-02-30'), false)
  // UTC 2026-08-29 15:30 = KST 2026-08-30 00:30
  assert.equal(toDateKey(new Date('2026-08-29T15:30:00Z')), '2026-08-30')
})
