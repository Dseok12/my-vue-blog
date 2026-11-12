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

/** 없는 계정으로 로그인할 때 비교에 쓰는 가짜 해시. (어떤 비밀번호와도 맞지 않는다) */
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS)

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
  // 응답 "시간"도 같아야 하므로, 계정이 없어도 가짜 해시와 비교해 같은 만큼 시간을 쓴다.
  const matched = await bcrypt.compare(password, row ? row.password_hash : DUMMY_HASH)
  if (!row) throw ApiError.unauthorized('이메일 또는 비밀번호가 올바르지 않습니다.')
  if (!matched) throw ApiError.unauthorized('이메일 또는 비밀번호가 올바르지 않습니다.')

  return { user: toPublicUser(row), token: createToken(row.id) }
}
