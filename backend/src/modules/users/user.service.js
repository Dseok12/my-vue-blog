/**
 * 회원 프로필 / 마이페이지.
 *
 * - GET  /users/:id          : 프로필 (본인·관리자가 아니면 닉네임을 익명 처리)
 * - GET  /users/:id/diaries  : 그 회원이 쓴 글 (본인·관리자면 전체, 아니면 공개·가림 제외)
 * - PATCH /users/me          : 내 닉네임 / 비밀번호 변경
 */
import bcrypt from 'bcryptjs'

import { execute, queryOne } from '../../db/pool.js'
import { ApiError } from '../../utils/ApiError.js'
import { toIso } from '../../utils/date.js'
import { displayNickname } from '../../utils/nickname.js'
import { requireProfilePatch } from '../../utils/validate.js'
import { hashPassword, toPublicUser } from '../auth/auth.service.js'
import * as diaryService from '../diaries/diary.service.js'

async function findUserOrFail(userId) {
  const row = await queryOne(
    'SELECT id, email, nickname, password_hash, created_at FROM users WHERE id = ?',
    [userId],
  )
  if (!row) throw ApiError.notFound('회원을 찾을 수 없습니다.')
  return row
}

export async function getProfile(viewer, userId) {
  const row = await findUserOrFail(userId)
  const isMe = row.id === viewer.id
  const seesAll = isMe || viewer.isAdmin

  const countRow = seesAll
    ? await queryOne('SELECT COUNT(*) AS count FROM diaries WHERE author_id = ?', [userId])
    : await queryOne(
        "SELECT COUNT(*) AS count FROM diaries" +
          " WHERE author_id = ? AND visibility = 'public' AND is_hidden = 0",
        [userId],
      )

  return {
    user: {
      id: row.id,
      nickname: displayNickname(row.nickname, { isSelf: isMe, isAdmin: viewer.isAdmin }),
      joinedAt: toIso(row.created_at),
      diaryCount: Number(countRow.count),
    },
    isMe,
  }
}

export async function listDiaries(viewer, userId, params) {
  await findUserOrFail(userId)
  return diaryService.listByAuthor(viewer, userId, params)
}

export async function updateMe(viewer, body) {
  const patch = requireProfilePatch(body)
  const current = await findUserOrFail(viewer.id)

  const sets = []
  const values = []

  if (patch.nickname && patch.nickname !== current.nickname) {
    const owner = await queryOne('SELECT id FROM users WHERE nickname = ? AND id <> ?', [
      patch.nickname,
      viewer.id,
    ])
    if (owner) throw ApiError.conflict('이미 사용 중인 닉네임입니다.')
    sets.push('nickname = ?')
    values.push(patch.nickname)
  }

  if (patch.newPassword) {
    const matched = await bcrypt.compare(patch.currentPassword, current.password_hash)
    if (!matched) throw ApiError.badRequest('현재 비밀번호가 올바르지 않습니다.')

    const same = await bcrypt.compare(patch.newPassword, current.password_hash)
    if (same) throw ApiError.badRequest('새 비밀번호가 기존 비밀번호와 같습니다.')

    sets.push('password_hash = ?')
    values.push(await hashPassword(patch.newPassword))
  }

  if (sets.length === 0) throw ApiError.badRequest('변경할 내용이 없습니다.')

  values.push(viewer.id)
  await execute('UPDATE users SET ' + sets.join(', ') + ' WHERE id = ?', values)

  const updated = await queryOne(
    'SELECT id, email, nickname, created_at FROM users WHERE id = ?',
    [viewer.id],
  )
  return { user: toPublicUser(updated) }
}
