/** 회원가입 / 로그인 처리 */
import bcrypt from 'bcryptjs'

import { createToken } from '../../middlewares/auth.js'
import { execute, queryOne } from '../../db/pool.js'
import { ApiError } from '../../utils/ApiError.js'
import { toIso } from '../../utils/date.js'
import { newId } from '../../utils/id.js'
import { config } from '../../config/index.js'
import { requireEmail, requireNickname, requirePassword } from '../../utils/validate.js'

export const SALT_ROUNDS = 10

export function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

/** 비밀번호처럼 밖으로 나가면 안 되는 값을 걸러 낸다. */
export function toPublicUser(row) {
  if (!row) return null
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    createdAt: toIso(row.created_at),
    isAdmin:
      row.isAdmin ?? config.adminEmails.includes(String(row.email).toLowerCase()),
  }
}

export async function signup(body = {}) {
  const email = requireEmail(body.email)
  const nickname = requireNickname(body.nickname)
  const password = requirePassword(body.password)

  const emailOwner = await queryOne('SELECT id FROM users WHERE email = ?', [email])
  if (emailOwner) throw ApiError.conflict('이미 가입된 이메일입니다.')

  const nicknameOwner = await queryOne('SELECT id FROM users WHERE nickname = ?', [nickname])
  if (nicknameOwner) throw ApiError.conflict('이미 사용 중인 닉네임입니다.')

  const id = newId()
  const createdAt = new Date()
  const passwordHash = await hashPassword(password)

  await execute(
    'INSERT INTO users (id, email, nickname, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, email, nickname, passwordHash, createdAt],
  )

  return {
    user: toPublicUser({ id, email, nickname, created_at: createdAt }),
    token: createToken(id),
  }
}

export async function login(body = {}) {
  const email = requireEmail(body.email)
  const password = String(body.password || '')

  const row = await queryOne(
    'SELECT id, email, nickname, password_hash, created_at FROM users WHERE email = ?',
    [email],
  )

  // 이메일이 없을 때와 비밀번호가 틀릴 때의 응답을 같게 해서 계정 존재 여부를 숨긴다.
  const matched = row ? await bcrypt.compare(password, row.password_hash) : false
  if (!matched) throw ApiError.unauthorized('이메일 또는 비밀번호가 올바르지 않습니다.')

  return { user: toPublicUser(row), token: createToken(row.id) }
}
