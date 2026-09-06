/**
 * 닉네임 익명화 - 공개 맥락에서 첫 글자만 남기고 나머지를 * 로 가린다.
 * (백엔드 backend/src/utils/nickname.js 와 같은 규칙. mock 구현에서 사용한다)
 */
export function maskNickname(nickname) {
  const chars = Array.from(String(nickname || ''))
  if (chars.length <= 1) return chars.join('')
  return chars[0] + '*'.repeat(chars.length - 1)
}

export function displayNickname(nickname, { isSelf = false, isAdmin = false } = {}) {
  return isSelf || isAdmin ? String(nickname || '') : maskNickname(nickname)
}
