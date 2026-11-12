/** utils/validators.js, utils/image.js 테스트 */
import { describe, expect, it } from 'vitest'

import { formatBytes, getExtension, validateImageFile } from './image'
import {
  isValid,
  validateContent,
  validateEmail,
  validateNickname,
  validatePassword,
  validatePasswordConfirm,
  validateTitle,
} from './validators'

describe('폼 검증 - 문제가 없으면 빈 문자열', () => {
  it('이메일', () => {
    expect(validateEmail('')).not.toBe('')
    expect(validateEmail('abc')).not.toBe('')
    expect(validateEmail('demo@diary.test')).toBe('')
  })

  it('비밀번호와 확인', () => {
    expect(validatePassword('1234567')).not.toBe('')
    expect(validatePassword('12345678')).toBe('')
    expect(validatePasswordConfirm('12345678', '12345679')).not.toBe('')
    expect(validatePasswordConfirm('12345678', '12345678')).toBe('')
  })

  it('닉네임은 앞뒤 공백을 빼고 2~12자', () => {
    expect(validateNickname(' 한 ')).not.toBe('')
    expect(validateNickname('데모')).toBe('')
    expect(validateNickname('가'.repeat(13))).not.toBe('')
  })

  it('제목은 공백만 있으면 안 된다', () => {
    expect(validateTitle('   ')).not.toBe('')
    expect(validateTitle('오늘')).toBe('')
  })

  it('isValid - 오류 메시지가 하나라도 있으면 false', () => {
    expect(isValid({ email: '', password: '' })).toBe(true)
    expect(isValid({ email: '', password: '8자 이상' })).toBe(false)
  })
})

describe('이미지 검증 - 10MB, jpg/jpeg/png/gif/webp', () => {
  // File 객체 대신 검증에 필요한 값만 가진 객체를 쓴다.
  const file = (name, type, size = 1024) => ({ name, type, size })

  it('허용된 확장자와 형식이면 통과', () => {
    expect(validateImageFile(file('a.JPG', 'image/jpeg'))).toBe('')
    expect(validateImageFile(file('a.webp', 'image/webp'))).toBe('')
  })

  it('확장자나 형식이 다르면 거절', () => {
    expect(validateImageFile(file('a.bmp', 'image/bmp'))).not.toBe('')
    // 이름만 .png 로 바꾼 PDF
    expect(validateImageFile(file('a.png', 'application/pdf'))).not.toBe('')
  })

  it('10MB 를 넘으면 거절', () => {
    expect(validateImageFile(file('a.png', 'image/png', 10 * 1024 * 1024))).toBe('')
    expect(validateImageFile(file('a.png', 'image/png', 10 * 1024 * 1024 + 1))).not.toBe('')
  })

  it('도우미 함수', () => {
    expect(getExtension('photo.final.PNG')).toBe('png')
    expect(getExtension('noext')).toBe('')
    expect(formatBytes(10 * 1024 * 1024)).toBe('10.0MB')
  })
})

describe('입력 실수에 대한 배려와 길이 제한', () => {
  it('이메일 앞뒤 공백은 오류로 보지 않는다', () => {
    expect(validateEmail('  demo@diary.test ')).toBe('')
    expect(validateEmail('   ')).not.toBe('')
  })

  it('내용 20,000자, 비밀번호 72자까지', () => {
    expect(validateContent('가'.repeat(20000))).toBe('')
    expect(validateContent('가'.repeat(20001))).toBe('내용은 20,000자 이하여야 합니다.')
    expect(validatePassword('a'.repeat(72))).toBe('')
    expect(validatePassword('a'.repeat(73))).not.toBe('')
  })
})
