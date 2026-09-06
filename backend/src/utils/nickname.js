/**
 * 닉네임 익명화.
 * 공개된 글/댓글에서는 첫 글자만 보이고 나머지는 * 로 가린다. (예: '데모' -> '데*')
 */
export function maskNickname(nickname) {
  const chars = Array.from(String(nickname || ''))
  if (chars.length <= 1) return chars.join('')
  return chars[0] + '*'.repeat(chars.length - 1)
}

/**
 * 보는 사람에 따라 닉네임을 그대로 보여줄지 가릴지 정한다.
 * - 본인 글/댓글이면 그대로
 * - 관리자면 그대로 (검토를 위해)
 * - 그 외에는 가린다
 */
export function displayNickname(nickname, { isSelf = false, isAdmin = false } = {}) {
  return isSelf || isAdmin ? String(nickname || '') : maskNickname(nickname)
}
